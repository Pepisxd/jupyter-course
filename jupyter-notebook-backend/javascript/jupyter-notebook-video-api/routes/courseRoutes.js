const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadVideo } = require("../controllers/courseController");
const { uploadImage } = require("../controllers/courseController");
const {
  getCourses,
  getCourseById,
  createCourse,
  createOrUpdateCourse,
} = require("../controllers/courseController");
const auth = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

// Obtener todos los cursos (requiere autenticación)
router.get("/", auth, getCourses);

// Obtener un curso por su ID (requiere autenticación)
router.get("/:id", auth, getCourseById);

// Crear un nuevo curso (opcional, si deseas agregar cursos desde la API)
router.post("/", auth, adminMiddleware, createOrUpdateCourse);

router.post(
  "/uploadVideo",
  authMiddleware,
  adminMiddleware,
  upload.single("Video"),
  uploadVideo
);

router.post(
  "/uploadImage",
  authMiddleware,
  adminMiddleware,
  upload.single("Image"),
  uploadImage
);

module.exports = router;
