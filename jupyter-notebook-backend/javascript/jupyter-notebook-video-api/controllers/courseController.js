const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Chapter = require("../models/Chapter");
const s3Client = require("../utils/s3Client");
const mongoose = require("mongoose");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

// Obtener todos los cursos (protegido con autenticación)
exports.getCourses = async (req, res) => {
  try {
    const lessons = await Lesson.find().lean();
    const chapters = await Chapter.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Función para generar URL firmada compatible con R2
    const generateSignedUrl = async (url) => {
      try {
        if (!url) return null;

        const urlObj = new URL(url);
        const isR2 = urlObj.hostname.includes("r2.cloudflarestorage.com");

        let bucket, key;
        if (isR2) {
          // R2 URL: https://<accountId>.r2.cloudflarestorage.com/<bucket>/<key>
          const pathParts = urlObj.pathname.substring(1).split("/");
          bucket = pathParts[0];
          key = decodeURIComponent(pathParts.slice(1).join("/"));
        } else {
          // S3 URL: https://<bucket>.s3.amazonaws.com/<key>
          bucket = urlObj.hostname.split(".")[0];
          key = decodeURIComponent(urlObj.pathname.substring(1));
        }

        // Determinar el Content-Type basado en la extensión del archivo
        const fileExtension = key.split(".").pop().toLowerCase();
        let contentType = "application/octet-stream";

        if (fileExtension === "mp4") {
          contentType = "video/mp4";
        } else if (fileExtension === "mov") {
          contentType = "video/quicktime";
        } else if (fileExtension === "webm") {
          contentType = "video/webm";
        } else if (["jpg", "jpeg"].includes(fileExtension)) {
          contentType = "image/jpeg";
        } else if (fileExtension === "png") {
          contentType = "image/png";
        }

        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          ResponseContentType: contentType,
          ResponseContentDisposition: "inline",
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });
        return signedUrl;
      } catch (error) {
        console.error("Error generando URL firmada:", error.message);
        return null;
      }
    };

    // Agrupar las lecciones por chapterId y generar URLs firmadas
    const lessonsByChapter = {};
    for (const lesson of lessons) {
      const chapterId = lesson.chapterId.toString();
      if (!lessonsByChapter[chapterId]) {
        lessonsByChapter[chapterId] = [];
      }

      // Generar URLs firmadas para video y thumbnail
      const signedVideoUrl = await generateSignedUrl(lesson.videoUrl);
      const signedThumbnailUrl = await generateSignedUrl(lesson.thumbnailUrl);

      lessonsByChapter[chapterId].push({
        id: lesson._id.toString(),
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        videoUrl: signedVideoUrl || lesson.videoUrl, // Usar URL original si la firmada falla
        thumbnail: signedThumbnailUrl || lesson.thumbnailUrl, // Usar URL original si la firmada falla
        completed: false,
        locked: false,
      });
    }

    // Convertir capítulos a formato de cursos
    const coursesWithLessons = chapters.map((chapter) => ({
      id: chapter._id.toString(),
      title: chapter.title || "Curso sin título",
      description: chapter.description || "Sin descripción",
      image: chapter.image || "",
      lessons: lessonsByChapter[chapter._id.toString()] || [],
    }));

    if (false && coursesWithLessons.length > 0) {
      console.log(
        JSON.stringify(
          {
            ...coursesWithLessons[0],
            lessons: coursesWithLessons[0].lessons.map((l) => ({
              ...l,
              videoUrl: "URL_FIRMADA",
              thumbnail: "URL_FIRMADA",
            })),
          },
          null,
          2
        )
      );
    }

    res.json(coursesWithLessons);
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Obtener un curso por su ID (protegido con autenticación)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "Curso no encontrado" });
    }
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Crear un curso nuevo (opcional)
exports.createOrUpdateCourse = async (req, res) => {
  try {
    const { id, title, description, image, lessons } = req.body;

    if (!id || !title || !description || !image || !lessons) {
      return res.status(400).json({ msg: "Todos los campos son requeridos" });
    }

    let course = await Course.findOne();

    if (course) {
      course.id = id;
      course.title = title;
      course.description = description;
      course.image = image;
      course.lessons = lessons;
    } else {
      course = new Course({
        id,
        title,
        description,
        image,
        lessons,
      });
    }
    await course.save();
    res.status(201).json({ msg: "Curso creado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "No se ha subido ningún archivo" });
    }

    const params = {
      Bucket: "videos-de-curso",
      Key: `videos/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await s3Videos.upload(params).promise();
    res
      .status(200)
      .json({ msg: "Video subido exitosamente", url: result.Location });
  } catch (error) {
    console.error("Error al subir el video: ", error);
    res.status(500).json({ msg: "Error al subir el video" });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "No se ha subido ningún archivo" });
    }

    const params = {
      Bucket: "imagenes-de-curso",
      Key: `images/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await s3Images.upload(params).promise();
    res
      .status(200)
      .json({ msg: "Imagen subida exitosamente", url: result.Location });
  } catch (error) {
    console.error("Error al subir la imagen: ", error);
    res.status(500).json({ msg: "Error al subir la imagen" });
  }
};
