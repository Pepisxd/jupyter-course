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
    console.log("Obteniendo cursos, capítulos y lecciones...");

    // Obtener todas las lecciones
    const lessons = await Lesson.find().lean();
    console.log("Número de lecciones encontradas:", lessons.length);

    // Obtener todos los capítulos
    const chapters = await Chapter.find().lean();
    console.log("Número de capítulos encontrados:", chapters.length);

    // Función para generar URL firmada
    const generateSignedUrl = async (url) => {
      try {
        if (!url) {
          console.log("URL vacía, retornando null");
          return null;
        }

        console.log("Generando URL firmada para:", url);

        // Extraer el bucket y la key de la URL de S3
        const urlObj = new URL(url);
        const bucket = urlObj.hostname.split(".")[0];
        const key = decodeURIComponent(urlObj.pathname.substring(1)); // Eliminar el '/' inicial y decodificar la URL

        console.log("Bucket:", bucket);
        console.log("Key:", key);

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

        // Generar URL firmada válida por 1 hora
        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });
        console.log("URL firmada generada exitosamente");
        return signedUrl;
      } catch (error) {
        console.error("Error generando URL firmada:", error);
        console.error("Detalles del error:", {
          name: error.name,
          message: error.message,
          code: error.code,
          key: error.key,
        });
        return null; // Devolver null en caso de error
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

    console.log("Cursos procesados:", coursesWithLessons.length);
    if (coursesWithLessons.length > 0) {
      console.log(
        "Ejemplo del primer curso:",
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
