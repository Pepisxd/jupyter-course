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
} from "lucide-react";
import { motion } from "framer-motion";
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

const CourseContent: React.FC = () => {
  // Estados
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Cargar datos de capítulos
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token encontrado:", token ? "Sí" : "No");

    if (!token) {
      setError("Debes iniciar sesión para ver el contenido");
      setLoading(false);
      return;
    }

    console.log("Haciendo petición a la API...");
    axios
      .get("http://localhost:3000/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Respuesta de la API:", res.data);
        const chaptersData = res.data;

        if (Array.isArray(chaptersData)) {
          console.log("Número de capítulos recibidos:", chaptersData.length);
          chaptersData.forEach((chapter, index) => {
            console.log(`Capítulo ${index + 1}:`, {
              id: chapter.id,
              title: chapter.title,
              lessonsCount: chapter.lessons?.length || 0,
            });
          });
        } else {
          console.log("Los datos no son un array:", typeof chaptersData);
        }

        setChapters(chaptersData);

        if (chaptersData.length > 0) {
          console.log("Estableciendo capítulo activo:", chaptersData[0].title);
          setActiveChapter(chaptersData[0]);
          if (chaptersData[0].lessons && chaptersData[0].lessons.length > 0) {
            console.log(
              "Estableciendo lección activa:",
              chaptersData[0].lessons[0].title
            );
            setActiveLesson(chaptersData[0].lessons[0]);
          }
        } else {
          console.log(
            "No se encontraron capítulos para establecer como activos"
          );
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error completo al obtener capítulos:", err);
        console.error("Detalles del error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(
          "No se pudo cargar el contenido. Por favor, intenta de nuevo más tarde."
        );
        setLoading(false);
      });
  }, []);

  const filteredChapters = chapters.filter(
    (chapter) =>
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.lessons.some((lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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
          <div className="space-x-4 grid grid-cols-2 md:grid-cols-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-2 px-6 rounded-lg text-sm font-medium"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => window.location.replace("/")}
              className="bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-2 px-6 rounded-lg text-sm font-medium"
            >
              Volver a la página de inicio
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
          <h2 className="text-2xl font-bold mb-2">
            No hay contenido disponible
          </h2>
          <p className="text-white/80">
            Vuelve más tarde para ver nuevo contenido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#1E1E1E] text-white">
        <Navbar />
      </div>
      <div className="min-h-screen bg-[#1E1E1E] text-white">
        <header className="bg-[#FF5722] py-6">
          <div className="container-mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold">
                Contenido del Curso
              </h1>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-white rounded-full py-2 px-4 pl-10 text-[#6a6a6a] placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/70" />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar con capítulos y lecciones */}
            <div className="lg:col-span-1">
              <div className="bg-[#2A2A2A] rounded-xl overflow-hidden sticky top-8">
                <div className="p-4 bg-[#333333]">
                  <h2 className="text-xl font-semibold">Contenido del curso</h2>
                  <p className="text-white/70 text-sm mt-1">
                    {chapters.length}{" "}
                    {chapters.length === 1 ? "capítulo" : "capítulos"}{" "}
                    disponibles
                  </p>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  {filteredChapters.length > 0 ? (
                    filteredChapters.map((chapter) => (
                      <div key={chapter.id} className="mb-6">
                        <button
                          onClick={() => {
                            setActiveChapter(chapter);
                            if (chapter.lessons && chapter.lessons.length > 0) {
                              setActiveLesson(chapter.lessons[0]);
                            }
                          }}
                          className={`flex justify-between items-center w-full text-left mb-2 ${
                            activeChapter?.id === chapter.id
                              ? "text-[#FF5722]"
                              : "text-white"
                          }`}
                        >
                          <h3 className="font-medium">{chapter.title}</h3>
                          <ChevronRight
                            className={`w-4 h-4 transform transition-transform ${
                              activeChapter?.id === chapter.id
                                ? "rotate-90"
                                : ""
                            }`}
                          />
                        </button>

                        {(activeChapter?.id === chapter.id || searchQuery) && (
                          <div className="ml-2 border-l-2 border-[#444444] pl-4 space-y-3">
                            {chapter.lessons
                              .filter((lesson) =>
                                searchQuery
                                  ? lesson.title
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                  : true
                              )
                              .map((lesson) => (
                                <motion.button
                                  key={lesson.id}
                                  onClick={() => setActiveLesson(lesson)}
                                  className={`flex items-center gap-3 w-full text-left text-sm py-1 ${
                                    activeLesson?.id === lesson.id
                                      ? "text-[#FF5722]"
                                      : lesson.locked
                                      ? "text-white/50"
                                      : "text-white/80"
                                  }`}
                                  whileHover={{ x: 4 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 10,
                                  }}
                                >
                                  {lesson.completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  ) : lesson.locked ? (
                                    <Lock className="w-4 h-4 flex-shrink-0" />
                                  ) : (
                                    <Play className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  <span className="flex-1">{lesson.title}</span>
                                  <span className="text-xs text-white/50">
                                    {lesson.duration}
                                  </span>
                                </motion.button>
                              ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-white/70">
                      No se encontraron resultados
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido principal con video y descripción */}
            {activeLesson && activeChapter && (
              <div className="lg:col-span-2 space-y-6">
                {/* Video Player */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  key={activeLesson.id}
                  className="bg-[#2A2A2A] rounded-xl overflow-hidden"
                >
                  {activeLesson.locked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                      <Lock className="w-16 h-16 text-white" />
                      <p className="text-white/70 mt-2">
                        Esta lección está bloqueada
                      </p>
                      <Link
                        to="/inscripcion"
                        className="mt-4 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-2 px-6 rounded-full text-sm font-medium"
                      >
                        Desbloquear Ahora
                      </Link>
                    </div>
                  ) : (
                    <JupyterVideoPlayer
                      src={activeLesson.videoUrl}
                      thumbnail={activeLesson.thumbnail}
                      title={activeLesson.title}
                    />
                  )}
                </motion.div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {activeLesson.title}
                      </h2>
                      <p className="text-white/70 mt-1">
                        Capítulo: {activeChapter.title} •{" "}
                        {activeLesson.duration}
                      </p>
                    </div>
                    {activeLesson.completed && (
                      <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-medium">
                        Completado
                      </div>
                    )}
                  </div>

                  <p className="text-white/80 leading-relaxed">
                    {activeLesson.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <button className="bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-lg text-sm font-medium">
                      Marcar como completada
                    </button>
                  </div>
                </div>

                {/* Navegación entre lecciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lógica para encontrar la lección anterior */}
                  {(() => {
                    const currentLessonIndex = activeChapter.lessons.findIndex(
                      (lesson) => lesson.id === activeLesson.id
                    );
                    if (currentLessonIndex > 0) {
                      const prevLesson =
                        activeChapter.lessons[currentLessonIndex - 1];
                      return (
                        <button
                          onClick={() => setActiveLesson(prevLesson)}
                          className="bg-[#2A2A2A] hover:bg-[#333333] rounded-xl p-4 flex items-center gap-3 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <ChevronRight className="w-5 h-5 transform rotate-180" />
                          </div>
                          <div>
                            <p className="text-xs text-white/50">
                              Lección anterior
                            </p>
                            <p className="text-sm font-medium">
                              {prevLesson.title}
                            </p>
                          </div>
                        </button>
                      );
                    }
                    return <div></div>;
                  })()}

                  {/* Lógica para encontrar la siguiente lección */}
                  {(() => {
                    const currentLessonIndex = activeChapter.lessons.findIndex(
                      (lesson) => lesson.id === activeLesson.id
                    );
                    if (currentLessonIndex < activeChapter.lessons.length - 1) {
                      const nextLesson =
                        activeChapter.lessons[currentLessonIndex + 1];
                      return (
                        <button
                          onClick={() => setActiveLesson(nextLesson)}
                          className="bg-[#2A2A2A] hover:bg-[#333333] rounded-xl p-4 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div>
                            <p className="text-xs text-white/50 text-right">
                              Siguiente lección
                            </p>
                            <p className="text-sm font-medium">
                              {nextLesson.title}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </button>
                      );
                    }
                    return <div></div>;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseContent;
