import React, { useEffect, useRef } from "react";
import { JupyterLab } from "@jupyterlab/application";
import { ServiceManager } from "@jupyterlab/services";

const JupyterNotebook = () => {
  const jupyterRef = useRef(null);

  useEffect(() => {
    const initJupyter = async () => {
      try {
        // Configurar el ServiceManager
        const serviceManager = new ServiceManager();
        await serviceManager.ready;

        // Crear una nueva instancia de JupyterLab
        const jupyterLab = new JupyterLab({
          serviceManager,
          shell: {
            activate: true,
          },
        });

        // Montar JupyterLab en el contenedor
        if (jupyterRef.current) {
          jupyterLab.attach(jupyterRef.current);
        }
      } catch (error) {
        console.error("Error al inicializar Jupyter:", error);
      }
    };

    initJupyter();
  }, []);

  return (
    <div
      className="jupyter-container"
      style={{ height: "100vh", width: "100%" }}
    >
      <div ref={jupyterRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default JupyterNotebook;
