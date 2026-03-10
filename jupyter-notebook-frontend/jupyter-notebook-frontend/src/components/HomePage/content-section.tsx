import type React from "react";
import { motion } from "framer-motion";

interface ContentSectionProps {
  children: React.ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({ children }) => {
  return (
    <section className="relative min-h-screen w-full bg-[#1E1E1E] overflow-hidden">
      {/* Círculos del logo de Jupyter */}
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

        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.05]">
          <motion.svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 25,
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

      {/* Contenedor principal con gradiente sutil */}
      <div className="relative z-10 w-full min-h-screen bg-gradient-to-b from-transparent to-black/30">
        <div className="container mx-auto px-4 py-16">
          {/* Aquí va el contenido que se pase como children */}
          <div className="relative z-20 text-white">{children}</div>
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
