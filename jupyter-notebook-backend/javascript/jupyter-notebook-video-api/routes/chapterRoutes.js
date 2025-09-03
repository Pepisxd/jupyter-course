const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapterController");
const auth = require("../middleware/authMiddleware");

// Ruta para crear un nuevo capítulo
router.post("/", auth, chapterController.createChapter);

// Ruta para obtener todos los capítulos
router.get("/", auth, chapterController.getChapters);

// Ruta para obtener un capítulo por ID
router.get("/:id", auth, chapterController.getChapterById);

// Ruta para actualizar un capítulo por ID
router.put("/:id", auth, chapterController.updateChapter);

// Ruta para eliminar un capítulo por ID
router.delete("/:id", auth, chapterController.deleteChapter);

module.exports = router;
