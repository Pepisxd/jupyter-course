import { type ChangeEvent, useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface FileUploaderProps {
  onFileChange: (file: File | null, duration?: string) => void;
  accept?: string;
  label?: string;
}

export default function FileUploader({
  onFileChange,
  accept,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [, setStatus] = useState<UploadStatus>("idle");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const selectedFile = e.target.files[0];

      if (!selectedFile.type.startsWith("video/")) {
        alert("Por favor, selecciona un archivo de video.");
        return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;

        setFile(selectedFile);
        onFileChange(selectedFile, formattedDuration);
        setStatus("idle");
      };

      video.src = URL.createObjectURL(selectedFile);
    }
  }

  function handleCancel() {
    setFile(null);
    onFileChange(null); // Notificar al padre que no hay archivo
    setStatus("idle");
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        onChange={handleFileChange}
        accept={accept}
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
          {file.type.startsWith("image/") && (
            <img
              src={URL.createObjectURL(file) || "/placeholder.svg"}
              alt="Vista previa"
              className="mt-3 max-w-full h-auto rounded-lg border object-contain max-h-[200px]"
            />
          )}
          {file.type.startsWith("video/") && (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="mt-3 max-w-full h-auto rounded-lg border object-contain max-h-[200px]"
            />
          )}
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
