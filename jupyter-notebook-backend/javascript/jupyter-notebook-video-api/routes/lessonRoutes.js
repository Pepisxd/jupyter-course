const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const fileUpload = require("../utils/fileUpload");

// Middleware para manejar errores de Multer
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error de Multer (ej: límite de tamaño excedido)
    return res.status(400).json({ success: false, error: err.message });
  } else if (err) {
    // Otro error (ej: error del fileFilter)
    return res.status(400).json({ success: false, error: err.message });
  }
  next(); // Si no hay error, continua al siguiente middleware/controlador
};

// POST /api/lessons
router.post(
  "/",
  fileUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  multerErrorHandler, // Agrega el middleware de manejo de errores aquí
  lessonController.createLesson
);

module.exports = router;
