const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../utils/s3Client");
const Lesson = require("../models/Lesson");
const Chapter = require("../models/Chapter");
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

    const bucket = process.env.R2_BUCKET_NAME;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: videoKey,
        Body: videoFile.buffer,
        ContentType: videoContentType,
      })
    );

    const videoUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${videoKey}`;

    // Procesar miniatura (opcional)
    let thumbnailUrl = "";
    if (req.files?.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      const thumbnailKey = `thumbnails/${uuidv4()}-${thumbnailFile.originalname}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: thumbnailKey,
          Body: thumbnailFile.buffer,
          ContentType: thumbnailFile.mimetype,
        })
      );

      thumbnailUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${thumbnailKey}`;
    }

    // 4. Crear la lección y vincularla al capítulo
    const newLesson = new Lesson({
      chapterId,
      title,
      duration,
      description,
      videoUrl,
      thumbnailUrl,
    });

    await newLesson.save();

    // Agregar la lección al array del capítulo
    await Chapter.findByIdAndUpdate(chapterId, {
      $push: { lessons: newLesson._id },
    });

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
