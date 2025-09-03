const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Chapter",
  },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Lesson", LessonSchema);
