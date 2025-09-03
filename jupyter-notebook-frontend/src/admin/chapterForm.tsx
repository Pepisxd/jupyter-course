import type React from "react";
import { useState } from "react";
import { set, useForm } from "react-hook-form";
import { Book, Save } from "lucide-react";
import type { Chapter } from "./contentManager";
import { useNavigate } from "react-router-dom";

interface ChapterFormProps {
  onChapterCreated: (chapter: Chapter) => void;
}

interface ChapterFormData {
  title: string;
  description: string;
}

const ChapterForm: React.FC<ChapterFormProps> = ({ onChapterCreated }) => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChapterFormData>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: ChapterFormData) => {
    setIsSubmitting(true);
    setApiError(null); // Limpiar errores anteriores

    try {
      const response = await fetch("http://localhost:3000/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Leer el cuerpo de la respuesta una sola vez
      const result = await response.json();

      if (!response.ok) {
        // Si la respuesta no es exitosa, lanzar un error con el mensaje del backend
        throw new Error(result.msg || "Error al crear el capítulo");
      }

      // Si la respuesta es exitosa, usar los datos
      const newChapter = result;

      onChapterCreated(newChapter);
      setSubmitSuccess(true);

      // Resetear el formulario después de un tiempo
      setTimeout(() => {
        setSubmitSuccess(false);
        reset();
      }, 3000);
    } catch (error) {
      console.error("Error al crear el capítulo:", error);
      if (error instanceof Error) {
        setApiError(error.message); // Mostrar el mensaje de error en la UI
      } else {
        setApiError("Error desconocido"); // Manejar el caso de error desconocido
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center mb-6">
        <Book className="w-6 h-6 text-[#FF5722] mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Nuevo Capítulo</h2>
      </div>

      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          ¡Capítulo creado exitosamente!
        </div>
      )}
      {apiError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del Capítulo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("title", {
              required: "El título es obligatorio",
              minLength: {
                value: 5,
                message: "El título debe tener al menos 5 caracteres",
              },
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: Introducción a Jupyter Notebook"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description", {
              required: "La descripción es obligatoria",
              minLength: {
                value: 10,
                message: "La descripción debe tener al menos 10 caracteres",
              },
            })}
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Describe brevemente el contenido de este capítulo..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#FF5722] text-white rounded-lg hover:bg-[#FF5722]/90 transition-colors disabled:opacity-70 flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Capítulo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChapterForm;
