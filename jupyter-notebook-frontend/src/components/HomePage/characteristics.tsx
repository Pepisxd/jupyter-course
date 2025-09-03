import React from "react";
import ScrollAnimation from "../scrollAnimation";

const characteristics: React.FC = () => {
  return (
    <ScrollAnimation>
      <section className=" py-16 bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A]">
        <div className="container mx-auto px-4">
          <h2 className="text-white text-3xl font-bold text-center mb-12">
            Características del Curso
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-3">
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
                className="lucide lucide-circle-check-big w-6 h-6 text-[#FF5722] flex-shrink-0 mt-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <p className="text-white">Acceso a lecciones interactivas</p>
            </div>
            <div className="flex items-start space-x-3">
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
                className="lucide lucide-circle-check-big w-6 h-6 text-[#FF5722] flex-shrink-0 mt-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <p className="text-white">
                Proyectos prácticos de análisis de datos reales
              </p>
            </div>
            <div className="flex items-start space-x-3">
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
                className="lucide lucide-circle-check-big w-6 h-6 text-[#FF5722] flex-shrink-0 mt-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <p className="text-white">Soporte de la comunidad</p>
            </div>
            <div className="flex items-start space-x-3">
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
                className="lucide lucide-circle-check-big w-6 h-6 text-[#FF5722] flex-shrink-0 mt-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <p className="text-white">Videos demostrativos </p>
            </div>
            <div className="flex items-start space-x-3">
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
                className="lucide lucide-circle-check-big w-6 h-6 text-[#FF5722] flex-shrink-0 mt-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <p className="text-white">Material descargable </p>
            </div>
            <div className="flex items-start space-x-3">
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
                className="lucide lucide-circle-check-big w-6 h-6 text-[#FF5722] flex-shrink-0 mt-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <p className="text-white">Acceso gratuito de por vida </p>
            </div>
          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
};

export default characteristics;
