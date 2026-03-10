import { type ChangeEvent, useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
}

export default function ImageUploader({ onImageChange }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onImageChange(selectedFile); // Notificar al padre sobre la imagen seleccionada
      setStatus("idle"); // Reiniciar el estado de subida
    }
  }

  function handleCancel() {
    setFile(null);
    onImageChange(null); // Notificar al padre que no hay imagen
    setStatus("idle");
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-[#FF5722] file:text-white
          hover:file:bg-[#FF5722]/90 cursor-pointer
          focus:outline-none"
      />
      {file && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-sm font-medium">Nombre del archivo: {file.name}</p>
          <p className="text-sm text-gray-500">
            Tamaño del archivo: {(file.size / 1024).toFixed(2)} KB
          </p>
          <p className="text-sm text-gray-500">Tipo: {file.type}</p>
          <div className="mt-3 border rounded-lg overflow-hidden bg-gray-100">
            <img
              src={URL.createObjectURL(file) || "/placeholder.svg"}
              alt="Vista previa"
              className="max-w-full h-auto object-contain max-h-[200px] mx-auto"
            />
          </div>
          <button
            onClick={handleCancel}
            className="mt-3 px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
