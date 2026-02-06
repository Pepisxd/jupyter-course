import argparse
import json
import random
from pathlib import Path
from typing import Dict, List


SCHEMA_KEYS = [
    "title",
    "instructions",
    "starterCode",
    "solutionCode",
    "expectedOutput",
    "hints",
    "files",
    "steps",
    "acceptanceCriteria",
]


def infer_topic(text: str) -> str:
    t = text.lower()
    if "pandas" in t:
        return "pandas"
    if "numpy" in t:
        return "numpy"
    if "markdown" in t:
        return "markdown"
    if "sklearn" in t or "machine learning" in t:
        return "ml_basico"
    if "algoritm" in t:
        return "algoritmia"
    return "analisis_datos"


def infer_columns(topic: str) -> List[str]:
    if topic in ("pandas", "analisis_datos"):
        return ["id", "fecha", "categoria", "ventas", "costo"]
    if topic == "numpy":
        return ["vector_a", "vector_b"]
    if topic == "ml_basico":
        return ["x1", "x2", "target"]
    if topic == "algoritmia":
        return ["valor_1", "valor_2", "resultado"]
    return ["valor_1", "valor_2", "resultado"]


def build_sample(topic: str, difficulty: str, exercise_type: str, dataset_size: str) -> Dict:
    rows = {"pequeno": "40", "mediano": "250", "grande": "1200"}.get(
        dataset_size, "40"
    )
    columns = infer_columns(topic)
    if topic == "numpy":
        starter = (
            "import numpy as np\n\n"
            "a = np.array([2, 4, 6, 8])\n"
            "b = np.array([1, 3, 5, 7])\n"
            "# TODO: calcula suma, media y desviacion\n"
        )
        solution = (
            "import numpy as np\n\n"
            "a = np.array([2, 4, 6, 8])\n"
            "b = np.array([1, 3, 5, 7])\n"
            "suma = a + b\n"
            "print('suma:', suma)\n"
            "print('media:', np.mean(suma))\n"
            "print('desviacion:', np.std(suma))\n"
        )
        expected = "Tres valores: suma, media y desviacion del arreglo resultante."
    else:
        starter = (
            "import pandas as pd\n\n"
            "df = pd.read_csv('datos_practica.csv')\n"
            "# TODO: completa la solucion\n"
            "df.head()\n"
        )
        solution = (
            "import pandas as pd\n\n"
            "df = pd.read_csv('datos_practica.csv')\n"
            "resumen = df.groupby('categoria')['ventas'].mean().sort_values(ascending=False)\n"
            "print(resumen)\n"
        )
        expected = "Serie con promedio de ventas por categoria ordenada de mayor a menor."

    return {
        "title": f"Ejercicio de {topic} ({difficulty})",
        "instructions": "\n".join(
            [
                f"Practica {topic} con dificultad {difficulty}.",
                f"Tipo de actividad: {exercise_type}.",
                f"Trabaja con un dataset de tamano {dataset_size} (~{rows} filas).",
                "Contexto del archivo: Dataset de ventas de una tienda local",
            ]
        ),
        "starterCode": starter,
        "solutionCode": solution,
        "expectedOutput": expected,
        "hints": [
            "Verifica que el archivo cargue sin columnas nulas inesperadas.",
            "Descompone el problema en pasos pequenos y validables.",
            "Compara tu salida con el criterio de aceptacion.",
        ],
        "files": [
            {
                "filename": "datos_practica.csv",
                "description": "Dataset de ventas de productos en una tienda local",
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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="hf_jupyter_messages.jsonl")
    parser.add_argument("--output", default="hf_jupyter_structured.jsonl")
    parser.add_argument("--max-samples", type=int, default=2000)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)

    in_path = Path(args.input)
    out_path = Path(args.output)

    if not in_path.exists():
        raise FileNotFoundError(f"Input file not found: {in_path}")

    count = 0
    with in_path.open() as f_in, out_path.open("w") as f_out:
        for line in f_in:
            obj = json.loads(line)
            messages = obj.get("messages", [])
            user_text = " ".join(
                m.get("content", "") for m in messages if m.get("role") == "user"
            )
            topic = infer_topic(user_text)
            difficulty = random.choice(["basica", "media"])
            exercise_type = random.choice(
                ["completar_codigo", "corregir_errores", "explicar_resultado"]
            )
            dataset_size = random.choice(["pequeno", "mediano"])

            schema = build_sample(topic, difficulty, exercise_type, dataset_size)

            structured = {
                "messages": [
                    {
                        "role": "system",
                        "content": "Eres un generador de ejercicios de Jupyter. Devuelve solo JSON.",
                    },
                    {
                        "role": "user",
                        "content": (
                            "Genera un ejercicio con el siguiente schema JSON EXACTO:\n"
                            + ", ".join(SCHEMA_KEYS)
                        ),
                    },
                    {"role": "assistant", "content": json.dumps(schema, ensure_ascii=False)},
                ]
            }
            f_out.write(json.dumps(structured, ensure_ascii=False) + "\n")
            count += 1
            if count >= args.max_samples:
                break

    print(f"Saved {count} rows to {out_path}")


if __name__ == "__main__":
    main()
