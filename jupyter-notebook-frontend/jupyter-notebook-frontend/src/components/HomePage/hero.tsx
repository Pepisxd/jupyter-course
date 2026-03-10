import type React from "react";
import { useEffect, useState } from "react";
import ScrollAnimation from "../scrollAnimation";

const Hero: React.FC = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Simular tiempo de carga para la transición
    const timer = setTimeout(() => {
      setIsVideoLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollAnimation>
      <section className="flex flex-col lg:flex-row min-h-[600px] w-full bg-[#FF5722]">
        {/* Columna de contenido */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16">
          <div className="flex flex-col space-y-6 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                👋 Bienvenid@ al curso
              </span>
            </div>

            <h1 className="font-bold text-white text-3xl md:text-4xl lg:text-5xl leading-tight">
              Domina Jupyter Notebook y Lleva tu Análisis de Datos al Siguiente
              Nivel 🚀
            </h1>

            <p className="text-white/90 text-lg leading-relaxed">
              Convierte tus ideas en poderosos cuadernos interactivos, visualiza
              datos como un experto y descubre el verdadero potencial de Python
              en ciencia de datos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
              <button className="bg-[#333333] hover:bg-[#222222] text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                ¡Empieza gratis ahora!
              </button>

              <a
                href="/documentacion"
                className="inline-flex items-center justify-center text-white hover:text-white/80 font-medium transition-all py-3"
              >
                <span className="border-b-2 border-white/70 hover:border-white">
                  Mira la documentación
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Columna de media */}
        <div className="flex-1 relative overflow-hidden bg-[#1E1E1E]">
          {/* Video con fade-in */}
          <div
            className={`relative w-full h-full transition-opacity duration-1000 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <video
              src="./src/assets/hero-video.mp4"
              className="w-full h-full object-cover"
              muted
              playsInline
              autoPlay
              loop
              onCanPlay={() => setIsVideoLoaded(true)}
            />
          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
};

export default Hero;
