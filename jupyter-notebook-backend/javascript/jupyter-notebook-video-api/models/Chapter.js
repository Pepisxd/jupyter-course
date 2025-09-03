const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", ChapterSchema);

module.exports = Chapter;
