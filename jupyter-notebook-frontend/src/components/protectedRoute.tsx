import type React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/auth-context";
import { useAuthModal } from "../auth/auth-modal-context";
import { Loader2, Lock, ArrowLeft, LogIn, UserPlus } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { openModal } = useAuthModal();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          {/* Círculo animado de Jupyter */}
          <div className="relative w-24 h-24 mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[#FF5722]/30"
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-t-4 border-[#FF5722]"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-[#FF5722]" />
          </div>
          <motion.p
            className="text-xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Cargando tu espacio de trabajo...
          </motion.p>
          <motion.p
            className="text-white/60 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Preparando tu entorno de Jupyter
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#FF5722]/10"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Círculo del logo de Jupyter (decorativo) */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.05] z-0">
          <motion.svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            animate={{ rotate: 360 }}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#2A2A2A] to-[#333333] p-8 rounded-xl max-w-md w-full text-center shadow-xl relative z-10 border border-white/5"
        >
          <div className="w-16 h-16 bg-[#FF5722]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#FF5722]" />
          </div>

          <h2 className="text-3xl font-bold mb-2">Acceso Restringido</h2>
          <p className="text-white/70 mb-8">
            Para acceder a esta sección, necesitas iniciar sesión en tu cuenta
            de Jupyter.
          </p>

          <div className="space-y-4">
            <motion.button
              onClick={() => openModal("login")}
              className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </motion.button>

            <motion.button
              onClick={() => openModal("register")}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Registrarse
            </motion.button>

            <motion.a
              href="/"
              className="inline-flex items-center text-white/70 hover:text-white mt-4 transition-colors"
              whileHover={{ x: -3 }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la página principal
            </motion.a>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/50 text-sm">
              ¿Necesitas ayuda? Contacta con nuestro equipo de soporte
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
