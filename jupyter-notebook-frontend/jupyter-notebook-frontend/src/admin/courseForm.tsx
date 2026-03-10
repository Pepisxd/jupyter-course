import React, { useState } from "react";
import { useAuth } from "../auth/auth-context";
import { useForm, useFieldArray } from "react-hook-form";
import {
  X,
  Plus,
  Upload,
  Clock,
  Link,
  FileText,
  ImageIcon,
} from "lucide-react";

// Tipos para el formulario
interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  videoUrl: string;
  thumbnail: string;
  description: string;
}

interface CourseFormData {
  title: string;
  description: string;
  image: string;
  lessons: Lesson[];
}

const CourseForm: React.FC = () => {
  const { user } = useAuth();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lessonPreviews, setLessonPreviews] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const uploadFileToS3 = async (file: File, type: "Image" | "Video") => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No se ha proporcionado un token de autenticación");
    }

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/upload${type}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        return data.url;
      } else {
        throw new Error(data.msg || "Error al subir el archivo");
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      throw error;
    }
  };

  if (!user || user.rol !== "admin") {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Acceso denegado
        </h1>
        <p className="text-gray-700">
          No tienes permiso para acceder a esta página.
        </p>
      </div>
    );
  }

  // Inicializar React Hook Form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CourseFormData>({
    defaultValues: {
      title: "",
      description: "",
      image: "",
      lessons: [
        {
          id: `1.${Date.now()}`,
          title: "",
          duration: "",
          completed: false,
          locked: false,
          videoUrl: "",
          thumbnail: "",
          description: "",
        },
      ],
    },
  });

  // Configurar el array de campos para las lecciones
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lessons",
  });

  // Manejar la subida de imágenes
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const type =
        fieldName === "image" || fieldName === "thumbnail" ? "Image" : "Video";
      const url = await uploadFileToS3(file, type); // Subir el archivo

      if (fieldName === "image") {
        setPreviewImage(url); // Actualizar la vista previa de la imagen del curso
      } else if (fieldName === "thumbnail" && index !== undefined) {
        setLessonPreviews((prev) => ({
          ...prev,
          [index]: url, // Actualizar la vista previa de la miniatura de la lección
        }));
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  // Manejar el envío del formulario
  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);

    try {
      if (previewImage) {
        data.image = previewImage;
      }

      for (let i = 0; i < data.lessons.length; i++) {
        const lesson = data.lessons[i];
        if (lessonPreviews[i]) {
          lesson.thumbnail = lessonPreviews[i];
        }
      }
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          reset();
          setPreviewImage(null);
          setLessonPreviews({});
        }, 3000);
      } else {
        throw new Error(result.msg || "Error al crear el curso");
      }
    } catch (error) {
      console.error("Error al crear el curso:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extraer URL de YouTube para mostrar miniatura
  const extractYouTubeID = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Generar miniatura automática de YouTube
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = extractYouTubeID(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  };

  // Observar los valores de videoUrl para actualizar miniaturas automáticamente
  const watchedLessons = watch("lessons");

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Crear Nuevo Curso
      </h1>

      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ¡Curso creado exitosamente!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Información general del curso */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Información del Curso
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title", { required: "El título es obligatorio" })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej: Introducción a Jupyter Notebook"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description", {
                  required: "La descripción es obligatoria",
                })}
                rows={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe brevemente el contenido del curso..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen del Curso <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      {...register("image", {
                        required: "La URL de la imagen es obligatoria",
                      })}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none ${
                        errors.image ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="URL de la imagen o sube un archivo"
                    />
                    <label className="absolute right-2 top-2 cursor-pointer bg-gray-200 hover:bg-gray-300 p-1 rounded-md">
                      <Upload className="w-5 h-5 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "image")}
                      />
                    </label>
                  </div>
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.image.message}
                    </p>
                  )}
                </div>

                {previewImage && (
                  <div className="w-20 h-20 relative">
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Vista previa"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de lecciones */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Lecciones del Curso
            </h2>
            <button
              type="button"
              onClick={() =>
                append({
                  id: `1.${Date.now()}`,
                  title: "",
                  duration: "",
                  completed: false,
                  locked: false,
                  videoUrl: "",
                  thumbnail: "",
                  description: "",
                })
              }
              className="flex items-center space-x-1 bg-[#FF5722] text-white px-3 py-2 rounded-lg hover:bg-[#FF5722]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Lección</span>
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => {
              const videoUrl = watchedLessons[index]?.videoUrl || "";
              const autoThumbnail = videoUrl
                ? getYouTubeThumbnail(videoUrl)
                : "";

              return (
                <div
                  key={field.id}
                  className="p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">
                      Lección {index + 1}
                    </h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título de la Lección{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          {...register(`lessons.${index}.title` as const, {
                            required: "El título es obligatorio",
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none"
                          placeholder="Ej: Introducción a los Notebooks"
                        />
                      </div>
                      {errors.lessons?.[index]?.title && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.lessons[index]?.title?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duración <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          {...register(`lessons.${index}.duration` as const, {
                            required: "La duración es obligatoria",
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none"
                          placeholder="Ej: 10:30"
                        />
                      </div>
                      {errors.lessons?.[index]?.duration && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.lessons[index]?.duration?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL del Video <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <Link className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          {...register(`lessons.${index}.videoUrl` as const, {
                            required: "La URL del video es obligatoria",
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none"
                          placeholder="Ej: https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      {errors.lessons?.[index]?.videoUrl && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.lessons[index]?.videoUrl?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Miniatura
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="relative">
                            <input
                              type="text"
                              {...register(
                                `lessons.${index}.thumbnail` as const
                              )}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none"
                              placeholder="URL de la miniatura o sube un archivo"
                              defaultValue={autoThumbnail}
                            />
                            <label className="absolute right-2 top-2 cursor-pointer bg-gray-200 hover:bg-gray-300 p-1 rounded-md">
                              <ImageIcon className="w-4 h-4 text-gray-600" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(e, "thumbnail", index)
                                }
                              />
                            </label>
                          </div>
                        </div>

                        {(lessonPreviews[index] || autoThumbnail) && (
                          <div className="w-20 h-12 relative">
                            <img
                              src={lessonPreviews[index] || autoThumbnail}
                              alt="Vista previa"
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register(`lessons.${index}.description` as const, {
                          required: "La descripción es obligatoria",
                        })}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none"
                        placeholder="Describe brevemente esta lección..."
                      />
                      {errors.lessons?.[index]?.description && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.lessons[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`completed-${index}`}
                          {...register(`lessons.${index}.completed` as const)}
                          className="w-4 h-4 text-[#FF5722] focus:ring-[#FF5722] border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`completed-${index}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          Completada
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`locked-${index}`}
                          {...register(`lessons.${index}.locked` as const)}
                          className="w-4 h-4 text-[#FF5722] focus:ring-[#FF5722] border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`locked-${index}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          Bloqueada
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              reset();
              setPreviewImage(null);
              setLessonPreviews({});
              window.location.href = "/"; // Cambia "/ruta-deseada" por la ruta a la que deseas redirigir
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
              "Guardar Curso"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
