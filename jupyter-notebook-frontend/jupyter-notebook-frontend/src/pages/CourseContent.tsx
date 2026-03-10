import React, { useEffect, useState } from "react";
import Navbar from "../components/HomePage/navbar";
import axios from "axios";
import {
  Play,
  CheckCircle,
  Lock,
  ChevronRight,
  Search,
  Loader2,
  AlertTriangle,
  Terminal,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import JupyterVideoPlayer from "../components/VideoPlayer/JupyterVideoPlayer";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  completed?: boolean;
  locked?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  image?: string;
  lessons: Lesson[];
}

interface ChapterMeta {
  summary: string;
  topics: string[];
  commands: { label: string; code: string }[];
}

// Contenido estático por índice de capítulo (0-based)
const chapterMeta: ChapterMeta[] = [
  {
    summary:
      "En este módulo conocerás qué son las libretas de Jupyter, para qué sirven y cómo se convirtieron en la herramienta estándar en ciencia de datos y machine learning. Exploraremos su historia desde IPython hasta el ecosistema actual.",
    topics: [
      "¿Qué son las libretas de Jupyter y cuál es su uso?",
      "Historia y evolución del proyecto Jupyter",
      "Casos de uso en ciencia de datos y machine learning",
    ],
    commands: [
      { label: "Iniciar Jupyter Notebook", code: "jupyter notebook" },
      { label: "Iniciar JupyterLab", code: "jupyter lab" },
      { label: "Ver servidores activos", code: "jupyter notebook list" },
      { label: "Detener el servidor", code: "jupyter notebook stop" },
    ],
  },
  {
    summary:
      "Aprenderás a instalar Jupyter Notebook desde cero usando pip o conda, a generar el archivo de configuración y a proteger tu servidor con contraseña y tokens. También veremos buenas prácticas para organizar y versionar tus notebooks.",
    topics: [
      "Instalación completa desde cero con pip y conda",
      "Configuración de seguridad básica (contraseña y tokens)",
      "Buenas prácticas para proteger y organizar notebooks",
    ],
    commands: [
      { label: "Instalar Jupyter (pip)", code: "pip install notebook" },
      { label: "Instalar JupyterLab", code: "pip install jupyterlab" },
      { label: "Instalar con Conda", code: "conda install -c conda-forge notebook" },
      { label: "Generar archivo de configuración", code: "jupyter notebook --generate-config" },
      { label: "Configurar contraseña", code: "jupyter notebook password" },
    ],
  },
  {
    summary:
      "Descubrirás cómo Jupyter permite trabajar con múltiples lenguajes de programación a través de los kernels. Aprenderás a instalar y cambiar entre kernels de Python, R y Julia dentro del mismo entorno.",
    topics: [
      "Introducción a los kernels de Jupyter",
      "Instalación del kernel de R (IRkernel)",
      "Instalación del kernel de Julia (IJulia)",
      "Cambio entre kernels en un notebook",
    ],
    commands: [
      { label: "Ver kernels instalados", code: "jupyter kernelspec list" },
      { label: "Instalar kernel de Python en entorno virtual", code: "python -m ipykernel install --user --name myenv --display-name 'Python (myenv)'" },
      { label: "Eliminar un kernel", code: "jupyter kernelspec remove nombre_kernel" },
      { label: "Instalar IRkernel (desde R)", code: 'install.packages("IRkernel")\nIRkernel::installspec()' },
    ],
  },
  {
    summary:
      "Verás cómo exportar tus notebooks a distintos formatos (HTML, PDF, Markdown, script de Python) y cómo compartirlos en plataformas como GitHub, Google Colab y Kaggle para que otros puedan verlos o ejecutarlos.",
    topics: [
      "Exportar notebooks con nbconvert",
      "Compartir en GitHub y nbviewer",
      "Uso de Google Colaboratory",
      "Publicar en Kaggle Notebooks",
    ],
    commands: [
      { label: "Exportar a HTML", code: "jupyter nbconvert --to html notebook.ipynb" },
      { label: "Exportar a PDF", code: "jupyter nbconvert --to pdf notebook.ipynb" },
      { label: "Exportar a script Python", code: "jupyter nbconvert --to script notebook.ipynb" },
      { label: "Exportar a Markdown", code: "jupyter nbconvert --to markdown notebook.ipynb" },
      { label: "Ejecutar y exportar en un paso", code: "jupyter nbconvert --to html --execute notebook.ipynb" },
    ],
  },
  {
    summary:
      "Aprenderás a crear visualizaciones y widgets interactivos dentro de tus notebooks usando ipywidgets, matplotlib, pandas y plotly. Al final podrás crear dashboards básicos sin salir de Jupyter.",
    topics: [
      "Widgets interactivos con ipywidgets",
      "Gráficas estáticas con Matplotlib",
      "Análisis y visualización con Pandas",
      "Gráficas interactivas con Plotly",
    ],
    commands: [
      { label: "Mostrar gráficas en el notebook", code: "%matplotlib inline" },
      { label: "Importar librerías principales", code: "import matplotlib.pyplot as plt\nimport pandas as pd\nimport plotly.express as px\nimport ipywidgets as widgets" },
      { label: "Crear gráfica básica", code: "plt.plot([1, 2, 3], [4, 5, 6])\nplt.title('Mi gráfica')\nplt.show()" },
      { label: "Slider interactivo", code: "widgets.interact(lambda x: x**2, x=(0, 10))" },
      { label: "Gráfica interactiva con Plotly", code: "fig = px.line(df, x='col_x', y='col_y')\nfig.show()" },
    ],
  },
  {
    summary:
      "Conectarás Jupyter con bases de datos relacionales (MySQL, PostgreSQL) y no relacionales (MongoDB), y aprenderás a integrar servicios en la nube de AWS y Azure para procesar grandes volúmenes de datos desde tus notebooks.",
    topics: [
      "Conexión con bases de datos relacionales con SQLAlchemy",
      "Conexión con MongoDB con PyMongo",
      "Integración con AWS (boto3 y S3)",
      "Integración con Azure SDK para Python",
    ],
    commands: [
      { label: "Conectar a base de datos SQL", code: "from sqlalchemy import create_engine\nengine = create_engine('postgresql://user:pass@host/dbname')" },
      { label: "Leer tabla SQL a DataFrame", code: "import pandas as pd\ndf = pd.read_sql('SELECT * FROM tabla', engine)" },
      { label: "Conectar a MongoDB", code: "import pymongo\nclient = pymongo.MongoClient('mongodb://localhost:27017/')\ndb = client['mi_base_de_datos']" },
      { label: "Conectar a AWS S3", code: "import boto3\ns3 = boto3.client('s3',\n  aws_access_key_id='KEY',\n  aws_secret_access_key='SECRET'\n)" },
      { label: "Listar buckets S3", code: "response = s3.list_buckets()\nfor bucket in response['Buckets']:\n    print(bucket['Name'])" },
    ],
  },
];

// Fallback si hay más capítulos que metadatos
const defaultMeta: ChapterMeta = {
  summary: "Contenido de este capítulo del curso de Jupyter Notebook.",
  topics: [],
  commands: [],
};

const CommandBlock: React.FC<{ cmd: { label: string; code: string } }> = ({ cmd }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(cmd.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/5">
        <span className="text-white/40 text-xs">{cmd.label}</span>
        <button
          onClick={copy}
          className="text-xs text-white/30 hover:text-[#FF5722] transition-colors"
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <pre className="px-3 py-2.5 text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {cmd.code}
      </pre>
    </div>
  );
};

const ChapterOverview: React.FC<{ chapter: Chapter; index: number }> = ({
  chapter,
  index,
}) => {
  const meta = chapterMeta[index] ?? defaultMeta;

  return (
    <motion.div
      key={chapter.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Header del capítulo */}
      <div className="bg-[#2A2A2A] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-9 h-9 rounded-xl bg-[#FF5722] flex items-center justify-center text-sm font-bold flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="text-xl font-bold">{chapter.title}</h2>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">{meta.summary}</p>
      </div>

      {/* Temas del capítulo */}
      {meta.topics.length > 0 && (
        <div className="bg-[#2A2A2A] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-[#FF5722]" />
            <h3 className="font-semibold text-sm">Temas de este capítulo</h3>
          </div>
          <ul className="space-y-2">
            {meta.topics.map((topic, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] flex-shrink-0 mt-1.5" />
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comandos básicos */}
      {meta.commands.length > 0 && (
        <div className="bg-[#2A2A2A] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-[#FF5722]" />
            <h3 className="font-semibold text-sm">Comandos básicos</h3>
          </div>
          <div className="space-y-2">
            {meta.commands.map((cmd, i) => (
              <CommandBlock key={i} cmd={cmd} />
            ))}
          </div>
        </div>
      )}

      {/* Prompt si no hay lecciones */}
      {chapter.lessons.length === 0 && (
        <div className="bg-[#2A2A2A] rounded-xl p-6 text-center text-white/40 text-sm">
          Las lecciones de este capítulo aún no están disponibles.
        </div>
      )}
    </motion.div>
  );
};

const CommandsPanel: React.FC<{ index: number }> = ({ index }) => {
  const [open, setOpen] = useState(false);
  const meta = chapterMeta[index] ?? defaultMeta;
  if (meta.commands.length === 0) return null;

  return (
    <div className="bg-[#2A2A2A] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <Terminal className="w-4 h-4 text-[#FF5722]" />
        <span className="flex-1 text-left font-semibold text-sm">
          Comandos útiles de este capítulo
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-2">
              {meta.commands.map((cmd, i) => (
                <CommandBlock key={i} cmd={cmd} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CourseContent: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Debes iniciar sesión para ver el contenido");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:3000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data: Chapter[] = res.data;
        setChapters(data);
        if (data.length > 0) {
          setActiveChapter(data[0]);
          setActiveChapterIndex(0);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el contenido. Por favor, intenta de nuevo.");
        setLoading(false);
      });
  }, []);

  const filteredChapters = chapters.filter(
    (chapter) =>
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.lessons.some((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectChapter = (chapter: Chapter, index: number) => {
    setActiveChapter(chapter);
    setActiveChapterIndex(index);
    setActiveLesson(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-[#FF5722] animate-spin mb-4" />
          <p className="text-xl">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">
        <div className="bg-[#2A2A2A] p-8 rounded-xl max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-[#FF5722] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-2 px-6 rounded-lg text-sm font-medium"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => window.location.replace("/")}
              className="bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-lg text-sm font-medium"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">
        <div className="bg-[#2A2A2A] p-8 rounded-xl max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">No hay contenido disponible</h2>
          <p className="text-white/80">Vuelve más tarde para ver nuevo contenido.</p>
          <Link
            to="/"
            className="mt-6 inline-block bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-2 px-6 rounded-lg text-sm font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <Navbar />

      {/* Header */}
      <header className="bg-[#FF5722] py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Contenido del Curso</h1>
            <p className="text-white/70 text-sm mt-1">
              {chapters.length} {chapters.length === 1 ? "capítulo" : "capítulos"} disponibles
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Buscar lecciones..."
              className="w-full bg-black/20 border border-white/20 rounded-xl py-2 px-4 pl-9 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#2A2A2A] rounded-xl overflow-hidden sticky top-8">
              <div className="p-4 bg-[#333]">
                <h2 className="font-semibold">Módulos del curso</h2>
                <p className="text-white/50 text-xs mt-0.5">
                  {chapters.length} {chapters.length === 1 ? "módulo" : "módulos"}
                </p>
              </div>

              <div className="p-3 max-h-[75vh] overflow-y-auto space-y-1">
                {filteredChapters.length > 0 ? (
                  filteredChapters.map((chapter) => {
                    const realIndex = chapters.findIndex((c) => c.id === chapter.id);
                    const isActive = activeChapter?.id === chapter.id;

                    return (
                      <div key={chapter.id}>
                        {/* Chapter button */}
                        <button
                          onClick={() => selectChapter(chapter, realIndex)}
                          className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-[#FF5722]/10 text-[#FF5722]"
                              : "text-white/80 hover:bg-white/5"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                              isActive ? "bg-[#FF5722] text-white" : "bg-white/5 text-white/30"
                            }`}
                          >
                            {String(realIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 font-medium text-sm leading-tight">
                            {chapter.title}
                          </span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? "rotate-90" : ""}`}
                          />
                        </button>

                        {/* Lessons list */}
                        <AnimatePresence>
                          {(isActive || searchQuery) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 pl-3 border-l border-white/10 mt-1 mb-1 space-y-0.5">
                                {chapter.lessons
                                  .filter((l) =>
                                    searchQuery
                                      ? l.title.toLowerCase().includes(searchQuery.toLowerCase())
                                      : true
                                  )
                                  .map((lesson) => (
                                    <motion.button
                                      key={lesson.id}
                                      onClick={() => {
                                        setActiveChapter(chapter);
                                        setActiveChapterIndex(realIndex);
                                        setActiveLesson(lesson);
                                      }}
                                      whileHover={{ x: 3 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                      className={`flex items-center gap-2.5 w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                                        activeLesson?.id === lesson.id
                                          ? "text-[#FF5722] bg-[#FF5722]/5"
                                          : lesson.locked
                                          ? "text-white/30"
                                          : "text-white/60 hover:text-white/90"
                                      }`}
                                    >
                                      {lesson.completed ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                      ) : lesson.locked ? (
                                        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                                      ) : (
                                        <Play className="w-3.5 h-3.5 flex-shrink-0" />
                                      )}
                                      <span className="flex-1 leading-tight">{lesson.title}</span>
                                      <span className="text-white/30 flex-shrink-0">{lesson.duration}</span>
                                    </motion.button>
                                  ))}
                                {chapter.lessons.length === 0 && (
                                  <p className="text-xs text-white/25 px-2 py-1.5">
                                    Sin lecciones aún
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-6 text-white/40 text-sm">
                    No se encontraron resultados
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {activeLesson && activeChapter ? (
              // Vista de lección activa
              <motion.div
                key={activeLesson.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                {/* Video */}
                <div className="bg-[#2A2A2A] rounded-xl overflow-hidden">
                  {activeLesson.locked ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-black/40">
                      <Lock className="w-12 h-12 text-white/30 mb-3" />
                      <p className="text-white/50 text-sm">Esta lección está bloqueada</p>
                    </div>
                  ) : (
                    <JupyterVideoPlayer
                      src={activeLesson.videoUrl}
                      thumbnail={activeLesson.thumbnail}
                      title={activeLesson.title}
                    />
                  )}
                </div>

                {/* Info de la lección */}
                <div className="bg-[#2A2A2A] rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h2 className="text-xl font-bold">{activeLesson.title}</h2>
                      <p className="text-white/50 text-sm mt-1">
                        {activeChapter.title} · {activeLesson.duration}
                      </p>
                    </div>
                    {activeLesson.completed && (
                      <span className="flex-shrink-0 bg-green-500/15 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                        Completado
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {activeLesson.description}
                  </p>
                  <button className="mt-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white py-2 px-5 rounded-lg text-sm font-medium transition-colors">
                    Marcar como completada
                  </button>
                </div>

                {/* Comandos del capítulo */}
                <CommandsPanel index={activeChapterIndex} />

                {/* Navegación */}
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const idx = activeChapter.lessons.findIndex((l) => l.id === activeLesson.id);
                    if (idx > 0) {
                      const prev = activeChapter.lessons[idx - 1];
                      return (
                        <button
                          onClick={() => setActiveLesson(prev)}
                          className="bg-[#2A2A2A] hover:bg-[#333] rounded-xl p-4 flex items-center gap-3 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-white/40">Anterior</p>
                            <p className="text-sm font-medium truncate">{prev.title}</p>
                          </div>
                        </button>
                      );
                    }
                    return <div />;
                  })()}

                  {(() => {
                    const idx = activeChapter.lessons.findIndex((l) => l.id === activeLesson.id);
                    if (idx < activeChapter.lessons.length - 1) {
                      const next = activeChapter.lessons[idx + 1];
                      return (
                        <button
                          onClick={() => setActiveLesson(next)}
                          className="bg-[#2A2A2A] hover:bg-[#333] rounded-xl p-4 flex items-center justify-between gap-3 transition-colors text-left"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-white/40 text-right">Siguiente</p>
                            <p className="text-sm font-medium truncate">{next.title}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </button>
                      );
                    }
                    return <div />;
                  })()}
                </div>
              </motion.div>
            ) : activeChapter ? (
              // Vista de overview del capítulo
              <ChapterOverview chapter={activeChapter} index={activeChapterIndex} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
