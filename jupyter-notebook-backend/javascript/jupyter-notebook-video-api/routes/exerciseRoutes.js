const express = require("express");
const {
  generateExercise,
  generateNotebook,
  generateExerciseAI,
} = require("../controllers/exerciseController");

const router = express.Router();

router.post("/generate", generateExercise);
router.post("/generate-ai", generateExerciseAI);
router.post("/notebook", generateNotebook);

module.exports = router;
