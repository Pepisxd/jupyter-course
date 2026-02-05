# Jupyter Course Monorepo

Plataforma full-stack para cursos de Jupyter con:

- frontend React + Vite
- API Node.js + Express + MongoDB
- servicio Python (FastAPI) para generar ejercicios con IA (LoRA / Qwen)

## Estructura del repositorio

```text
jupyter-course/
├── jupyter-notebook-frontend/                        # App web (React + TypeScript)
├── jupyter-notebook-backend/
│   ├── javascript/jupyter-notebook-video-api/        # API principal (Express)
│   └── python/ia-jupyterNotebook/                    # Fine-tuning + API IA (FastAPI)
├── hf_jupyter_messages.jsonl                         # Dataset local de ejemplo
└── qwen3-jupyter-lora.zip                            # Artefacto grande (usar Git LFS)
```

## Funcionalidades principales

- autenticacion con JWT (registro/login/me)
- gestion de cursos, capitulos y lecciones
- subida de imagen/video a AWS S3
- panel admin para contenido
- generacion de ejercicios y notebooks (`.ipynb`)
- integracion IA por dos caminos:
  - Node + Ollama (`/api/exercises/generate-ai`)
  - Python + FastAPI + modelo LoRA (`/generate`)

## Requisitos

- Node.js 20+
- npm 10+
- Python 3.10+
- MongoDB local o remoto
- (Opcional) Ollama para IA local desde backend Node
- (Opcional) GPU NVIDIA para inferencia/fine-tuning en Python

## 1) Frontend (React)

```bash
cd jupyter-notebook-frontend
npm install
npm run dev
```

Por defecto corre en `http://localhost:5173`.

## 2) Backend Node (API principal)

```bash
cd jupyter-notebook-backend/javascript/jupyter-notebook-video-api
npm install
npm run dev
```

### Variables de entorno (Node)

Crea `jupyter-notebook-backend/javascript/jupyter-notebook-video-api/.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/cursos
JWT_SECRET=super_secret_key

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...

# IA via Ollama (opcional)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen3:4b-instruct-2507
OLLAMA_TIMEOUT_MS=30000
```

## 3) Backend Python (IA LoRA / FastAPI)

```bash
cd jupyter-notebook-backend/python/ia-jupyterNotebook
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-finetune.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Health check:

```bash
curl http://localhost:8001/health
```

Variables utiles:

```env
BASE_MODEL=Qwen/Qwen3-4B-Instruct-2507
LORA_PATH=./qwen3-jupyter-lora
MAX_NEW_TOKENS=128
```

## Flujo de desarrollo recomendado

Levanta los 3 servicios:

1. Frontend: `http://localhost:5173`
2. API Node: `http://localhost:3000`
3. API Python IA: `http://localhost:8001`

Notas:

- el frontend hoy usa varias URLs hardcodeadas a `http://localhost:3000`
- CORS en Node esta configurado para origen `http://localhost:5173`

## Endpoints utiles

- `GET /api/auth/me`
- `GET /api/courses`
- `POST /api/exercises/generate`
- `POST /api/exercises/generate-ai` (Node + Ollama)
- `POST /api/exercises/notebook`
- `GET /health` (FastAPI Python)
- `POST /generate` (FastAPI Python)

## Dataset y entrenamiento (Python)

Dentro de `jupyter-notebook-backend/python/ia-jupyterNotebook/` ya tienes scripts para:

- preparar dataset HF (`prepare_hf_dataset.py`)
- entrenar LoRA (`train_lora_qwen.py`)
- generar demo ML (`generate_ml_demo.py`)

Ver mas detalle en:

- `jupyter-notebook-backend/python/ia-jupyterNotebook/README.md`

## GitHub y archivos grandes

Este repo contiene artefactos grandes (ejemplo: `qwen3-jupyter-lora.zip`).
GitHub bloquea archivos > 100 MB en Git normal, asi que usa Git LFS:

```bash
git lfs install
git lfs track "*.zip" "*.safetensors" "*.pt" "*.bin"
git add .gitattributes
```

Si ya hiciste commit sin LFS, migralo antes de `git push`.

## Estado actual y mejoras sugeridas

- mover URLs hardcodeadas del frontend a variables `VITE_*`
- agregar `docker-compose` para frontend + API + Mongo + Ollama
- separar artifacts de entrenamiento en release storage (S3/HF)
- agregar tests (frontend + backend)

