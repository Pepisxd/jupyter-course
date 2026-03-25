const express = require("express");
const {
  generateExercise,
  generateNotebook,
  generateExerciseAI,
  generateExerciseStructured,
} = require("../controllers/exerciseController");

const router = express.Router();

router.post("/generate", generateExercise);
router.post("/generate-ai", generateExerciseAI);
router.post("/generate-structured", generateExerciseStructured);
router.post("/notebook", generateNotebook);

module.exports = router;
