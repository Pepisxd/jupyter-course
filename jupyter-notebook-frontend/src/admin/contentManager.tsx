import React, { useState, useEffect } from "react";
import ChapterForm from "./chapterForm";
import SubchapterForm from "./subchapterForm";
import { Book, Video } from "lucide-react";

// Tipo para representar un capítulo

export interface Chapter {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  lessons?: string[];
}

const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"chapter" | "subchapter">(
    "chapter"
  );
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar capítulos existentes al iniciar
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        // En un caso real, esto sería una llamada a tu API
        // const response = await fetch('/api/chapters');
        // const data = await response.json();

        // Simulamos datos para demostración
        const mockChapters = [
          {
            id: "1",
            title: "Introducción a Jupyter Notebook",
            description: "Fundamentos y conceptos básicos",
          },
          {
            id: "2",
            title: "Trabajando con datos",
            description: "Manipulación y análisis de datos",
          },
          {
            id: "3",
            title: "Visualización avanzada",
            description: "Gráficos y visualizaciones interactivas",
          },
        ];

        setChapters(mockChapters);
      } catch (error) {
        console.error("Error al cargar los capítulos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapters();
  }, []);

  // Manejar la creación exitosa de un capítulo
  const handleChapterCreated = (newChapter: Chapter) => {
    setChapters((prev) => [...prev, newChapter]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Gestión de Contenido
      </h1>

      {/* Pestañas simplificadas */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium flex items-center gap-2 ${
              activeTab === "chapter"
                ? "text-[#FF5722] border-b-2 border-[#FF5722]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("chapter")}
          >
            <Book className="w-5 h-5" />
            <span>Crear Capítulo</span>
          </button>
          <button
            className={`py-2 px-4 font-medium flex items-center gap-2 ${
              activeTab === "subchapter"
                ? "text-[#FF5722] border-b-2 border-[#FF5722]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("subchapter")}
          >
            <Video className="w-5 h-5" />
            <span>Crear Subcapítulo</span>
          </button>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="mt-4">
        {activeTab === "chapter" && (
          <ChapterForm onChapterCreated={handleChapterCreated} />
        )}

        {activeTab === "subchapter" &&
          (isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5722]"></div>
            </div>
          ) : chapters.length > 0 ? (
            <SubchapterForm chapters={chapters} />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay capítulos disponibles
              </h3>
              <p className="text-gray-600">
                Debes crear al menos un capítulo antes de poder añadir
                subcapítulos.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ContentManager;
