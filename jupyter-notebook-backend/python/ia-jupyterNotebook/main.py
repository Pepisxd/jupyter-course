import json
import os
import random
import re
import unicodedata
from collections import deque
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
GENERATION_MODE = os.getenv("GENERATION_MODE", "template").lower()

JSON_SCHEMA = (
    '{"title":"...","instructions":"...","starterCode":"...","solutionCode":"...",'
    '"expectedOutput":"...","hints":["..."],'
    '"files":[{"filename":"...","description":"...","columns":["..."]}],'
    '"steps":["..."],"acceptanceCriteria":["..."]}'
)

DEFAULT_COLUMNS = ["id", "fecha", "categoria", "ventas", "costo"]
HISTORY_MAX = int(os.getenv("TASK_HISTORY_MAX", "50"))
_recent_tasks = deque(maxlen=HISTORY_MAX)
MAX_JSON_FIX_TOKENS = int(os.getenv("MAX_JSON_FIX_TOKENS", "320"))
MAX_JSON_FIX_ATTEMPTS = int(os.getenv("MAX_JSON_FIX_ATTEMPTS", "3"))

TASK_BANK: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "pandas": {
        "basica": [
            {
                "id": "pd_basic_mean",
                "task": "calcular el promedio de ventas por categoria",
                "required_ops": ["groupby", "mean", "sort_values"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
resumen = df.groupby('categoria')['ventas'].mean().sort_values(ascending=False)
print(resumen)
""",
                "expected": "Serie con promedio de ventas por categoria ordenada.",
            },
            {
                "id": "pd_basic_count",
                "task": "contar registros por categoria y mostrar el top 3",
                "required_ops": ["value_counts", "head"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
top = df['categoria'].value_counts().head(3)
print(top)
""",
                "expected": "Conteo por categoria con top 3.",
            },
            {
                "id": "pd_basic_filter",
                "task": "filtrar ventas mayores a 500 y mostrar 5 filas",
                "required_ops": ["filter", "head"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
filtro = df[df['ventas'] > 500]
print(filtro.head(5))
""",
                "expected": "Tabla filtrada con ventas > 500.",
            },
        ],
        "intermedia": [
            {
                "id": "pd_mid_median",
                "task": "filtrar por ventas mayores a la mediana y calcular mediana por categoria",
                "required_ops": ["median", "filter", "groupby"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
filtrado = df[df['ventas'] > df['ventas'].median()]
resumen = filtrado.groupby('categoria')['ventas'].median().sort_values(ascending=False)
print(resumen)
""",
                "expected": "Mediana por categoria sobre filas filtradas.",
            },
            {
                "id": "pd_mid_margin",
                "task": "calcular margen (ventas - costo) y promedio por categoria",
                "required_ops": ["assign", "groupby", "mean"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
df = df.assign(margen=df['ventas'] - df['costo'])
resumen = df.groupby('categoria')['margen'].mean().sort_values(ascending=False)
print(resumen)
""",
                "expected": "Promedio de margen por categoria.",
            },
            {
                "id": "pd_mid_date",
                "task": "convertir fecha y calcular ventas promedio por mes",
                "required_ops": ["to_datetime", "dt.month", "groupby"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
df['fecha'] = pd.to_datetime(df['fecha'])
df['mes'] = df['fecha'].dt.month
resumen = df.groupby('mes')['ventas'].mean().sort_values(ascending=False)
print(resumen)
""",
                "expected": "Promedio de ventas por mes.",
            },
        ],
        "avanzada": [
            {
                "id": "pd_adv_pivot",
                "task": "crear tabla dinamica de ventas por categoria y mes",
                "required_ops": ["pivot_table", "to_datetime", "dt.month"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
df['fecha'] = pd.to_datetime(df['fecha'])
df['mes'] = df['fecha'].dt.month
pivot = pd.pivot_table(df, values='ventas', index='categoria', columns='mes', aggfunc='sum')
print(pivot)
""",
                "expected": "Tabla dinamica con ventas por categoria y mes.",
            },
            {
                "id": "pd_adv_rank",
                "task": "calcular ranking de ventas por categoria y filtrar top 2 por categoria",
                "required_ops": ["groupby", "rank", "sort_values"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
df['rank'] = df.groupby('categoria')['ventas'].rank(method='dense', ascending=False)
top = df[df['rank'] <= 2].sort_values(['categoria', 'rank'])
print(top)
""",
                "expected": "Top 2 ventas por categoria con ranking.",
            },
            {
                "id": "pd_adv_merge",
                "task": "crear resumen de ventas por categoria y unir con costos promedio",
                "required_ops": ["groupby", "merge"],
                "starter": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
""",
                "solution": """import pandas as pd

df = pd.read_csv('datos_practica.csv')
ventas = df.groupby('categoria', as_index=False)['ventas'].sum()
costos = df.groupby('categoria', as_index=False)['costo'].mean()
resumen = ventas.merge(costos, on='categoria').sort_values('ventas', ascending=False)
print(resumen)
""",
                "expected": "Tabla con ventas totales y costo promedio por categoria.",
            },
        ],
    },
    "numpy": {
        "basica": [
            {
                "id": "np_basic_stats",
                "task": "calcular media y desviacion estandar por columna",
                "required_ops": ["mean", "std"],
            },
        ],
        "intermedia": [
            {
                "id": "np_mid_norm",
                "task": "normalizar columnas numericas con min-max",
                "required_ops": ["min", "max"],
            },
        ],
        "avanzada": [
            {
                "id": "np_adv_zscore",
                "task": "calcular z-score por columna y contar outliers",
                "required_ops": ["mean", "std", "abs"],
            },
        ],
    },
    "markdown": {
        "basica": [{"id": "md_basic", "task": "redactar un reporte corto en Markdown", "required_ops": []}],
        "intermedia": [{"id": "md_mid", "task": "crear un reporte con tabla y lista de hallazgos", "required_ops": []}],
        "avanzada": [{"id": "md_adv", "task": "escribir un informe con conclusiones y limites del analisis", "required_ops": []}],
    },
    "general": {
        "basica": [{"id": "gen_basic", "task": "resolver un problema basico con funciones", "required_ops": []}],
        "intermedia": [{"id": "gen_mid", "task": "usar listas y condicionales para filtrar datos", "required_ops": []}],
        "avanzada": [{"id": "gen_adv", "task": "implementar validacion y manejo de errores", "required_ops": []}],
    },
}

app = FastAPI(title="Jupyter Exercise AI", version="1.0.0")


class ExerciseRequest(BaseModel):
    topic: str = Field(..., examples=["pandas"])
    difficulty: str = Field(..., examples=["basica"])
    exerciseType: str = Field(..., examples=["completar_codigo"])
    datasetSize: str = Field(..., examples=["pequeno"])


def _norm(value: str) -> str:
    value = value.strip().lower()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return value


def _dataset_rows(size: str) -> int:
    size = _norm(size)
    return {"pequeno": 40, "mediano": 200, "grande": 1000}.get(size, 40)


def _difficulty_tier(difficulty: str) -> str:
    difficulty = _norm(difficulty)
    if difficulty in ("basica", "basico", "principiante"):
        return "basica"
    if difficulty in ("intermedia", "medio", "media"):
        return "intermedia"
    if difficulty in ("avanzada", "avanzado"):
        return "avanzada"
    return "basica"


def _dataset_description(topic: str) -> str:
    topic = _norm(topic)
    if "pandas" in topic or "analisis" in topic:
        return "Dataset de ventas de productos en una tienda online"
    if "numpy" in topic:
        return "Dataset numerico de mediciones de sensores"
    if "markdown" in topic:
        return "Plantilla de informe tecnico en Markdown"
    return "Dataset sintetico para practica"


def _task_key(payload: ExerciseRequest) -> str:
    return f"{_norm(payload.topic)}::{_difficulty_tier(payload.difficulty)}::{_norm(payload.exerciseType)}"


def _register_task(task_key: str, task_id: str) -> None:
    _recent_tasks.append((task_key, task_id))


def _is_recent(task_key: str, task_id: str) -> bool:
    return any(key == task_key and tid == task_id for key, tid in _recent_tasks)


def _pick_task(payload: ExerciseRequest) -> Dict[str, Any]:
    topic = _norm(payload.topic)
    difficulty = _difficulty_tier(payload.difficulty)
    bank = TASK_BANK.get(topic, TASK_BANK["general"]).get(difficulty, [])
    if not bank:
        return TASK_BANK["general"]["basica"][0]
    task_key = _task_key(payload)
    candidates = [t for t in bank if not _is_recent(task_key, t["id"])]
    choice = random.choice(candidates if candidates else bank)
    _register_task(task_key, choice["id"])
    return choice


def build_prompt(payload: ExerciseRequest, task_spec: Dict[str, Any]) -> str:
    dataset_rows = _dataset_rows(payload.datasetSize)
    dataset_description = _dataset_description(payload.topic)
    difficulty = _difficulty_tier(payload.difficulty)
    return "\n".join(
        [
            "You are an expert instructor creating beginner-friendly Jupyter exercises.",
            "Return ONLY valid JSON, no markdown fences, no extra commentary.",
            "All text must be in Spanish.",
            "Use exactly this schema (no extra keys):",
            JSON_SCHEMA,
            "Use \\\\n for line breaks inside the instructions field.",
            "Difficulty rubric:",
            "- basica: 1 paso principal, 1 transformacion simple.",
            "- intermedia: 2-3 pasos, incluye filtro + agregacion.",
            "- avanzada: 3-4 pasos, incluye pivot o merge y validacion.",
            "The solution MUST reflect the difficulty rubric.",
            f"topic: {payload.topic}",
            f"difficulty: {difficulty}",
            f"exerciseType: {payload.exerciseType}",
            f"datasetSize: {payload.datasetSize}",
            f"datasetDescription: {dataset_description}",
            f"datasetColumns: {', '.join(DEFAULT_COLUMNS)}",
            f"datasetRows: {dataset_rows}",
            f"taskFocus: {task_spec.get('task', '')}",
            f"requiredOps: {', '.join(task_spec.get('required_ops', []))}",
            "Output must be a single JSON object and nothing else.",
        ]
    )


def parse_json_response(text: str) -> Dict[str, Any]:
    cleaned = re.sub(r"```.*?```", "", text, flags=re.S).strip()
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("no_json_object")
    payload = json.loads(cleaned[start : end + 1])
    if not isinstance(payload, dict):
        raise ValueError("json_not_object")
    if "exercise" in payload and isinstance(payload["exercise"], dict):
        payload = payload["exercise"]
    if "title" not in payload:
        raise ValueError("missing_title")
    return payload


def _extract_json_blob(text: str) -> str:
    cleaned = re.sub(r"```.*?```", "", text, flags=re.S).strip()
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return ""
    return cleaned[start : end + 1]


def _fix_json_with_model(
    tokenizer, model, raw_text: str, schema: str = JSON_SCHEMA
) -> str:
    fix_prompt = "\n".join(
        [
            "You are a strict JSON fixer.",
            "Return ONLY valid JSON, no commentary, no markdown.",
            "Only one JSON object is allowed. No extra keys.",
            "Do not include trailing commas.",
            "Fix the following output to match the schema exactly:",
            schema,
            "Broken output:",
            raw_text.strip(),
        ]
    )
    inputs = tokenizer(fix_prompt, return_tensors="pt").to(model.device)
    with torch.inference_mode():
        output = model.generate(
            **inputs,
            max_new_tokens=MAX_JSON_FIX_TOKENS,
            temperature=0.1,
            top_p=0.7,
            top_k=50,
            do_sample=True,
            repetition_penalty=1.08,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.pad_token_id,
            num_beams=1,
            early_stopping=True,
        )
    prompt_len = inputs["input_ids"].shape[-1]
    generated_tokens = output[0][prompt_len:]
    return tokenizer.decode(generated_tokens, skip_special_tokens=True)


def parse_key_value_response(text: str) -> Dict[str, str]:
    kv: Dict[str, str] = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        if line.startswith("-"):
            line = line[1:].strip()
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if key:
            kv[key] = value
    return kv


def build_fallback_exercise(
    payload: ExerciseRequest, kv: Dict[str, str], task_spec: Dict[str, Any] | None = None
) -> Dict[str, Any]:
    topic = _norm(payload.topic)
    difficulty = _difficulty_tier(payload.difficulty)
    exercise_type = _norm(payload.exerciseType)
    dataset_rows = _dataset_rows(payload.datasetSize)
    dataset_description = kv.get("datasetDescription") or _dataset_description(payload.topic)
    columns = DEFAULT_COLUMNS
    task_spec = task_spec or {}

    base_instructions = [
        f"Practica {payload.topic} con dificultad {payload.difficulty}.",
        f"Tipo de actividad: {payload.exerciseType}.",
        f"Trabaja con un dataset de tamano {payload.datasetSize} (~{dataset_rows} filas).",
        f"Contexto del archivo: {dataset_description}.",
    ]

    if "pandas" in topic:
        task = task_spec.get("task", "calcular el promedio de ventas por categoria")
        starter = task_spec.get(
            "starter",
            """import pandas as pd

df = pd.read_csv('datos_practica.csv')
# TODO: completa la solucion
# Pista: {task}
""".format(task=task),
        )
        solution = task_spec.get(
            "solution",
            """import pandas as pd

df = pd.read_csv('datos_practica.csv')
resumen = df.groupby('categoria')['ventas'].mean().sort_values(ascending=False)
print(resumen)
""",
        )
        expected = task_spec.get("expected", "Resultado tabular con el resumen solicitado.")
    elif "numpy" in topic:
        task = task_spec.get("task", "calcular media y desviacion estandar por columna")
        starter = task_spec.get(
            "starter",
            """import numpy as np
import pandas as pd

df = pd.read_csv('datos_practica.csv')
arr = df.select_dtypes(include='number').to_numpy()
# TODO: completa la solucion
""",
        )
        solution = task_spec.get(
            "solution",
            """import numpy as np
import pandas as pd

df = pd.read_csv('datos_practica.csv')
arr = df.select_dtypes(include='number').to_numpy()
media = arr.mean(axis=0)
desv = arr.std(axis=0)
print('media:', media)
print('desv:', desv)
""",
        )
        expected = task_spec.get("expected", "Salida con media y desviacion estandar por columna numerica.")
    elif "markdown" in topic:
        task = task_spec.get("task", "redactar un reporte corto en Markdown")
        starter = task_spec.get(
            "starter",
            """# Reporte de practica

## Objetivo
- TODO: describe el objetivo del ejercicio

## Analisis
- TODO: agrega 2 hallazgos clave
""",
        )
        solution = task_spec.get(
            "solution",
            """# Reporte de practica

## Objetivo
- Describir el analisis realizado sobre el dataset y sus hallazgos.

## Analisis
- Se revisaron las columnas principales y se identificaron tendencias.
- Se valido la calidad de datos y se resumen las metricas clave.
""",
        )
        expected = task_spec.get("expected", "Texto en Markdown con secciones y listas claras.")
    else:
        task = task_spec.get("task", "resolver un problema basico con funciones")
        starter = task_spec.get(
            "starter",
            """def resolver(valores):
    # TODO: implementa la logica segun el enunciado
    return None
""",
        )
        solution = task_spec.get(
            "solution",
            """def resolver(valores):
    return sum(valores) / len(valores)
""",
        )
        expected = task_spec.get("expected", "Salida coherente con la logica solicitada.")

    instructions = "\n".join(base_instructions)
    if exercise_type not in ("completar_codigo", "completar-codigo"):
        instructions += f"\nActividad sugerida: {task}."

    hints = [
        "Verifica que el archivo cargue sin columnas nulas inesperadas.",
        "Descompone el problema en pasos pequenos y validables.",
        "Compara tu salida con el criterio de aceptacion.",
    ]
    if difficulty == "avanzada":
        hints = hints[:2]

    return {
        "title": f"Ejercicio de {payload.topic} ({payload.difficulty})",
        "instructions": instructions,
        "starterCode": starter,
        "solutionCode": solution,
        "expectedOutput": expected,
        "hints": hints,
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


def _merge_missing(base: Dict[str, Any], defaults: Dict[str, Any]) -> Dict[str, Any]:
    for key, value in defaults.items():
        if key not in base or base[key] in (None, ""):
            base[key] = value
    return base


@lru_cache(maxsize=1)
def load_pipeline():
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, use_fast=True, trust_remote_code=True)
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
        torch_dtype=torch.float16,
        trust_remote_code=True,
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
        task_spec = _pick_task(payload)
        if GENERATION_MODE == "template":
            exercise = build_fallback_exercise(payload, {}, task_spec)
            return {"exercise": exercise, "meta": {"fallback": False, "source": "template"}}

        tokenizer, model = load_pipeline()
        prompt = build_prompt(payload, task_spec)
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        raw_output = ""
        for attempt in range(2):
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            with torch.inference_mode():
                output = model.generate(
                    **inputs,
                    max_new_tokens=MAX_NEW_TOKENS,
                    temperature=0.35 if attempt else 0.5,
                    top_p=0.9,
                    top_k=40,
                    do_sample=True,
                    repetition_penalty=1.08,
                    eos_token_id=tokenizer.eos_token_id,
                    pad_token_id=tokenizer.pad_token_id,
                    num_beams=1,
                    early_stopping=True,
                )
            prompt_len = inputs["input_ids"].shape[-1]
            generated_tokens = output[0][prompt_len:]
            raw_output = tokenizer.decode(generated_tokens, skip_special_tokens=True)
            try:
                response = parse_json_response(raw_output)
                defaults = build_fallback_exercise(payload, {}, task_spec)
                response = _merge_missing(response, defaults)
                return {"exercise": response, "meta": {"fallback": False, "source": "json"}}
            except ValueError:
                continue

        # Attempt a JSON fix pass with the model
        for _ in range(MAX_JSON_FIX_ATTEMPTS):
            fixed_output = _fix_json_with_model(tokenizer, model, raw_output)
            try:
                response = parse_json_response(fixed_output)
                defaults = build_fallback_exercise(payload, {}, task_spec)
                response = _merge_missing(response, defaults)
                return {
                    "exercise": response,
                    "meta": {"fallback": False, "source": "json_fix"},
                }
            except ValueError:
                continue

        parsed_kv = parse_key_value_response(raw_output)
        if parsed_kv:
            coerced = build_fallback_exercise(payload, parsed_kv, task_spec)
            return {
                "exercise": coerced,
                "meta": {"fallback": False, "source": "json_fix"},
            }

        fallback = build_fallback_exercise(payload, {}, task_spec)
        return {"exercise": fallback, "meta": {"fallback": True, "source": "template_fallback"}}
    except Exception as err:
        if "out of memory" in str(err).lower():
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            raise HTTPException(
                status_code=503,
                detail="GPU sin memoria. Baja MAX_NEW_TOKENS o usa un modelo mas pequeno.",
            ) from err
        raise HTTPException(status_code=500, detail=str(err)) from err
