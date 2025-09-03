const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");

// Ruta para iniciar un nuevo notebook
router.post("/start", (req, res) => {
  const jupyterProcess = spawn(
    "jupyter",
    ["notebook", "--no-browser", "--port=8888"],
    {
      stdio: "inherit",
    }
  );

  jupyterProcess.on("error", (err) => {
    console.error("Error al iniciar Jupyter:", err);
    res.status(500).json({ error: "Error al iniciar Jupyter" });
  });

  res.json({ message: "Jupyter Notebook iniciado" });
});

// Ruta para obtener la URL del notebook
router.get("/url", (req, res) => {
  res.json({ url: "http://localhost:8888" });
});

module.exports = router;
