import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Video, Clock, FileText, Save } from "lucide-react";
import type { Chapter } from "./contentManager";
import { useNavigate } from "react-router-dom";
import FileUploader from "./fileUploader";
import ImageUploader from "./imageUploader";

interface SubchapterFormProps {
  chapters: Chapter[];
}

interface SubchapterFormData {
  chapterId: string;
  title: string;
  duration: string;
  description: string;
  videoFile?: File;
  thumbnailFile?: File;
}

// Función de validación de ID simple
const isValidMongoId = (id: string) => {
  return (
    typeof id === "string" && id.length === 24 && /^[0-9a-fA-F]+$/.test(id)
  );
};

const SubchapterForm: React.FC<SubchapterFormProps> = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isChapterLoaded, setIsChapterLoaded] = useState(false);

  const [loadedChapters, setLoadedChapters] = useState<Chapter[]>([]);

  const handleVideoChange = (file: File | null, duration?: string) => {
    setVideoFile(file);
    if (duration) {
      setValue("duration", duration);
    }
  };

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/chapters");
        if (!response.ok) {
          throw new Error("Error al obtener los capítulos");
        }
        const data = await response.json();
        setLoadedChapters(data);
      } catch (error) {
        console.error("Error al obtener los capítulos:", error);
      }
    };

    fetchChapters();
  }, []);

  useEffect(() => {
    if (loadedChapters.length > 0) {
      setIsChapterLoaded(true);
    } else {
      setIsChapterLoaded(false);
    }
  }, [loadedChapters]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubchapterFormData>({
    defaultValues: {
      chapterId: loadedChapters.length > 0 ? loadedChapters[0]?.id || "" : "",
      title: "",
      duration: "",
      description: "",
    },
  });

  // ... existing code ...
  const onSubmit = async (data: SubchapterFormData) => {
    console.log("onSubmit se esta ejecutando...");
    setIsSubmitting(true);
    setUploadProgress(0);
    setApiError(null);

    if (!isValidMongoId(data.chapterId)) {
      setApiError("El capítulo seleccionado no es válido");
      setIsSubmitting(false);
      return;
    }

    if (!videoFile) {
      setApiError("No se ha seleccionado un archivo de video");
      setIsSubmitting(false);
      return;
    }

    if (!thumbnailFile) {
      setApiError("No se ha seleccionado una miniatura");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("chapterId", data.chapterId);
      formData.append("title", data.title);
      formData.append("duration", data.duration || "0:00");
      formData.append("description", data.description);
      formData.append("video", videoFile);
      formData.append("thumbnail", thumbnailFile);

      // Obtener el token de autenticación del localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Inspecciona los datos antes de enviarlos
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch("http://localhost:3000/api/lessons", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // No especificamos Content-Type, el navegador lo establecerá automáticamente con el boundary correcto
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error de respuesta:", errorText);
        throw new Error(errorText || "Error en la subida");
      }

      const result = await response.json();
      console.log("Subido a S3", result);
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
        reset();
        setVideoFile(null);
        setThumbnailFile(null);
        setUploadProgress(0);
      }, 3000);
    } catch (error) {
      console.error("Error al crear la lección:", error);
      setApiError((error as any).message || "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center mb-6">
        <Video className="w-6 h-6 text-[#FF5722] mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">
          Nuevo Subcapítulo
        </h2>
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
          ¡Subcapítulo creado exitosamente!
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
            Capítulo al que pertenece <span className="text-red-500">*</span>
          </label>
          <select
            {...register("chapterId", {
              required: "Debes seleccionar un capítulo",
            })}
            onChange={(e) => {
              const selectedChapterId = e.target.value;
              if (!isValidMongoId(selectedChapterId)) {
                setApiError("El capítulo seleccionado no es válido");
              } else {
                setApiError(null);
              }
            }}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none ${
              errors.chapterId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="" disabled>
              Seleccione un capítulo
            </option>
            {loadedChapters.map((chapter) => (
              <option
                key={chapter._id || chapter.id}
                value={chapter._id || chapter.id}
              >
                {chapter.title}
              </option>
            ))}
          </select>
          {errors.chapterId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.chapterId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del Subcapítulo <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
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
              placeholder="Ej: Instalación de Jupyter Notebook"
            />
          </div>
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                {...register("duration", {
                  required: "La duración es obligatoria",
                })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none ${
                  errors.duration ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Se calculará automáticamente"
                readOnly
              />
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">
                {errors.duration.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video <span className="text-red-500">*</span>
            </label>
            <FileUploader onFileChange={handleVideoChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Miniatura <span className="text-red-500">*</span>
          </label>
          <ImageUploader onImageChange={(file) => setThumbnailFile(file)} />
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
            placeholder="Describe brevemente el contenido de este subcapítulo..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {isSubmitting && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#FF5722] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p className="text-sm text-gray-600 mt-1 text-right">
              {uploadProgress}% completado
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              navigate("/");
              reset();
              setVideoFile(null);
              setThumbnailFile(null);
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !isChapterLoaded}
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
                Subiendo...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Subcapítulo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubchapterForm;
