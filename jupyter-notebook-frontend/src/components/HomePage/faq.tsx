import React, { useState } from "react";
import ScrollAnimation from "../scrollAnimation";

const Faq: React.FC = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const toggleButton = (id: string) => {
    setActiveButton((prev) => (prev === id ? null : id));
  };
  return (
    <ScrollAnimation>
      <section className="py-16 bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A]">
        <div>
          <h2 className="text-white text-center font-bold text-3xl">
            Preguntas Frecuentes
          </h2>
          <div className="max-w-3xl mx-auto mt-12 space-y-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
              <button
                className="w-full p-4 text-left flex justify-between items-center text-white hover:bg-white/10 transition-colors"
                onClick={() => toggleButton("button1")}
              >
                <span className="font-medium">
                  ¿Necesito experiencia previa en programación?
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`lucide lucide-chevron-down w-5 h-5 trnasition-transform focus:outline-none${
                    activeButton === "button1" ? "transform rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {activeButton === "button1" && (
                <div className="p-4 bg-white/5 text-white/80">
                  <p>
                    No es necesario tener experiencia previa en programación,
                    pero un conocimiento básico de Python puede ser útil. El
                    curso está diseñado para acomodar a principiantes y avanzar
                    gradualmente.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
              <button
                className="w-full p-4 text-left flex justify-between items-center text-white hover:bg-white/10 transition-colors"
                onClick={() => toggleButton("button2")}
              >
                <span className="font-medium">
                  ¿Cuánto tiempo tengo acceso al curso?
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`lucide lucide-chevron-down w-5 h-5 trnasition-transform focus:outline-none${
                    activeButton === "button2" ? "transform rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {activeButton === "button2" && (
                <div className="p-4 bg-white/5 text-white/80">
                  <p>
                    Una vez que te inscribas, tendrás acceso de por vida al
                    contenido del curso, incluyendo todas las actualizaciones
                    futuras.
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
              <button
                className="w-full p-4 text-left flex justify-between items-center text-white hover:bg-white/10 transition-colors"
                onClick={() => toggleButton("button3")}
              >
                <span className="font-medium">
                  ¿Obtengo un certificado al completar el curso?
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`lucide lucide-chevron-down w-5 h-5 trnasition-transform focus:outline-none${
                    activeButton === "button3" ? "transform rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {activeButton === "button3" && (
                <div className="p-4 bg-white/5 text-white/80">
                  <p>
                    Este curso es un proyecto escolar y no está validado por
                    ninguna institución ni por Jupyter.org. Por lo tanto, no se
                    otorga un certificado oficial. Sin embargo, al completarlo,
                    habrás adquirido conocimientos fundamentales sobre Jupyter
                    Notebook y su uso en análisis de datos, lo que puede ser un
                    gran valor para tu aprendizaje y desarrollo profesional. 😊
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
              <button
                className="w-full p-4 text-left flex justify-between items-center text-white hover:bg-white/10 transition-colors"
                onClick={() => toggleButton("button4")}
              >
                <span className="font-medium">
                  ¿Hay soporte disponible si tengo dudas?
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`lucide lucide-chevron-down w-5 h-5 trnasition-transform focus:outline-none${
                    activeButton === "button4" ? "transform rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {activeButton === "button4" && (
                <div className="p-4 bg-white/5 text-white/80">
                  <p>
                    Absolutamente. Tenemos un foro de la comunidad donde puedes
                    hacer preguntas, y nuestro equipo de instructores responde
                    regularmente. También ofrecemos sesiones de Q&A en vivo
                    mensualmente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
};

export default Faq;
