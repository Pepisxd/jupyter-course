import json
import os
import random
import re
import unicodedata
from collections import deque
from typing import Any, Dict, List

import modal

# ─── Imagen con todas las dependencias ─────────────────────────────────────
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi",
        "uvicorn",
        "torch",
        "transformers",
        "peft",
        "accelerate",
        "bitsandbytes",
        "huggingface_hub",
        "sentencepiece",
        "scipy",
    )
)

app = modal.App("jupyter-exercise-ai", image=image)

# ─── Volumen para cachear el modelo (evita re-descargarlo) ─────────────────
volume = modal.Volume.from_name("model-cache", create_if_missing=True)
CACHE_DIR = "/cache"

BASE_MODEL = "codellama/CodeLlama-7b-Instruct-hf"
LORA_PATH = "Pepisxd/codellama-edugen-v2"
MAX_NEW_TOKENS = 2048

# Schema simplificado: solo texto, el código siempre viene del TASK_BANK
JSON_SCHEMA = '{"title":"...","instrucciones":"...","pistas":["...","...","..."]}'

# Mapeo claves del modelo (español) → claves esperadas (inglés)
KEY_MAP = {
    "instrucciones": "instructions",
    "pistas": "hints",
}

DEFAULT_COLUMNS = ["id", "fecha", "categoria", "ventas", "costo"]
HISTORY_MAX = 50
_recent_tasks: deque = deque(maxlen=HISTORY_MAX)

TASK_BANK: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "pandas": {
        "basica": [
            {
                "id": "pd_basic_mean",
                "task": "calcular el promedio de ventas por categoria",
                "required_ops": ["groupby", "mean", "sort_values"],
                "starter": "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\n# TODO: completa la solucion\n",
                "solution": "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\nresumen = df.groupby('categoria')['ventas'].mean().sort_values(ascending=False)\nprint(resumen)\n",
                "expected": "Serie con promedio de ventas por categoria ordenada.",
            },
            {
                "id": "pd_basic_filter",
                "task": "filtrar ventas mayores a 500 y mostrar 5 filas",
                "required_ops": ["filter", "head"],
                "starter": "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\n# TODO: completa la solucion\n",
                "solution": "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\nfiltro = df[df['ventas'] > 500]\nprint(filtro.head(5))\n",
                "expected": "Tabla filtrada con ventas > 500.",
            },
        ],
        "intermedia": [
            {
                "id": "pd_mid_margin",
                "task": "calcular margen (ventas - costo) y promedio por categoria",
                "required_ops": ["assign", "groupby", "mean"],
                "starter": "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\n# TODO: completa la solucion\n",
                "solution": "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\ndf = df.assign(margen=df['ventas'] - df['costo'])\nresumen = df.groupby('categoria')['margen'].mean().sort_values(ascending=False)\nprint(resumen)\n",
                "expected": "Promedio de margen por categoria.",
            },
        ],
        "avanzada": [
            {
                "id": "pd_adv_pivot",
                "task": "crear tabla dinamica de ventas por categoria y mes",
                "required_ops": ["pivot_table", "to_datetime", "dt.month"],
                "starter": "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\n# TODO: completa la solucion\n",
                "solution": "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\ndf['fecha'] = pd.to_datetime(df['fecha'])\ndf['mes'] = df['fecha'].dt.month\npivot = pd.pivot_table(df, values='ventas', index='categoria', columns='mes', aggfunc='sum')\nprint(pivot)\n",
                "expected": "Tabla dinamica con ventas por categoria y mes.",
            },
        ],
    },
    "numpy": {
        "basica": [{"id": "np_basic_stats", "task": "calcular media y desviacion estandar por columna", "required_ops": ["mean", "std"]}],
        "intermedia": [{"id": "np_mid_norm", "task": "normalizar columnas numericas con min-max", "required_ops": ["min", "max"]}],
        "avanzada": [{"id": "np_adv_zscore", "task": "calcular z-score por columna y contar outliers", "required_ops": ["mean", "std", "abs"]}],
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


# ─── Helpers ────────────────────────────────────────────────────────────────
def _norm(value: str) -> str:
    value = value.strip().lower()
    value = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in value if not unicodedata.combining(ch))


def _difficulty_tier(difficulty: str) -> str:
    d = _norm(difficulty)
    if d in ("basica", "basico", "principiante"):
        return "basica"
    if d in ("intermedia", "medio", "media"):
        return "intermedia"
    return "avanzada"


def _dataset_rows(size: str) -> int:
    return {"pequeno": 40, "mediano": 200, "grande": 1000}.get(_norm(size), 40)


def _dataset_description(topic: str) -> str:
    t = _norm(topic)
    if "pandas" in t or "analisis" in t:
        return "Dataset de ventas de productos en una tienda online"
    if "numpy" in t:
        return "Dataset numerico de mediciones de sensores"
    return "Dataset sintetico para practica"


def _pick_task(topic: str, difficulty: str, exercise_type: str) -> Dict[str, Any]:
    tier = _difficulty_tier(difficulty)
    bank = TASK_BANK.get(_norm(topic), TASK_BANK["general"]).get(tier, [])
    if not bank:
        return TASK_BANK["general"]["basica"][0]
    task_key = f"{_norm(topic)}::{tier}::{_norm(exercise_type)}"
    candidates = [t for t in bank if not any(k == task_key and tid == t["id"] for k, tid in _recent_tasks)]
    choice = random.choice(candidates if candidates else bank)
    _recent_tasks.append((task_key, choice["id"]))
    return choice


def build_prompt(topic: str, difficulty: str, exercise_type: str, task_spec: Dict) -> str:
    tier = _difficulty_tier(difficulty)
    ops = ", ".join(task_spec.get("required_ops", [])) or "pandas basico"
    instruction = "\n".join([
        "Eres un instructor experto en Python y ciencia de datos.",
        "Crea el encabezado de un ejercicio de Jupyter para estudiantes hispanohablantes.",
        "Responde ÚNICAMENTE con JSON válido usando este esquema exacto:",
        f"{JSON_SCHEMA}",
        f"tema: {topic}, dificultad: {tier}, tipo: {exercise_type}",
        f"tarea: {task_spec.get('task', '')}",
        f"operaciones requeridas: {ops}",
        "El titulo debe ser creativo y en español.",
        "Las pistas deben ser 3 consejos cortos y útiles para el estudiante.",
        "Las instrucciones deben explicar claramente qué hacer, en 2-3 oraciones.",
    ])
    return f"<s>[INST] {instruction} [/INST] {{"


def _fix_backtick_strings(text: str) -> str:
    """Reemplaza strings con backticks por strings con comillas dobles."""
    def replace_bt(m):
        inner = m.group(1)
        inner = inner.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")
        return f'"{inner}"'
    return re.sub(r"`((?:[^`]|``)*)`", replace_bt, text, flags=re.S)


def _repair_truncated_json(text: str) -> str:
    """Cierra llaves y corchetes abiertos en JSON truncado."""
    stack = []
    in_string = False
    escape = False
    for ch in text:
        if escape:
            escape = False
            continue
        if ch == "\\" and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in "{[":
            stack.append("}" if ch == "{" else "]")
        elif ch in "}]" and stack:
            stack.pop()
    # Si hay una string abierta, cerrarla
    if in_string:
        text += '"'
    # Cerrar estructuras abiertas en orden inverso
    text += "".join(reversed(stack))
    return text


def _try_parse(candidate: str) -> Dict[str, Any]:
    """Intenta parsear JSON usando múltiples estrategias."""
    strategies = [
        candidate,                                              # 1) directo
        _repair_truncated_json(candidate),                      # 2) reparar truncado
        _fix_backtick_strings(candidate),                       # 3) reemplazar backticks
        _repair_truncated_json(_fix_backtick_strings(candidate)), # 4) backticks + repair
    ]
    last_err = None
    for s in strategies:
        try:
            return json.loads(s)
        except json.JSONDecodeError as e:
            last_err = e
    raise last_err


def _extract_first_object(text: str) -> str:
    """Extrae el primer objeto JSON completo de un texto."""
    start = text.find("{")
    if start == -1:
        return "{" + text
    depth = 0
    in_string = False
    escape = False
    for i, ch in enumerate(text[start:], start):
        if escape:
            escape = False
            continue
        if ch == "\\" and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    # JSON truncado: devolver desde start hasta el final
    return text[start:]


def parse_json(text: str) -> Dict[str, Any]:
    # Limpiar fences de markdown
    cleaned = re.sub(r"```(?:json)?", "", text, flags=re.S)
    cleaned = re.sub(r"```", "", cleaned).strip()

    # El prompt termina con '{', así que el raw_output es el contenido sin '{' inicial
    # Extraer el primer objeto completo (prepender '{' para reconstruirlo)
    candidate = _extract_first_object("{" + cleaned)

    payload = _try_parse(candidate)

    if "exercise" in payload and isinstance(payload["exercise"], dict):
        payload = payload["exercise"]

    # Mapear claves en español a inglés
    for es_key, en_key in KEY_MAP.items():
        if es_key in payload and en_key not in payload:
            payload[en_key] = payload.pop(es_key)

    if "title" not in payload:
        raise ValueError("missing title")
    return payload


def build_fallback(topic: str, difficulty: str, exercise_type: str, dataset_size: str, task_spec: Dict) -> Dict:
    tier = _difficulty_tier(difficulty)
    t = _norm(topic)
    if "pandas" in t:
        starter = task_spec.get("starter", "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\n# TODO\n")
        solution = task_spec.get("solution", "import pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\nprint(df.head())\n")
        expected = task_spec.get("expected", "Resultado tabular con el resumen solicitado.")
    elif "numpy" in t:
        starter = "import numpy as np\nimport pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\narr = df.select_dtypes(include='number').to_numpy()\n# TODO\n"
        solution = "import numpy as np\nimport pandas as pd\n\ndf = pd.read_csv('datos_practica.csv')\narr = df.select_dtypes(include='number').to_numpy()\nprint(arr.mean(axis=0))\n"
        expected = "Media por columna numerica."
    else:
        starter = "# TODO: implementa la solucion\n"
        solution = "# Solucion de referencia\nprint('Completado')\n"
        expected = "Salida coherente con la logica solicitada."

    return {
        "title": f"Ejercicio de {topic} ({difficulty})",
        "instructions": f"Practica {topic} con dificultad {difficulty}. Tarea: {task_spec.get('task', 'resolver el problema')}.",
        "starterCode": starter,
        "solutionCode": solution,
        "expectedOutput": expected,
        "hints": ["Descompone el problema en pasos pequeños.", "Valida tu salida antes de continuar."],
        "files": [{"filename": "datos_practica.csv", "description": _dataset_description(topic), "columns": DEFAULT_COLUMNS}],
        "steps": ["Carga los datos.", "Aplica la operacion.", "Muestra el resultado."],
        "acceptanceCriteria": ["El codigo corre sin errores.", "La salida cumple el objetivo."],
    }


# ─── Clase con el modelo cargado ────────────────────────────────────────────
@app.cls(
    gpu="A10G",
    memory=20480,
    timeout=900,
    min_containers=0,
    volumes={CACHE_DIR: volume},
    secrets=[modal.Secret.from_name("huggingface-secret")],
)
class ExerciseModel:
    @modal.enter()
    def load_model(self):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from peft import PeftModel

        os.environ["HF_HOME"] = CACHE_DIR
        os.environ["TRANSFORMERS_CACHE"] = CACHE_DIR

        print("Cargando tokenizer...")
        self.tokenizer = AutoTokenizer.from_pretrained(
            BASE_MODEL,
            use_fast=True,
            trust_remote_code=True,
            cache_dir=CACHE_DIR,
        )
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        print("Cargando modelo base...")
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
            trust_remote_code=True,
            cache_dir=CACHE_DIR,
        )

        print("Aplicando LoRA...")
        self.model = PeftModel.from_pretrained(base_model, LORA_PATH, cache_dir=CACHE_DIR)
        self.model.eval()
        print("Modelo listo.")

    def _infer(self, prompt: str, temperature: float) -> str:
        import torch
        inputs = self.tokenizer(
            prompt, return_tensors="pt", add_special_tokens=False
        ).to(self.model.device)
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        with torch.inference_mode():
            out = self.model.generate(
                **inputs,
                max_new_tokens=MAX_NEW_TOKENS,
                temperature=temperature,
                top_p=0.9,
                top_k=40,
                do_sample=temperature > 0,
                repetition_penalty=1.05,
                eos_token_id=self.tokenizer.eos_token_id,
                pad_token_id=self.tokenizer.pad_token_id,
            )
        prompt_len = inputs["input_ids"].shape[-1]
        return self.tokenizer.decode(out[0][prompt_len:], skip_special_tokens=True)

    @modal.method()
    def generate_text(self, topic: str, difficulty: str, exercise_type: str) -> Dict:
        """Debug: devuelve el texto crudo que genera el modelo."""
        task_spec = _pick_task(topic, difficulty, exercise_type)
        prompt = build_prompt(topic, difficulty, exercise_type, task_spec)
        raw = self._infer(prompt, 0.5)
        try:
            parsed = parse_json(raw)
        except Exception as e:
            parsed = {"parse_error": str(e)}
        return {"prompt": prompt[-400:], "raw": raw[:600], "parsed": parsed}

    def _extract_text_fields(self, raw: str) -> Dict[str, Any]:
        """Extrae title, instrucciones y pistas del raw output con regex, sin JSON completo."""
        result: Dict[str, Any] = {}

        # Buscar "title": "..." (primera ocurrencia)
        m = re.search(r'"title"\s*:\s*"([^"]{5,200})"', raw)
        if m:
            result["title"] = m.group(1).strip()

        # Buscar instrucciones o instructions
        for key in ("instrucciones", "instructions"):
            m = re.search(rf'"{key}"\s*:\s*"([^"{{}}]{{10,500}})"', raw, re.S)
            if m:
                result["instructions"] = m.group(1).strip()
                break

        # Buscar pistas o hints (array de strings)
        for key in ("pistas", "hints"):
            m = re.search(rf'"{key}"\s*:\s*\[([^\]]+)\]', raw, re.S)
            if m:
                items = re.findall(r'"([^"]{5,200})"', m.group(1))
                if items:
                    result["hints"] = items[:4]
                    break

        return result

    @modal.method()
    def generate(self, topic: str, difficulty: str, exercise_type: str, dataset_size: str) -> Dict:
        task_spec = _pick_task(topic, difficulty, exercise_type)
        base = build_fallback(topic, difficulty, exercise_type, dataset_size, task_spec)
        prompt = build_prompt(topic, difficulty, exercise_type, task_spec)

        bad_words = ["image", "classification", "neural", "movie", "game", "review", "deport", "juego"]

        for temp in [0.5, 0.3]:
            try:
                raw = self._infer(prompt, temp)
                fields = self._extract_text_fields(raw)

                title = fields.get("title", "")
                instructions = fields.get("instructions", "")
                hints = fields.get("hints", [])

                title_ok = len(title) > 10 and not any(w in title.lower() for w in bad_words)
                instructions_ok = len(instructions) > 20

                print(f"[generate] temp={temp} title='{title[:60]}' title_ok={title_ok} instr_ok={instructions_ok}")

                if title_ok and instructions_ok:
                    base["title"] = title
                    base["instructions"] = instructions
                    if len(hints) >= 2:
                        base["hints"] = hints
                    return {"exercise": base, "source": "model"}
            except Exception as e:
                print(f"[generate] error temp={temp}: {e}")
                continue

        return {"exercise": base, "source": "fallback"}


# ─── FastAPI expuesta en Modal ───────────────────────────────────────────────
@app.function(timeout=600)
@modal.concurrent(max_inputs=10)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel

    web = FastAPI(title="Jupyter Exercise AI")

    class ExerciseRequest(BaseModel):
        topic: str = "pandas"
        difficulty: str = "basica"
        exerciseType: str = "completar_codigo"
        datasetSize: str = "pequeno"

    @web.get("/health")
    def health():
        return {"ok": True, "model": BASE_MODEL, "lora": LORA_PATH}

    @web.post("/generate")
    def generate(req: ExerciseRequest):
        try:
            model = ExerciseModel()
            result = model.generate.remote(
                req.topic, req.difficulty, req.exerciseType, req.datasetSize
            )
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @web.post("/debug")
    def debug(req: ExerciseRequest):
        try:
            model = ExerciseModel()
            result = model.generate_text.remote(
                req.topic, req.difficulty, req.exerciseType
            )
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return web
