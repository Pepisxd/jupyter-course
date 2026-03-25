require("dotenv").config();

const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const VIDEOS_DIR = "/Users/pepisxd/Movies/videos curso";
const BUCKET = process.env.R2_BUCKET_NAME;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const MONGO_URI = process.env.MONGO_URI;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const CHAPTER_IDS = {
  1: "69aa5e9d4aed37d64001ceb4",
  2: "69aa5e9d4aed37d64001ceb7",
  3: "69aa5e9d4aed37d64001ceba",
  4: "69aa5e9d4aed37d64001cebd",
  5: "69aa5e9d4aed37d64001cec0",
  6: "69aa5ec34aed37d64001cec4",
};

const VIDEO_MAP = [
  { file: "1 Video Introductorio Jupyter Notebook.mp4", chapter: 1, title: "Video Introductorio", description: "Introducción general al curso de Jupyter Notebook." },
  { file: "1.1 Que es jupyter notebook y para que sirve?.mp4", chapter: 1, title: "¿Qué es Jupyter Notebook y para qué sirve?", description: "Conoce qué son las libretas de Jupyter, su historia y casos de uso en ciencia de datos." },
  { file: "2 Instalacion Jupyter Notebook.mp4", chapter: 2, title: "Instalación de Jupyter Notebook", description: "Instalación completa desde cero usando pip y conda." },
  { file: "2.1 Buenas_practicas.mp4", chapter: 2, title: "Buenas prácticas y configuración de seguridad", description: "Configuración de seguridad básica y buenas prácticas para proteger tus notebooks." },
  { file: "3.1 introduccion a los kernel.mp4", chapter: 3, title: "Introducción a los Kernels de Jupyter", description: "Qué son los kernels y cómo funcionan en Jupyter Notebook." },
  { file: "3.2instalacion de kernels.mp4", chapter: 3, title: "Instalación de Kernels (R y Julia)", description: "Instalación y configuración de kernels para R y Julia en Jupyter." },
  { file: "3.3 Demostracion.mov", chapter: 3, title: "Demostración: Cambio entre lenguajes", description: "Demostración práctica del cambio entre Python, R y Julia en el mismo entorno." },
  { file: "4 Exportar en otros formatos.mp4", chapter: 4, title: "Exportar Notebooks en Diferentes Formatos", description: "Cómo exportar tus notebooks a HTML, PDF, Markdown y scripts de Python con nbconvert." },
  { file: "4.1 Github,Collab,Kaggle.mp4", chapter: 4, title: "Compartir en GitHub, Colab y Kaggle", description: "Uso de plataformas para compartir y publicar tus notebooks de Jupyter." },
  { file: "5.1 widgets.mp4", chapter: 5, title: "Widgets Interactivos con ipywidgets", description: "Creación de sliders, botones y controles interactivos dentro de Jupyter." },
  { file: "5.2 librerias utiles.mp4", chapter: 5, title: "Librerías: Matplotlib, Pandas y Plotly", description: "Visualización de datos con Matplotlib, Pandas y gráficas interactivas con Plotly." },
  { file: "6.1 dbs.mp4", chapter: 6, title: "Conexión con Bases de Datos", description: "Conexión con bases de datos relacionales (SQLAlchemy) y no relacionales (PyMongo)." },
  { file: "6.2 cloud services.mp4", chapter: 6, title: "Integración con Servicios en la Nube", description: "Integración con AWS y Azure desde Jupyter Notebook usando sus SDKs de Python." },
];

const LessonSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
  title: String,
  duration: String,
  description: String,
  videoUrl: String,
  thumbnailUrl: { type: String, default: "" },
});
const Lesson = mongoose.model("Lesson", LessonSchema);

const ChapterSchema = new mongoose.Schema({
  title: String,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
});
const Chapter = mongoose.model("Chapter", ChapterSchema);

function getDuration(filePath) {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { encoding: "utf8" }
    ).trim();
    const secs = Math.round(parseFloat(out));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  } catch {
    return "0:00";
  }
}

async function uploadVideo(entry) {
  const filePath = path.join(VIDEOS_DIR, entry.file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ Archivo no encontrado: ${entry.file}`);
    return null;
  }

  const size = fs.statSync(filePath).size;
  const ext = path.extname(entry.file).toLowerCase();
  const key = `videos/${Date.now()}-${entry.file.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const contentType = ext === ".mov" ? "video/quicktime" : "video/mp4";

  console.log(`  Subiendo (${(size / 1024 / 1024).toFixed(0)} MB)...`);

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: contentType,
    },
    partSize: 50 * 1024 * 1024,
    queueSize: 3,
  });

  upload.on("httpUploadProgress", (p) => {
    if (p.total) {
      const pct = Math.floor((p.loaded / p.total) * 100);
      process.stdout.write(`\r  Progreso: ${pct}%`);
    }
  });

  await upload.done();
  process.stdout.write("\r  Subido ✓                    \n");

  return `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/${key}`;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB conectado\n");

  for (const entry of VIDEO_MAP) {
    console.log(`\n[Cap ${entry.chapter}] ${entry.title}`);

    const videoUrl = await uploadVideo(entry);
    if (!videoUrl) continue;

    const filePath = path.join(VIDEOS_DIR, entry.file);
    const duration = getDuration(filePath);
    const chapterId = CHAPTER_IDS[entry.chapter];

    const lesson = new Lesson({
      chapterId,
      title: entry.title,
      duration,
      description: entry.description,
      videoUrl,
      thumbnailUrl: "",
    });
    await lesson.save();

    await Chapter.findByIdAndUpdate(chapterId, { $push: { lessons: lesson._id } });

    console.log(`  Lección creada: ${lesson._id} (${duration})`);
  }

  console.log("\n✓ Todos los videos subidos.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
