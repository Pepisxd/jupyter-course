# IA Jupyter (Fine-tuning local + ML demo)

Este folder contiene scripts para:
1) Preparar el dataset de Hugging Face para fine-tuning (LoRA).
2) Entrenar un modelo Qwen localmente con tu RTX 4060.
3) Generar un notebook de ML basico para cumplir Modulo 4.

## 1) Preparar dataset (Hugging Face)

Requiere Python 3.10+ y acceso a internet.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-finetune.txt
python prepare_hf_dataset.py \
  --dataset jupyter-agent/jupyter-agent-dataset \
  --split non_thinking \
  --output hf_jupyter_messages.jsonl \
  --max-samples 5000 \
  --include-packages pandas,numpy,sklearn,matplotlib
```

Esto genera `hf_jupyter_messages.jsonl` con el formato `messages` para SFT.

## 1.1) Convertir a dataset estructurado (schema JSON final)

Este paso transforma el dataset en ejemplos con el JSON exacto que quieres en produccion.

```bash
python prepare_structured_dataset.py \
  --input hf_jupyter_messages.jsonl \
  --output hf_jupyter_structured.jsonl \
  --max-samples 2000
```

## 2) Fine-tuning (LoRA)

```bash
python train_lora_qwen.py \
  --model-name Qwen/Qwen3-4B-Instruct-2507 \
  --train-file hf_jupyter_structured.jsonl \
  --output-dir qwen3-jupyter-lora \
  --max-steps 800
```

Resultado: carpeta `qwen3-jupyter-lora` con los adapters LoRA.

Notas:
- Ajusta `max-steps` segun tu VRAM y tiempo.
- Si quieres entrenar mas tiempo, sube `max-steps`.

### Perfil recomendado para GPU de 8GB

1) Preparacion en streaming (evita descargar todo el split):

```bash
python prepare_hf_dataset.py \
  --dataset jupyter-agent/jupyter-agent-dataset \
  --split non_thinking \
  --streaming \
  --output hf_jupyter_messages.jsonl \
  --max-samples 2000 \
  --include-packages pandas,numpy,sklearn,matplotlib
```

2) Entrenamiento liviano:

```bash
PYTORCH_ALLOC_CONF=expandable_segments:True \
python train_lora_qwen.py \
  --model-name Qwen/Qwen3-4B-Instruct-2507 \
  --train-file hf_jupyter_messages.jsonl \
  --output-dir qwen3-jupyter-lora \
  --max-steps 200 \
  --max-seq-length 256 \
  --per-device-train-batch-size 1 \
  --gradient-accumulation-steps 16 \
  --lora-r 4 \
  --lora-alpha 8
```

## 3) Demo ML para Modulo 4

Genera un dataset con 120 registros y un notebook de clasificacion binaria.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-ml.txt
python generate_ml_demo.py
```

Archivos generados:
- `ml_demo_dataset.csv`
- `ml_demo.ipynb`

El notebook incluye el modelo matematico (sigmoide) y reporta accuracy + matriz de confusion.

## 4) Servidor Python para inferencia del LoRA

Levanta un API local para generar ejercicios desde el modelo fine-tuneado.

```bash
source .venv/bin/activate
pip install -r requirements-finetune.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Prueba:

```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic":"pandas",
    "difficulty":"basica",
    "exerciseType":"completar_codigo",
    "datasetSize":"pequeno"
  }'
```

Para 8GB, evita `--reload` y reduce tokens:

```bash
PYTORCH_ALLOC_CONF=expandable_segments:True MAX_NEW_TOKENS=96 \
uvicorn main:app --host 0.0.0.0 --port 8001
```
