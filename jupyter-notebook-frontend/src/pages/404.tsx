import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Círculos del logo de Jupyter (decorativo) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.07]">
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
      </div>

      {/* Puntos decorativos flotantes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#FF5722]/10"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Contenido principal */}
      <div className="relative z-10 max-w-md w-full mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Código de error */}
          <motion.div
            className="text-[#FF5722] text-9xl font-bold mb-2"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 1, 0, -1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            404
          </motion.div>

          {/* Icono de alerta */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <AlertTriangle size={64} className="text-[#FF5722]" />
            </motion.div>
          </div>

          {/* Mensaje de error */}
          <h1 className="text-white text-3xl font-bold mb-4">
            Notebook no encontrado
          </h1>
          <p className="text-white/80 text-lg mb-8">
            La página que estás buscando no existe o ha sido movida a otra
            ubicación.
          </p>

          {/* Botón para volver al inicio */}
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Home size={20} />
            Volver al inicio
          </a>
        </motion.div>
      </div>

      {/* Código de célula de Jupyter (decorativo) */}
      <div className="absolute bottom-8 left-8 right-8 max-w-lg mx-auto opacity-20 text-white font-mono text-sm bg-black/30 p-4 rounded-md">
        <div className="text-gray-400"># Funcion para encontrar la pagina</div>
        <div className="text-blue-400">def</div>{" "}
        <div className="text-green-400">encontrar_pagina</div>
        <div className="text-white">(ruta):</div>
        <div className="ml-4 text-white">
          if ruta =={" "}
          <span className="text-yellow-400">&quot;/esta-pagina&quot;</span>:
        </div>
        <div className="ml-8 text-white">
          return{" "}
          <span className="text-yellow-400">
            &quot;Página no encontrada&quot;
          </span>
        </div>
        <div className="ml-4 text-white">else:</div>
        <div className="ml-8 text-white">
          return{" "}
          <span className="text-yellow-400">
            &quot;Redirigiendo al inicio...&quot;
          </span>
        </div>
      </div>
    </div>
  );
}
