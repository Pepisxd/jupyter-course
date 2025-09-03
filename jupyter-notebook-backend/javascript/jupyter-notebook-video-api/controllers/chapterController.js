const Chapter = require("../models/Chapter");
const Lesson = require("../models/Lesson");

exports.createChapter = async (req, res) => {
  try {
    const { title, description } = req.body;

    const existingChapter = await Chapter.findOne({ title });
    if (existingChapter) {
      return res.status(400).json({ msg: "El capítulo ya existe" });
    }

    const newChapter = new Chapter({ title, description });
    await newChapter.save();
    res.status(201).json(newChapter);
  } catch (error) {
    console.error("Error al crear el capítulo: ", error);
    res.status(500).json({ msg: "Error al crear el capítulo" });
  }
};

exports.getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find().populate("lessons");
    res.json(chapters);
  } catch (error) {
    console.error("Error al obtener los capítulos: ", error);
    res.status(500).json({ msg: "Error al obtener los capítulos" });
  }
};

// Obtener un capítulo por ID
exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate("lessons");
    if (!chapter) {
      return res.status(404).json({ msg: "Capítulo no encontrado" });
    }
    res.status(200).json(chapter);
  } catch (error) {
    console.error("Error al obtener el capítulo:", error);
    res.status(500).json({ msg: "Error al obtener el capítulo" });
  }
};

// Actualizar un capítulo
exports.updateChapter = async (req, res) => {
  try {
    const { title, description } = req.body;
    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    if (!updatedChapter) {
      return res.status(404).json({ msg: "Capítulo no encontrado" });
    }
    res.status(200).json(updatedChapter);
  } catch (error) {
    console.error("Error al actualizar el capítulo:", error);
    res.status(500).json({ msg: "Error al actualizar el capítulo" });
  }
};

// Eliminar un capítulo
exports.deleteChapter = async (req, res) => {
  try {
    const deletedChapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!deletedChapter) {
      return res.status(404).json({ msg: "Capítulo no encontrado" });
    }
    res.status(200).json({ msg: "Capítulo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el capítulo:", error);
    res.status(500).json({ msg: "Error al eliminar el capítulo" });
  }
};
