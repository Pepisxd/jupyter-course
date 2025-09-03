// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { spawn } = require("child_process");
const path = require("path");

const authRoutes = require("./routes/authRoutes"); // Rutas de autenticación
const courseRoutes = require("./routes/courseRoutes"); // Rutas de cursos
const chapterRoutes = require("./routes/chapterRoutes"); // Rutas de capítulos
const lessonRoutes = require("./routes/lessonRoutes"); // Rutas de lecciones
const jupyterRoutes = require("./routes/jupyterRoutes");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cursos";

// Iniciar servidor Jupyter
const jupyterProcess = spawn(
  "jupyter",
  ["notebook", "--no-browser", "--port=8888"],
  {
    stdio: "inherit",
  }
);

jupyterProcess.on("error", (err) => {
  console.error("Error al iniciar Jupyter:", err);
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/jupyter", jupyterRoutes);

// Ruta para servir archivos estáticos de Jupyter
app.use(
  "/jupyter",
  express.static(path.join(__dirname, "node_modules/@jupyterlab"))
);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// Conectar a MongoDB
console.log("Intentando conectar a MongoDB en:", MONGO_URI);
mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("MongoDB conectado");
    console.log("Base de datos:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    // Listar todas las colecciones
    mongoose.connection.db
      .listCollections()
      .toArray()
      .then((collections) => {
        console.log("Colecciones en la base de datos:");
        collections.forEach((collection) => {
          console.log("- " + collection.name);
        });
      });
  })
  .catch((err) => console.error("Error de conexión:", err));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
