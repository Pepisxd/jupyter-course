# Curso Jupyter Notebook — Plataforma Web

Plataforma educativa para el curso de Jupyter Notebook de la Universidad de Guadalajara. Permite a los alumnos ver lecciones en video, generar ejercicios con IA y acceder a recursos del curso.

---

## Tecnologías

### Frontend
- **React + Vite + TypeScript**
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Framer Motion** para animaciones

### Backend
- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT** para autenticación
- **Bcrypt** para hash de contraseñas
- **Brevo (API)** para envío de correos de verificación
- **AWS SDK S3** compatible con Cloudflare R2 para almacenamiento de videos
- **Multer** para subida de archivos

### Infraestructura
- **Frontend**: Vercel
- **Backend**: Railway
- **Base de datos**: MongoDB Atlas
- **Videos**: Cloudflare R2 (bucket público)

---

## Estructura del proyecto

```
modular/
├── jupyter-notebook-frontend/
│   └── jupyter-notebook-frontend/          # App React
│       ├── src/
│       │   ├── pages/                      # Páginas principales
│       │   ├── components/                 # Componentes reutilizables
│       │   ├── auth/                       # Contexto y formularios de auth
│       │   ├── admin/                      # Panel de administración
│       │   ├── routes/                     # Definición de rutas
│       │   └── lib/api.ts                  # URL base de la API
│       ├── public/                         # Assets estáticos
│       └── index.html
│
└── jupyter-notebook-backend/
    └── javascript/jupyter-notebook-video-api/
        ├── controllers/                    # Lógica de negocio
        ├── models/                         # Esquemas Mongoose
        ├── routes/                         # Rutas de la API
        ├── middleware/                     # Auth middleware
        └── server.js                       # Entrada del servidor
```

---

## Funcionalidades

### Autenticación
- Registro exclusivo con correo institucional `@alumnos.udg.mx`
- Verificación de cuenta por correo electrónico (Brevo)
- Login con JWT (expira en 1 hora)
- Rutas protegidas: `/course-content`, `/exercises`, `/admin/courses`

### Curso
- 6 capítulos con 13 lecciones en video
- Reproductor personalizado con control de velocidad, seek y tooltip de tiempo
- Videos almacenados en Cloudflare R2 (acceso público)

### Generación de ejercicios con IA
- Integración con modelo fine-tuned (CodeLlama/Qwen) desplegado en Modal
- Genera ejercicios de Jupyter Notebook según el tema seleccionado
- Solo accesible para usuarios autenticados

### Panel de administración
- Crear y editar capítulos
- Subir lecciones con video directamente a Cloudflare R2
- Accesible solo para usuarios con rol `admin`

### Páginas públicas
- **Home**: presentación del curso, hero, características
- **Recursos**: módulos, cheatsheets, links útiles
- **Contacto**: formulario y datos del autor
- **Términos y condiciones**: reglas de uso de la plataforma

---

## Variables de entorno

### Backend (`.env`)

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/cursos
JWT_SECRET=<secret>
ALLOWED_ORIGINS=http://localhost:5174,https://<tu-dominio>.vercel.app
FRONTEND_URL=https://<tu-dominio>.vercel.app

# Brevo (email)
BREVO_API_KEY=<api-key>
BREVO_SENDER_EMAIL=<correo-remitente>

# Cloudflare R2
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
R2_BUCKET_NAME=videos-curso
CLOUDFLARE_ACCOUNT_ID=<account-id>
S3_API=https://<account-id>.r2.cloudflarestorage.com

# IA via Modal
MODAL_URL=https://<tu-endpoint>.modal.run
MODAL_TIMEOUT_MS=600000
```

### Frontend (`.env`)

```env
VITE_API_URL=https://<tu-backend>.railway.app
```

---

## Desarrollo local

### Backend

```bash
cd jupyter-notebook-backend/javascript/jupyter-notebook-video-api
npm install
npm run dev
# Corre en http://localhost:3000
```

### Frontend

```bash
cd jupyter-notebook-frontend/jupyter-notebook-frontend
npm install
npm run dev
# Corre en http://localhost:5174
```

---

## API — Endpoints principales

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/verify?token=` | Verificar email | No |
| GET | `/api/auth/me` | Usuario actual | Sí |
| GET | `/api/chapters` | Listar capítulos | No |
| GET | `/api/lessons/:id` | Obtener lección | Sí |
| POST | `/api/lessons` | Crear lección + subir video | Admin |
| POST | `/api/exercises/generate` | Generar ejercicio con IA | Sí |

---

## Despliegue

### Vercel (Frontend)
- Root directory: `jupyter-notebook-frontend/jupyter-notebook-frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Agrega `VITE_API_URL` en las variables de entorno de Vercel

### Railway (Backend)
- Root directory: `jupyter-notebook-backend/javascript/jupyter-notebook-video-api`
- Start command: `node server.js`
- Agrega todas las variables de entorno del backend en Railway

---

## Autor

**José Alberto Orozco**
Universidad de Guadalajara
- GitHub: [@Pepisxd](https://github.com/Pepisxd)
- Correo: josealbertoorpp@gmail.com
