import ContentSection from "./content-section";
import ScrollAnimation from "../scrollAnimation";

import type React from "react";

const Content: React.FC = () => {
  return (
    <ScrollAnimation>
      <ContentSection>
        <div className="max-w-6xl mx-auto space-y-16 px-4">
          {/* Encabezado */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Aprende las bases de Jupyter Notebook
            </h2>
            <p className="text-lg text-white/80">
              Descubre cómo crear y ejecutar celdas de código, trabajar con
              markdown y visualizar datos de manera efectiva.
            </p>
          </div>

          {/* Tarjetas y contenido */}
          <div className="space-y-12">
            {/* Tarjetas informativas */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-semibold mb-3">Fundamentos</h3>
                <p className="text-white/70">
                  Domina la interfaz de Jupyter y aprende a trabajar con
                  notebooks de manera eficiente.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-semibold mb-3">Visualización</h3>
                <p className="text-white/70">
                  Crea gráficos interactivos y visualizaciones impactantes con
                  bibliotecas populares.
                </p>
              </div>
            </div>

            {/* Imágenes */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group relative">
                <div className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden">
                  <img
                    src="./src/assets/jupyter-ui.png"
                    alt="Interfaz de Jupyter"
                    className="object-cover object-center transform transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm">
                      Interfaz intuitiva y potente para el análisis de datos
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden">
                  <img
                    src="./src/assets/algobien.webp"
                    alt="Visualizaciones y gráficos"
                    className="object-cover object-center transform transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm">
                      Crea visualizaciones profesionales de datos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </ScrollAnimation>
  );
};

export default Content;
