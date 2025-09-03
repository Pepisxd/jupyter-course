const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../utils/s3Client");
const Lesson = require("../models/Lesson");
const Chapter = require("../models/Chapter"); // Asegúrate de importar el modelo Chapter
const mime = require("mime-types");

exports.createLesson = async (req, res) => {
  try {
    const { chapterId, title, duration, description } = req.body;

    // 1. Validar que el chapterId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        error: "ID de capítulo no válido",
      });
    }

    // 2. Verificar que el capítulo exista
    const chapterExists = await Chapter.exists({ _id: chapterId });
    if (!chapterExists) {
      return res.status(404).json({
        success: false,
        error: "El capítulo especificado no existe",
      });
    }

    // 3. Validar que se subió un video
    if (!req.files?.video) {
      return res.status(400).json({
        success: false,
        error: "El video es requerido",
      });
    }

    // Procesar video
    const videoFile = req.files.video[0];
    const videoKey = `videos/${uuidv4()}-${videoFile.originalname}`;
    const videoContentType = mime.lookup(videoFile.originalname);
    videoFile.mimetype;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: videoKey,
        Body: videoFile.buffer,
        ContentType: videoContentType,
      })
    );

    const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${videoKey}`;

    // Procesar miniatura (opcional)
    let thumbnailUrl = "";
    if (req.files?.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      const thumbnailKey = `thumbnails/${uuidv4()}-${
        thumbnailFile.originalname
      }`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: thumbnailKey,
          Body: thumbnailFile.buffer,
          ContentType: thumbnailFile.mimetype,
        })
      );

      thumbnailUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${thumbnailKey}`;
    }

    // 4. Crear la lección (Mongoose convertirá automáticamente el string a ObjectId)
    const newLesson = new Lesson({
      chapterId, // Asegúrate que esto sea un string de 24 caracteres hexadecimales
      title,
      duration,
      description,
      videoUrl,
      thumbnailUrl,
    });

    await newLesson.save();

    console.log("Archivos recibidos:", req.files);
    console.log("Video:", req.files?.video?.[0]);
    console.log("Thumbnail:", req.files?.thumbnail?.[0]);

    res.status(201).json({
      success: true,
      data: newLesson,
    });
  } catch (error) {
    console.error("Error:", error);

    // Manejo específico para errores de validación
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Error al crear la lección",
    });
  }
};
