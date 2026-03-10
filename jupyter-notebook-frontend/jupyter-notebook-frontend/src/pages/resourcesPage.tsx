import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  BookOpen,
  ChevronDown,
  Search,
  Globe,
  Github,
  Video,
  FileText,
  Package,
  Star,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import Navbar from "../components/HomePage/navbar";

interface Resource {
  title: string;
  description: string;
  url: string;
  type: "docs" | "video" | "github" | "tool" | "article" | "platform" | "cheatsheet";
}

interface Module {
  number: number;
  title: string;
  topics: string[];
  resources: Resource[];
}

interface ExtraSection {
  title: string;
  description: string;
  items: Resource[];
}

const typeIcon: Record<Resource["type"], React.ReactNode> = {
  docs: <FileText className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
  github: <Github className="w-3.5 h-3.5" />,
  tool: <Package className="w-3.5 h-3.5" />,
  article: <BookOpen className="w-3.5 h-3.5" />,
  platform: <Globe className="w-3.5 h-3.5" />,
  cheatsheet: <ClipboardList className="w-3.5 h-3.5" />,
};

const typeLabel: Record<Resource["type"], string> = {
  docs: "Documentación",
  video: "Video",
  github: "GitHub",
  tool: "Herramienta",
  article: "Artículo",
  platform: "Plataforma",
  cheatsheet: "Cheatsheet",
};

const typeBadgeClass: Record<Resource["type"], string> = {
  docs: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  video: "bg-red-500/10 text-red-400 border-red-500/20",
  github: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  tool: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  article: "bg-green-500/10 text-green-400 border-green-500/20",
  platform: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  cheatsheet: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const modules: Module[] = [
  {
    number: 1,
    title: "Introducción a Jupyter Notebook",
    topics: [
      "¿Qué son las libretas de Jupyter y cuál es su uso?",
      "Historia y evolución",
      "Casos de uso en ciencia de datos y machine learning",
    ],
    resources: [
      {
        title: "Documentación oficial de Jupyter Notebook",
        description:
          "Guía completa oficial con todos los conceptos, funciones y características de Jupyter Notebook.",
        url: "https://jupyter-notebook.readthedocs.io/en/stable/",
        type: "docs",
      },
      {
        title: "Project Jupyter — Sitio oficial",
        description:
          "Página principal del proyecto Jupyter con información sobre el ecosistema completo.",
        url: "https://jupyter.org/",
        type: "platform",
      },
      {
        title: "Historia del Proyecto Jupyter",
        description:
          "Resumen de la historia del proyecto, sus orígenes en IPython y su evolución hasta hoy.",
        url: "https://en.wikipedia.org/wiki/Project_Jupyter",
        type: "article",
      },
      {
        title: "Jupyter para ciencia de datos — Towards Data Science",
        description:
          "Artículo con casos de uso reales de Jupyter en proyectos de ciencia de datos y machine learning.",
        url: "https://towardsdatascience.com/jupyter-notebook-for-data-science-51b4b7a0c58f",
        type: "article",
      },
    ],
  },
  {
    number: 2,
    title: "Instalación y Configuración",
    topics: [
      "Instalación completa desde cero",
      "Configuración de seguridad básica",
      "Buenas prácticas para proteger nuestros notebooks",
    ],
    resources: [
      {
        title: "Guía de instalación oficial — Jupyter",
        description:
          "Instrucciones oficiales para instalar Jupyter Notebook y JupyterLab usando pip o conda.",
        url: "https://jupyter.org/install",
        type: "docs",
      },
      {
        title: "Anaconda Distribution",
        description:
          "Distribución de Python que incluye Jupyter, NumPy, Pandas y más de 300 paquetes científicos.",
        url: "https://www.anaconda.com/download",
        type: "tool",
      },
      {
        title: "Configuración de seguridad en Jupyter",
        description:
          "Documentación oficial sobre contraseñas, tokens y SSL para proteger tu servidor de Jupyter.",
        url: "https://jupyter-notebook.readthedocs.io/en/stable/security.html",
        type: "docs",
      },
      {
        title: "Buenas prácticas con notebooks",
        description:
          "Guía con recomendaciones para organizar, nombrar y versionar tus notebooks profesionalmente.",
        url: "https://jupyter4edu.github.io/jupyter-edu-book/",
        type: "article",
      },
    ],
  },
  {
    number: 3,
    title: "Uso de Múltiples Lenguajes",
    topics: [
      "Introducción a los kernels de Jupyter",
      "Cambio entre diferentes lenguajes (R, Julia, Python)",
    ],
    resources: [
      {
        title: "Lista completa de kernels de Jupyter",
        description:
          "Repositorio oficial con más de 100 kernels disponibles para distintos lenguajes.",
        url: "https://github.com/jupyter/jupyter/wiki/Jupyter-kernels",
        type: "github",
      },
      {
        title: "IRkernel — Kernel de R para Jupyter",
        description:
          "Instrucciones para instalar y configurar el kernel de R en Jupyter Notebook.",
        url: "https://irkernel.github.io/installation/",
        type: "docs",
      },
      {
        title: "IJulia — Kernel de Julia para Jupyter",
        description:
          "Paquete oficial para ejecutar código Julia dentro de Jupyter Notebook y JupyterLab.",
        url: "https://github.com/JuliaLang/IJulia.jl",
        type: "github",
      },
      {
        title: "Documentación de kernels — Jupyter",
        description:
          "Explicación detallada de cómo funcionan los kernels y cómo cambiar entre ellos.",
        url: "https://docs.jupyter.org/en/latest/projects/kernels.html",
        type: "docs",
      },
    ],
  },
  {
    number: 4,
    title: "Compartir Libretas de Trabajo",
    topics: [
      "Exportar notebooks en diferentes formatos",
      "Uso de plataformas para compartir notebooks (GitHub, Colab, Kaggle)",
    ],
    resources: [
      {
        title: "nbconvert — Exportar notebooks",
        description:
          "Herramienta oficial para convertir notebooks a HTML, PDF, LaTeX, Markdown y más.",
        url: "https://nbconvert.readthedocs.io/en/latest/",
        type: "docs",
      },
      {
        title: "Google Colaboratory",
        description:
          "Plataforma gratuita de Google para ejecutar notebooks en la nube con GPU/TPU.",
        url: "https://colab.research.google.com/",
        type: "platform",
      },
      {
        title: "Kaggle Notebooks",
        description:
          "Entorno de notebooks en la nube con acceso a datasets públicos y GPU gratuita.",
        url: "https://www.kaggle.com/notebooks",
        type: "platform",
      },
      {
        title: "nbviewer — Visualizar notebooks de GitHub",
        description:
          "Servicio para renderizar y compartir notebooks de Jupyter sin necesidad de ejecutarlos.",
        url: "https://nbviewer.org/",
        type: "platform",
      },
    ],
  },
  {
    number: 5,
    title: "Salidas Interactivas",
    topics: [
      "Widgets y visualizaciones interactivas",
      "Librerías: Matplotlib, Pandas, Plotly",
    ],
    resources: [
      {
        title: "ipywidgets — Widgets interactivos",
        description:
          "Librería oficial para crear sliders, botones, dropdowns y controles interactivos en Jupyter.",
        url: "https://ipywidgets.readthedocs.io/en/stable/",
        type: "docs",
      },
      {
        title: "Matplotlib — Documentación oficial",
        description:
          "Librería fundamental para crear gráficas estáticas, animadas e interactivas en Python.",
        url: "https://matplotlib.org/stable/users/index",
        type: "docs",
      },
      {
        title: "Pandas — Documentación oficial",
        description:
          "Librería esencial para manipulación y análisis de datos tabulares con soporte para visualización.",
        url: "https://pandas.pydata.org/docs/",
        type: "docs",
      },
      {
        title: "Plotly — Gráficas interactivas",
        description:
          "Librería para visualizaciones interactivas de alta calidad: dashboards, mapas, gráficas 3D.",
        url: "https://plotly.com/python/",
        type: "docs",
      },
    ],
  },
  {
    number: 6,
    title: "Integración de Big Data",
    topics: [
      "Conexión con bases de datos relacionales y no relacionales",
      "Integración de herramientas en la nube (AWS y Azure)",
    ],
    resources: [
      {
        title: "SQLAlchemy — Bases de datos relacionales",
        description:
          "Librería para conectar Python con MySQL, PostgreSQL, SQLite y otras bases de datos.",
        url: "https://docs.sqlalchemy.org/en/20/",
        type: "docs",
      },
      {
        title: "PyMongo — MongoDB con Python",
        description:
          "Driver oficial de MongoDB para Python, ideal para bases de datos no relacionales.",
        url: "https://pymongo.readthedocs.io/en/stable/",
        type: "docs",
      },
      {
        title: "Boto3 — AWS SDK para Python",
        description:
          "SDK oficial de AWS para interactuar con S3, EC2, SageMaker y más desde Jupyter.",
        url: "https://boto3.amazonaws.com/v1/documentation/api/latest/index.html",
        type: "docs",
      },
      {
        title: "Azure SDK para Python",
        description:
          "Librerías de Microsoft Azure para conectar Jupyter con servicios en la nube.",
        url: "https://learn.microsoft.com/es-es/azure/developer/python/",
        type: "docs",
      },
      {
        title: "PySpark — Big Data con Apache Spark",
        description:
          "Interfaz de Python para Apache Spark para procesar grandes volúmenes de datos distribuidos.",
        url: "https://spark.apache.org/docs/latest/api/python/",
        type: "docs",
      },
    ],
  },
];

const extraSections: ExtraSection[] = [
  {
    title: "Markdown en Jupyter",
    description: "Domina el formato de texto dentro de tus notebooks",
    items: [
      {
        title: "Guía completa de Markdown",
        description:
          "Referencia completa de la sintaxis Markdown: encabezados, listas, tablas, código, enlaces e imágenes.",
        url: "https://www.markdownguide.org/",
        type: "docs",
      },
      {
        title: "Markdown en Jupyter — Documentación oficial",
        description:
          "Cómo usar Markdown dentro de las celdas de texto en Jupyter, incluyendo LaTeX para fórmulas matemáticas.",
        url: "https://jupyter-notebook.readthedocs.io/en/stable/examples/Notebook/Working%20With%20Markdown%20Cells.html",
        type: "docs",
      },
      {
        title: "LaTeX en Jupyter — Fórmulas matemáticas",
        description:
          "Escribe ecuaciones matemáticas profesionales usando LaTeX directamente en celdas Markdown de Jupyter.",
        url: "https://en.wikibooks.org/wiki/LaTeX/Mathematics",
        type: "article",
      },
    ],
  },
  {
    title: "Magic Commands",
    description: "Comandos especiales que potencian tus notebooks",
    items: [
      {
        title: "Magic commands — Documentación IPython",
        description:
          "Lista completa de comandos mágicos de IPython: %timeit, %matplotlib, %%bash, %run y muchos más.",
        url: "https://ipython.readthedocs.io/en/stable/interactive/magics.html",
        type: "docs",
      },
      {
        title: "Guía práctica de magic commands",
        description:
          "Tutorial con ejemplos reales de los magic commands más útiles para productividad en Jupyter.",
        url: "https://towardsdatascience.com/jupyter-notebook-hints-1f26b08429ad",
        type: "article",
      },
    ],
  },
  {
    title: "Extensiones y Productividad",
    description: "Herramientas para mejorar tu flujo de trabajo",
    items: [
      {
        title: "JupyterLab Extensions",
        description:
          "Catálogo oficial de extensiones para JupyterLab: temas, linters, diff de notebooks y más.",
        url: "https://jupyterlab.readthedocs.io/en/stable/user/extensions.html",
        type: "docs",
      },
      {
        title: "nbextensions — Extensiones para Jupyter Notebook",
        description:
          "Colección de extensiones de la comunidad: tabla de contenidos, autocompletado, spellchecker y más.",
        url: "https://jupyter-contrib-nbextensions.readthedocs.io/en/latest/",
        type: "tool",
      },
      {
        title: "Atajos de teclado en Jupyter",
        description:
          "Guía con todos los atajos de teclado de Jupyter Notebook para trabajar más rápido.",
        url: "https://towardsdatascience.com/jypyter-notebook-shortcuts-bf0101a98330",
        type: "article",
      },
    ],
  },
  {
    title: "Librerías Adicionales Útiles",
    description: "Herramientas complementarias que no se vieron en el curso",
    items: [
      {
        title: "Seaborn — Visualización estadística",
        description:
          "Librería basada en Matplotlib especializada en gráficas estadísticas atractivas con muy poco código.",
        url: "https://seaborn.pydata.org/",
        type: "docs",
      },
      {
        title: "Scikit-learn — Machine Learning",
        description:
          "La librería más popular de machine learning en Python: clasificación, regresión, clustering y más.",
        url: "https://scikit-learn.org/stable/",
        type: "docs",
      },
      {
        title: "NumPy — Computación numérica",
        description:
          "Librería fundamental para computación científica: arrays multidimensionales, álgebra lineal y más.",
        url: "https://numpy.org/doc/stable/",
        type: "docs",
      },
      {
        title: "SciPy — Ciencia e ingeniería",
        description:
          "Ecosistema para matemáticas, ciencia e ingeniería: integración, optimización, estadística y señales.",
        url: "https://docs.scipy.org/doc/scipy/",
        type: "docs",
      },
      {
        title: "Altair — Visualización declarativa",
        description:
          "Librería de visualización estadística basada en Vega-Lite, ideal para gráficas interactivas con pocas líneas.",
        url: "https://altair-viz.github.io/",
        type: "docs",
      },
      {
        title: "Folium — Mapas interactivos",
        description:
          "Crea mapas interactivos geoespaciales directamente en Jupyter usando Leaflet.js desde Python.",
        url: "https://python-visualization.github.io/folium/",
        type: "docs",
      },
    ],
  },
];

const cheatsheets: Resource[] = [
  {
    title: "Python — Cheatsheet completo",
    description: "Referencia rápida de sintaxis Python: tipos, funciones, clases, list comprehensions y más.",
    url: "https://www.pythoncheatsheet.org/",
    type: "cheatsheet",
  },
  {
    title: "Pandas — Cheatsheet oficial",
    description: "Hoja de referencia oficial de Pandas con los métodos más usados para manipulación de datos.",
    url: "https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf",
    type: "cheatsheet",
  },
  {
    title: "NumPy — Cheatsheet",
    description: "Referencia rápida de NumPy: creación de arrays, indexing, operaciones matemáticas y broadcasting.",
    url: "https://numpy.org/doc/stable/user/numpy-for-matlab-users.html",
    type: "cheatsheet",
  },
  {
    title: "Matplotlib — Cheatsheet",
    description: "Guía visual rápida de Matplotlib con los tipos de gráficas más comunes y su código.",
    url: "https://matplotlib.org/cheatsheets/",
    type: "cheatsheet",
  },
  {
    title: "Seaborn — Galería de gráficas",
    description: "Galería de todos los tipos de gráficas de Seaborn con código de ejemplo listo para usar.",
    url: "https://seaborn.pydata.org/examples/index.html",
    type: "cheatsheet",
  },
  {
    title: "Scikit-learn — Cheatsheet",
    description: "Mapa mental de algoritmos de scikit-learn: cuándo usar cada modelo y cómo implementarlo.",
    url: "https://scikit-learn.org/stable/tutorial/machine_learning_map/index.html",
    type: "cheatsheet",
  },
  {
    title: "Jupyter — Atajos de teclado",
    description: "Todos los atajos de teclado de Jupyter Notebook en una sola página imprimible.",
    url: "https://cheatography.com/weidadeyue/cheat-sheets/jupyter-notebook/",
    type: "cheatsheet",
  },
  {
    title: "Markdown — Cheatsheet",
    description: "Sintaxis Markdown completa en una sola hoja: encabezados, tablas, código, imágenes y más.",
    url: "https://www.markdownguide.org/cheat-sheet/",
    type: "cheatsheet",
  },
];

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex flex-col gap-3 p-4 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 hover:border-[#FF5722]/40 rounded-xl transition-all duration-200"
  >
    <div className="flex items-start justify-between gap-3">
      <span className="text-white/90 font-medium text-sm leading-snug group-hover:text-white transition-colors">
        {resource.title}
      </span>
      <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-[#FF5722] flex-shrink-0 mt-0.5 transition-colors" />
    </div>
    <p className="text-white/40 text-xs leading-relaxed flex-1">
      {resource.description}
    </p>
    <span
      className={`self-start flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${typeBadgeClass[resource.type]}`}
    >
      {typeIcon[resource.type]}
      {typeLabel[resource.type]}
    </span>
  </a>
);

const ModuleCard: React.FC<{
  module: Module;
  searchQuery: string;
  index: number;
}> = ({ module, searchQuery, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredResources = module.resources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchesSearch =
    searchQuery === "" ||
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.topics.some((t) =>
      t.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    filteredResources.length > 0;

  if (!matchesSearch) return null;

  const resourcesToShow = searchQuery ? filteredResources : module.resources;
  const expanded = isOpen || searchQuery !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
        expanded ? "border-[#FF5722]/30 bg-[#242424]" : "border-white/5 bg-[#242424]"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
            expanded ? "bg-[#FF5722] text-white" : "bg-white/5 text-white/40"
          }`}
        >
          {String(module.number).padStart(2, "0")}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm">{module.title}</h3>
          <p className="text-white/35 text-xs mt-0.5">
            {module.topics.length} temas · {module.resources.length} recursos
          </p>
        </div>
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            expanded ? "bg-[#FF5722]/15 rotate-180" : "bg-white/5"
          }`}
        >
          <ChevronDown className="w-4 h-4 text-white/50" />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {module.topics.map((topic, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/15 px-3 py-1 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
            <div className="mx-5 border-t border-white/5 mb-4" />
            <div className="px-5 pb-5 grid gap-3 sm:grid-cols-2">
              {resourcesToShow.map((resource, i) => (
                <ResourceCard key={i} resource={resource} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SectionBlock: React.FC<{
  section: ExtraSection;
  index: number;
  searchQuery: string;
}> = ({ section, index, searchQuery }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filtered = section.items.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matches =
    searchQuery === "" ||
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    filtered.length > 0;

  if (!matches) return null;

  const toShow = searchQuery ? filtered : section.items;
  const expanded = isOpen || searchQuery !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
        expanded ? "border-emerald-500/30 bg-[#242424]" : "border-white/5 bg-[#242424]"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            expanded
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-white/5 text-white/30"
          }`}
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm">{section.title}</h3>
          <p className="text-white/35 text-xs mt-0.5">{section.description}</p>
        </div>
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            expanded ? "bg-emerald-500/15 rotate-180" : "bg-white/5"
          }`}
        >
          <ChevronDown className="w-4 h-4 text-white/50" />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mx-5 border-t border-white/5 mb-4" />
            <div className="px-5 pb-5 grid gap-3 sm:grid-cols-2">
              {toShow.map((resource, i) => (
                <ResourceCard key={i} resource={resource} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const totalResources =
    modules.reduce((acc, m) => acc + m.resources.length, 0) +
    extraSections.reduce((acc, s) => acc + s.items.length, 0) +
    cheatsheets.length;

  const noResults =
    searchQuery !== "" &&
    modules.every((m) => {
      const f = m.resources.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return (
        !m.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !m.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) &&
        f.length === 0
      );
    }) &&
    extraSections.every((s) => {
      const f = s.items.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return !s.title.toLowerCase().includes(searchQuery.toLowerCase()) && f.length === 0;
    }) &&
    cheatsheets.every(
      (r) =>
        !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredCheatsheets = cheatsheets.filter(
    (r) =>
      searchQuery === "" ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722] to-[#e64a19]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">
              Jupyter Notebook
            </p>
            <h1 className="text-4xl font-bold mb-3">Recursos del curso</h1>
            <p className="text-white/75 text-sm max-w-md">
              {totalResources} recursos — módulos del curso, contenido extra y cheatsheets de librerías.
            </p>
            <div className="relative mt-6 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Buscar recursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 backdrop-blur border border-white/20 text-white placeholder-white/40 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {/* Repo destacado */}
        <motion.a
          href="https://github.com/Pepisxd/Contenido-curso"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="group flex items-center gap-5 p-5 bg-gradient-to-r from-[#1a1a2e] to-[#242424] border border-purple-500/30 hover:border-purple-400/60 rounded-2xl transition-all duration-200"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Github className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-semibold text-sm">
                Repositorio del curso — Notebooks
              </span>
              <span className="flex items-center gap-1 text-xs bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3" />
                Recurso principal
              </span>
            </div>
            <p className="text-white/45 text-xs leading-relaxed">
              Todos los notebooks utilizados durante el curso organizados por módulo. Descarga, ejecuta y experimenta con el código.
            </p>
            <span className="inline-block mt-2 text-xs text-purple-400">
              github.com/Pepisxd/Contenido-curso
            </span>
          </div>
          <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
        </motion.a>

        {/* Módulos */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-white/20 text-xs">Recursos por módulo</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {modules.map((module, i) => (
          <ModuleCard
            key={module.number}
            module={module}
            searchQuery={searchQuery}
            index={i}
          />
        ))}

        {/* Contenido extra */}
        <div className="flex items-center gap-3 py-2 pt-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-white/20 text-xs flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Contenido extra
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {extraSections.map((section, i) => (
          <SectionBlock
            key={section.title}
            section={section}
            index={i}
            searchQuery={searchQuery}
          />
        ))}

        {/* Cheatsheets */}
        {filteredCheatsheets.length > 0 && (
          <>
            <div className="flex items-center gap-3 py-2 pt-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-white/20 text-xs flex items-center gap-1.5">
                <ClipboardList className="w-3 h-3" />
                Cheatsheets
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#242424] border border-orange-500/20 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Hojas de referencia rápida</h3>
                  <p className="text-white/35 text-xs">Para consultar en cualquier momento</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredCheatsheets.map((cs, i) => (
                  <ResourceCard key={i} resource={cs} />
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Empty state */}
        {noResults && (
          <div className="text-center py-16 text-white/30">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No se encontraron recursos para "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
