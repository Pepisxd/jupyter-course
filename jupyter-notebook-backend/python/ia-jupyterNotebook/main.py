import json
import os
import re
from functools import lru_cache
from typing import Any, Dict, List

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig


BASE_MODEL = os.getenv("BASE_MODEL", "Qwen/Qwen3-4B-Instruct-2507")
LORA_PATH = os.getenv("LORA_PATH", "./qwen3-jupyter-lora")
MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "128"))

app = FastAPI(title="Jupyter Exercise AI", version="1.0.0")


class ExerciseRequest(BaseModel):
    topic: str = Field(..., examples=["pandas"])
    difficulty: str = Field(..., examples=["basica"])
    exerciseType: str = Field(..., examples=["completar_codigo"])
    datasetSize: str = Field(..., examples=["pequeno"])


def build_prompt(payload: ExerciseRequest) -> str:
    return "\n".join(
        [
            "You are an expert instructor creating beginner-friendly Jupyter exercises.",
            "Return ONLY valid JSON, no markdown fences, no extra commentary.",
            "Use exactly this schema:",
            '{"title":"...","instructions":"...","starterCode":"...","solutionCode":"...","expectedOutput":"...","hints":["...","..."],"files":[{"filename":"...","description":"...","columns":["..."]}],"steps":["...","..."],"acceptanceCriteria":["...","..."]}',
            "All text must be in Spanish. hints must be an array with 2 to 4 items.",
            "",
            f"- topic: {payload.topic}",
            f"- difficulty: {payload.difficulty}",
            f"- exerciseType: {payload.exerciseType}",
            f"- datasetSize: {payload.datasetSize}",
        ]
    )


def parse_json_response(raw_text: str) -> Dict[str, Any]:
    text = raw_text.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Model output is not valid JSON.")
    parsed = json.loads(text[start : end + 1])
    required = [
        "title",
        "instructions",
        "starterCode",
        "solutionCode",
        "expectedOutput",
        "hints",
    ]
    for key in required:
        if key not in parsed:
            raise ValueError(f"Missing key in JSON: {key}")
    if not isinstance(parsed["hints"], list):
        raise ValueError("hints must be an array")
    parsed.setdefault("files", [])
    parsed.setdefault("steps", [])
    parsed.setdefault("acceptanceCriteria", [])
    return parsed


def infer_columns_from_topic(topic: str) -> List[str]:
    if topic == "pandas" or topic == "analisis_datos":
        return ["id", "fecha", "categoria", "ventas", "costo"]
    if topic == "numpy":
        return ["vector_a", "vector_b"]
    if topic == "ml_basico":
        return ["x1", "x2", "target"]
    return ["valor_1", "valor_2", "resultado"]


def parse_key_value_response(raw_text: str) -> Dict[str, str]:
    data: Dict[str, str] = {}
    for line in raw_text.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        # Accept lines like "- key: value" or "key: value"
        normalized = re.sub(r"^-+\s*", "", line)
        key, value = normalized.split(":", 1)
        data[key.strip()] = value.strip()
    return data


def build_fallback_exercise(
    payload: ExerciseRequest, raw_data: Dict[str, str] | None = None
) -> Dict[str, Any]:
    raw_data = raw_data or {}
    dataset_description = raw_data.get(
        "datasetDescription", f"Dataset sintetico para {payload.topic}."
    )
    dataset_rows = {"pequeno": "40", "mediano": "250", "grande": "1200"}.get(
        payload.datasetSize, "40"
    )
    columns = infer_columns_from_topic(payload.topic)
    starter_code = (
        "import pandas as pd\n\n"
        "df = pd.read_csv('datos_practica.csv')\n"
        "# TODO: completa la solucion\n"
        "df.head()\n"
    )
    solution_code = (
        "import pandas as pd\n\n"
        "df = pd.read_csv('datos_practica.csv')\n"
        "resumen = df.groupby('categoria')['ventas'].mean().sort_values(ascending=False)\n"
        "print(resumen)\n"
    )
    if payload.topic == "numpy":
        starter_code = (
            "import numpy as np\n\n"
            "a = np.array([2, 4, 6, 8])\n"
            "b = np.array([1, 3, 5, 7])\n"
            "# TODO: calcula suma, media y desviacion\n"
        )
        solution_code = (
            "import numpy as np\n\n"
            "a = np.array([2, 4, 6, 8])\n"
            "b = np.array([1, 3, 5, 7])\n"
            "suma = a + b\n"
            "print('suma:', suma)\n"
            "print('media de suma:', np.mean(suma))\n"
            "print('desviacion:', np.std(suma))\n"
        )

    return {
        "title": f"Ejercicio de {payload.topic} ({payload.difficulty})",
        "instructions": "\n".join(
            [
                f"Practica {payload.topic} con dificultad {payload.difficulty}.",
                f"Tipo de actividad: {payload.exerciseType}.",
                f"Trabaja con un dataset de tamano {payload.datasetSize} (~{dataset_rows} filas).",
                f"Contexto del archivo: {dataset_description}",
            ]
        ),
        "starterCode": starter_code,
        "solutionCode": solution_code,
        "expectedOutput": "Un resultado tabular o numerico coherente con los pasos indicados.",
        "hints": [
            "Verifica que el archivo cargue sin columnas nulas inesperadas.",
            "Descompone el problema en pasos pequenos y validables.",
            "Compara tu salida con el criterio de aceptacion.",
        ],
        "files": [
            {
                "filename": "datos_practica.csv",
                "description": dataset_description,
                "columns": columns,
            }
        ],
        "steps": [
            "Carga el archivo de datos y revisa columnas y tipos.",
            "Aplica la operacion solicitada segun el tema.",
            "Muestra la salida final y valida que sea consistente.",
        ],
        "acceptanceCriteria": [
            "El codigo se ejecuta sin errores.",
            "La salida cumple el objetivo del ejercicio.",
            "El resultado usa correctamente las columnas esperadas.",
        ],
    }


@lru_cache(maxsize=1)
def load_pipeline():
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        device_map="auto",
        quantization_config=bnb_config,
        dtype=torch.float16,
    )
    model = PeftModel.from_pretrained(base_model, LORA_PATH)
    model.eval()
    return tokenizer, model


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/generate")
def generate(payload: ExerciseRequest):
    try:
        tokenizer, model = load_pipeline()
        prompt = build_prompt(payload)
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        raw_output = ""
        for attempt in range(2):
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            with torch.inference_mode():
                output = model.generate(
                    **inputs,
                    max_new_tokens=MAX_NEW_TOKENS,
                    temperature=0.2 if attempt else 0.7,
                    top_p=0.9 if attempt else 0.8,
                    do_sample=True,
                    eos_token_id=tokenizer.eos_token_id,
                    pad_token_id=tokenizer.pad_token_id,
                )
            prompt_len = inputs["input_ids"].shape[-1]
            generated_tokens = output[0][prompt_len:]
            raw_output = tokenizer.decode(generated_tokens, skip_special_tokens=True)
            try:
                response = parse_json_response(raw_output)
                return {"exercise": response}
            except ValueError:
                continue
        parsed_kv = parse_key_value_response(raw_output)
        fallback = build_fallback_exercise(payload, parsed_kv)
        return {
            "exercise": fallback,
            "meta": {
                "fallback": True,
                "reason": "invalid_json_from_model",
                "rawPreview": raw_output[:250],
            },
        }
    except Exception as err:
        if "out of memory" in str(err).lower():
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            raise HTTPException(
                status_code=503,
                detail="GPU sin memoria. Baja MAX_NEW_TOKENS o usa un modelo mas pequeno.",
            ) from err
        raise HTTPException(status_code=500, detail=str(err)) from err
