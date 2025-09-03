import React from "react";

const footer: React.FC = () => {
  return (
    <section className="relative py-20 bg-[#FF5722] overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>
      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para dominar Jupyter Notebook?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a miles de desarrolladores que ya han transformado su carrera
            con Jupyter. ¡Empieza tu viaje hoy!
          </p>
          <a
            href="/inscripcion"
            className="inline-block bg-white text-[#FF5722] font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            Inscríbete Ahora
          </a>
          <div className="text-white/90">
            <p className="inline"> Ya tienes cuenta? </p>
            <a href="/login" className="inline-block underline ">
              Inicia sesion
            </a>
          </div>

          <div className="w-16 h-1 bg-white/20 mx-auto my-12"></div>
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                <img src="./src/assets/yop.png" alt="" className="-mt-3" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-xl">
                  José Alberto Orozco Rodríguez
                </h3>
                <p className="text-white/80">Desarrollador del Curso</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/pepisxd"
                target="_blank"
                className="text-white hover:text-white/80 transition-colors"
              >
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
                  className="lucide lucide-github w-6 h-6"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/pepisxd"
                target="_blank"
                className="text-white hover:text-white/80 transition-colors"
              >
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
                  className="lucide lucide-linkedin w-6 h-6"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="mailto:josealbertoorpp@gmail.com"
                className="text-white hover:text-white/80 transition-colors"
              >
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
                  className="lucide lucide-mail w-6 h-6"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <span className="sr-only">Email</span>
              </a>
            </div>
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8">
                  <img src="./src/assets/udg.png" alt="" />
                </div>
                <p className="text-white text-sm">
                  Proyecto Académico - Universidad de Guadalajara
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default footer;
