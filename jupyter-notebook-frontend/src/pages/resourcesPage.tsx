"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Download,
  ExternalLink,
  FileText,
  Database,
  BookOpen,
  Video,
  Github,
  Search,
  Star,
  Eye,
  Play,
  FileCode,
  Package,
  Globe,
  Filter,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/HomePage/navbar";
import { useResourceStats } from "../hooks/useResourceStats";

interface Resource {
  id: string;
  title: string;
  description: string;
  category:
    | "notebooks"
    | "datasets"
    | "tools"
    | "documentation"
    | "videos"
    | "templates";
  type: "external" | "external" | "video" | "github";
  url: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  rating?: number;
  views?: number;
  lastUpdated: string;
  featured?: boolean;
}

const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const {
    globalStats,
    loading,
    isAuthenticated,
    trackClick,
    toggleStar,
    hasStarred,
    getResourceViews,
    getResourceStars,
  } = useResourceStats();

  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const resources: Resource[] = [
    {
      id: "1",
      title: "Notebook de Introducción a Python",
      description:
        "Documentación oficial de Python, ideal para principiantes que desean aprender los conceptos básicos del lenguaje.",
      category: "documentation",
      type: "external",
      url: "https://docs.python.org/3/",
      tags: ["Python", "Básico", "Variables", "Funciones"],
      difficulty: "beginner",
      lastUpdated: "2024-01-15",
      featured: true,
    },
    {
      id: "2",
      title: "Dataset de Ventas E-commerce",
      description:
        "Conjunto de datos reales de ventas online para practicar análisis exploratorio y técnicas de visualización.",
      category: "datasets",
      type: "external",
      url: "https://www.kaggle.com/datasets/carrie1/ecommerce-data",
      tags: ["CSV", "Ventas", "E-commerce", "Análisis"],
      difficulty: "intermediate",
      lastUpdated: "2024-01-10",
    },
    {
      id: "3",
      title: "Pandas Cheat Sheet Completo",
      description:
        "Guía rápida con los comandos más utilizados de Pandas para manipulación de datos, incluyendo ejemplos de código.",
      category: "documentation",
      type: "external",
      url: "https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf",
      tags: ["Pandas", "Referencia", "Manipulación", "DataFrame"],
      difficulty: "intermediate",
      lastUpdated: "2024-01-20",
      featured: true,
    },
    {
      id: "4",
      title: "Visualización básica con Matplotlib",
      description:
        "En este video de programación en Python, aprenderemos a comenzar a usar Matplotlib. Aprenderemos a crear gráficos de líneas simples, personalizar nuestros gráficos y los fundamentos del trabajo con Matplotlib.",
      category: "videos",
      type: "video",
      url: "https://youtu.be/UO98lJQ3QGI",
      tags: ["Matplotlib", "Visualización", "Gráficos", "Tutorial"],
      difficulty: "beginner",
      lastUpdated: "2024-01-12",
    },
    {
      id: "5",
      title: "Template de Análisis Exploratorio",
      description:
        "Plantilla estructurada para realizar análisis exploratorio de datos de manera sistemática y profesional.",
      category: "templates",
      type: "github",
      url: "https://github.com/example/eda-template",

      tags: ["EDA", "Template", "Análisis", "Estructura"],
      difficulty: "beginner",
      lastUpdated: "2024-01-18",
    },
    {
      id: "6",
      title: "Extensiones Esenciales para Jupyter",
      description:
        "Lista curada de las mejores extensiones para mejorar tu productividad y experiencia con Jupyter Notebook.",
      category: "tools",
      type: "external",
      url: "#",
      tags: ["Extensiones", "Productividad", "Jupyter", "Herramientas"],
      difficulty: "beginner",
      lastUpdated: "2024-01-14",
    },
    {
      id: "7",
      title: "Machine Learning con Scikit-learn",
      description:
        "Notebook avanzado que cubre algoritmos de machine learning usando scikit-learn con casos de uso reales.",
      category: "notebooks",
      type: "external",
      url: "#",
      tags: ["Machine Learning", "Scikit-learn", "Algoritmos", "Predicción"],
      difficulty: "advanced",
      lastUpdated: "2024-01-22",
      featured: true,
    },
    {
      id: "8",
      title: "Dataset de Análisis Financiero",
      description:
        "Datos históricos de mercados financieros para practicar análisis de series temporales y predicción.",
      category: "datasets",
      type: "external",
      url: "#",
      tags: ["Finanzas", "Series Temporales", "Análisis", "Predicción"],
      difficulty: "advanced",
      lastUpdated: "2024-01-19",
    },
    {
      id: "9",
      title: "Markdown Cheat Sheet",
      description:
        "Guía rápida con los comandos más utilizados de Markdown para formatear texto en notebooks y documentos.",
      category: "documentation",
      type: "external",
      url: "https://www.markdownguide.org/cheat-sheet/#extended-syntax",
      tags: ["Markdown", "Referencia", "Formateo", "Texto"],
      difficulty: "beginner",
      lastUpdated: "2024-01-11",
    },
    {
      id: "10",
      title: "Teaching and Learning with Jupyter",
      description:
        "Pequeño libro gratuito sobre cómo usar Jupyter en educación y como sacarle el maximo rendimiento.",
      category: "documentation",
      type: "external",
      url: "https://jupyter4edu.github.io/jupyter-edu-book/",
      tags: ["Jupyter", "Educación", "Enseñanza", "Aprendizaje"],
      difficulty: "beginner",
      lastUpdated: "2024-01-05",
      featured: true,
    },
    {
      id: "11",
      title: "Hanson-ml2",
      description:
        "Una serie de notebooks de Jupyter que nos acompañan en el aprendizaje de Machine Learning y Deep Learning en python.",
      category: "notebooks",
      type: "github",
      url: "https://github.com/ageron/handson-ml2",
      tags: [
        "Machine Learning",
        "Deep Learning",
        "Python",
        "Scikit-learn",
        "TensorFlow",
      ],
      difficulty: "intermediate",
      lastUpdated: "2024-01-25",
    },
    {
      id: "12",
      title: "Pytorch Tutorials",
      description:
        "Tutoriales de Pytorch para aprender a usar esta potente librería de Deep Learning.",
      category: "notebooks",
      type: "github",
      url: "https://github.com/pytorch/tutorials",
      tags: ["Deep Learning", "Python", "Pytorch", "Neural Networks"],
      difficulty: "advanced",
      lastUpdated: "2024-01-20",
    },
    {
      id: "13",
      title: "Google Colab",
      description:
        "Google Colab es una herramienta gratuita que permite ejecutar notebooks de Jupyter en la nube sin necesidad de configuración.",
      category: "tools",
      type: "external",
      url: "https://colab.research.google.com/",
      tags: ["Jupyter", "Colab", "Nube", "Gratis"],
      difficulty: "beginner",
      lastUpdated: "2024-01-10",
      featured: true,
    },
  ];

  const categories = [
    { id: "all", name: "Todos", icon: Globe, count: resources.length },
    {
      id: "notebooks",
      name: "Notebooks",
      icon: FileCode,
      count: resources.filter((r) => r.category === "notebooks").length,
    },
    {
      id: "datasets",
      name: "Datasets",
      icon: Database,
      count: resources.filter((r) => r.category === "datasets").length,
    },
    {
      id: "documentation",
      name: "Documentación",
      icon: BookOpen,
      count: resources.filter((r) => r.category === "documentation").length,
    },
    {
      id: "videos",
      name: "Videos",
      icon: Video,
      count: resources.filter((r) => r.category === "videos").length,
    },
    {
      id: "templates",
      name: "Templates",
      icon: FileText,
      count: resources.filter((r) => r.category === "templates").length,
    },
    {
      id: "tools",
      name: "Herramientas",
      icon: Package,
      count: resources.filter((r) => r.category === "tools").length,
    },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      resource.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const featuredResources = resources.filter((r) => r.featured);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const getResourceIcon = (type: string, category: string) => {
    switch (type) {
      case "download":
        return Download;
      case "external":
        return ExternalLink;
      case "video":
        return Play;
      case "github":
        return Github;
      default:
        switch (category) {
          case "notebooks":
            return FileCode;
          case "datasets":
            return Database;
          case "documentation":
            return BookOpen;
          case "videos":
            return Video;
          case "templates":
            return FileText;
          case "tools":
            return Package;
          default:
            return FileText;
        }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-white/10 text-white/70 border-white/20";
    }
  };

  const handleResourceRedirect = async (resource: Resource) => {
    await trackClick(resource.id);
    if (resource.url && resource.url !== "#") {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      return;
    }

    switch (resource.category) {
      case "notebooks":
        window.open("https://jupyter.org/", "_blank", "noopener,noreferrer");
        break;
      case "datasets":
        window.open(
          "https://www.kaggle.com/datasets",
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "documentation":
        window.open(
          "https://pandas.pydata.org/docs/",
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "videos":
        window.open(
          "https://www.youtube.com/results?search_query=jupyter+data+science+tutorial",
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "templates":
        window.open(
          "https://github.com/jupyter/jupyter/wiki/A-gallery-of-interesting-Jupyter-Notebooks",
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "tools":
        window.open(
          "https://jupyter.org/install",
          "_blank",
          "noopener,noreferrer"
        );
        break;
      default:
        // Fallback a la página oficial de Jupyter
        window.open("https://jupyter.org/", "_blank", "noopener,noreferrer");
    }
  };

  const handleStarClick = async (
    resourceId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      alert(
        "🔒 Debes iniciar sesión para dar estrellas a los recursos.\n\nLas estrellas te ayudan a guardar tus recursos favoritos."
      );
      return;
    }

    await toggleStar(resourceId);
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white overflow-hidden">
      <Navbar />

      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        {/* Jupyter logo circles */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.03]">
          <motion.svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 30,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <path
              d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5z"
              fill="none"
              stroke="#FF5722"
              strokeWidth="8"
            />
            <path
              d="M50 95c24.9 0 45-20.1 45-45S74.9 5 50 5 5 25.1 5 50s20.1 45 45 45z"
              fill="none"
              stroke="#FF5722"
              strokeWidth="8"
              strokeDasharray="70.7 141.4"
            />
          </motion.svg>
        </div>

        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.02]">
          <motion.svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <path
              d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5z"
              fill="none"
              stroke="#FF5722"
              strokeWidth="8"
            />
            <path
              d="M50 95c24.9 0 45-20.1 45-45S74.9 5 50 5 5 25.1 5 50s20.1 45 45 45z"
              fill="none"
              stroke="#FF5722"
              strokeWidth="8"
              strokeDasharray="70.7 141.4"
            />
          </motion.svg>
        </div>

        {/* Floating decorative dots */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#FF5722]/10"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
            }}
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1200),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 800),
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full min-h-screen bg-gradient-to-b from-transparent to-black/20">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="text-white text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                📚 Centro de Recursos
              </span>
            </div>
            <h1 className="font-bold text-white text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Todo lo que Necesitas para{" "}
              <span className="text-[#FF5722]">Dominar Jupyter</span>
            </h1>
            <p className="text-white/80 text-xl leading-relaxed max-w-4xl mx-auto">
              Descarga notebooks, datasets, templates y accede a herramientas
              que te ayudarán a convertirte en un experto en ciencia de datos
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-12 border border-white/10"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar notebooks, datasets, herramientas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent backdrop-blur-sm"
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-white/50" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white px-6 py-4 rounded-xl font-medium transition-all flex items-center space-x-2"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Categoría
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent backdrop-blur-sm"
                    >
                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                          className="bg-[#2A2A2A] text-white"
                        >
                          {category.name} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Dificultad
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent backdrop-blur-sm"
                    >
                      <option value="all" className="bg-[#2A2A2A] text-white">
                        Todas las dificultades
                      </option>
                      <option
                        value="beginner"
                        className="bg-[#2A2A2A] text-white"
                      >
                        Principiante
                      </option>
                      <option
                        value="intermediate"
                        className="bg-[#2A2A2A] text-white"
                      >
                        Intermedio
                      </option>
                      <option
                        value="advanced"
                        className="bg-[#2A2A2A] text-white"
                      >
                        Avanzado
                      </option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Featured Resources */}
          {featuredResources.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF5722] to-[#FF9800] rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Recursos Destacados
                  </h2>
                  <p className="text-white/60">
                    Los más populares de nuestra comunidad
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredResources.map((resource, index) => {
                  const IconComponent = getResourceIcon(
                    resource.type,
                    resource.category
                  );
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FF5722]/50 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#FF5722] to-[#FF9800] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <button
                          onClick={(e) => handleStarClick(resource.id, e)}
                          disabled={!isAuthenticated && loading} // Deshabilitar si no está autenticado
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors ${
                            isAuthenticated
                              ? "bg-white/10 hover:bg-white/20 cursor-pointer"
                              : "bg-white/5 cursor-not-allowed opacity-60"
                          }`}
                          title={
                            isAuthenticated
                              ? hasStarred(resource.id)
                                ? "Quitar de favoritos"
                                : "Agregar a favoritos"
                              : "Inicia sesión para agregar a favoritos"
                          }
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              hasStarred(resource.id)
                                ? "text-yellow-400 fill-current"
                                : "text-white/60 hover:text-yellow-400"
                            }`}
                          />
                          <span className="text-sm font-medium text-white">
                            {getResourceStars(resource.id)}
                          </span>
                        </button>
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#FF5722] transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(resource.difficulty)}`}
                        >
                          {resource.difficulty}
                        </span>
                        <div className="flex items-center space-x-3 text-xs text-white/50">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {getResourceViews(resource.id)} views
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Popular
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleResourceRedirect(resource)}
                        className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 group-hover:shadow-lg group-hover:shadow-[#FF5722]/25"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Acceder al Recurso</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Categories */}
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={containerVariants}
            className="mb-12"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Explora por Categorías
              </h2>
              <p className="text-white/70 text-lg">
                Encuentra exactamente lo que necesitas
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
            >
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-6 rounded-2xl text-center transition-all duration-300 border ${
                      selectedCategory === category.id
                        ? "bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/25 border-[#FF5722]"
                        : "bg-white/5 text-white/80 hover:bg-white/10 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <IconComponent className="w-8 h-8 mx-auto mb-3" />
                    <p className="font-medium mb-1">{category.name}</p>
                    <p className="text-xs opacity-70">
                      {category.count} recursos
                    </p>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>

          {/* All Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Todos los Recursos
                </h2>
                <p className="text-white/60">
                  {filteredResources.length} recursos encontrados
                  {searchQuery && ` para "${searchQuery}"`}
                </p>
              </div>
            </div>

            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => {
                  const IconComponent = getResourceIcon(
                    resource.type,
                    resource.category
                  );
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {getResourceViews(resource.id)} views
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleStarClick(resource.id, e)}
                            disabled={!isAuthenticated}
                            className={`flex items-center space-x-1 text-xs transition-colors ${
                              isAuthenticated
                                ? "hover:text-white/80 cursor-pointer"
                                : "cursor-not-allowed opacity-50"
                            }`}
                            title={
                              isAuthenticated
                                ? hasStarred(resource.id)
                                  ? "Quitar de favoritos"
                                  : "Agregar a favoritos"
                                : "Inicia sesión para dar estrellas"
                            }
                          >
                            <Star
                              className={`w-3 h-3 transition-colors ${
                                hasStarred(resource.id)
                                  ? "text-yellow-400 fill-current"
                                  : isAuthenticated
                                    ? "text-white/60 hover:text-yellow-400"
                                    : "text-white/30"
                              }`}
                            />
                            <span>{getResourceStars(resource.id)}</span>
                          </button>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(resource.difficulty)}`}
                          >
                            {resource.difficulty}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#FF5722] transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {resource.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full">
                            +{resource.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {getResourceViews(resource.id)} views
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(resource.difficulty)}`}
                        >
                          {resource.difficulty}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResourceRedirect(resource)}
                          className="flex-1 bg-white/10 hover:bg-[#FF5722] text-white px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center space-x-2 group-hover:shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Acceder</span>
                        </button>{" "}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-white/30" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  No se encontraron recursos
                </h3>
                <p className="text-white/60 mb-6">
                  Intenta ajustar tus filtros de búsqueda
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                  }}
                  className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Limpiar Filtros
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">
                Estadísticas de la Comunidad
              </h2>
              <p className="text-white/60">
                El impacto de nuestros recursos educativos
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF5722] mb-2">
                  {resources.length}
                </div>
                <div className="text-white/70">Recursos Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF5722] mb-2">
                  {loading ? "..." : globalStats.totalViews.toLocaleString()}
                </div>
                <div className="text-white/70">Visualizaciones Totales</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF5722] mb-2">
                  {loading ? "..." : globalStats.totalViews.toLocaleString()}
                </div>
                <div className="text-white/70">Calificación Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF5722] mb-2">
                  {new Set(resources.flatMap((r) => r.tags)).size}
                </div>
                <div className="text-white/70">Temas Cubiertos</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
