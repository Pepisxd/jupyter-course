const multer = require("multer");

// Configuración para almacenar en memoria (no en disco)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video") {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Solo se permiten videos (MP4, MOV, etc.)"), false);
    }
  } else if (file.fieldname === "thumbnail") {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten imágenes (JPEG, PNG)"), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
