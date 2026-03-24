import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API_URL from "../lib/api";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado.");
      return;
    }

    fetch(`${API_URL}/api/auth/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Cuenta verificada exitosamente") {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Error al verificar la cuenta.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión. Intenta de nuevo.");
      });
  }, [searchParams]);

  return (
    <div
      style={{ background: "#1E1E1E", minHeight: "100vh" }}
      className="flex items-center justify-center px-4"
    >
      <div
        style={{ background: "#242424", border: "1px solid #333" }}
        className="rounded-xl p-10 max-w-md w-full text-center"
      >
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-300">Verificando tu cuenta...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(255,87,34,0.15)" }}
            >
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta verificada!</h2>
            <p className="text-gray-400 mb-8">{message}</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white"
              style={{ background: "#FF5722" }}
            >
              Ir al inicio
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Error de verificación</h2>
            <p className="text-gray-400 mb-8">{message}</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white"
              style={{ background: "#FF5722" }}
            >
              Ir al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
