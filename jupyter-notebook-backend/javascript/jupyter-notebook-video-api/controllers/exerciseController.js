const {
  buildExercise,
  normalizeRequest,
  validateRequest,
} = require("../utils/exerciseGenerator");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "qwen3:4b-instruct-2507";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 30000);

const buildExercisePrompt = (parameters) => {
  return [
    "You are an expert instructor creating beginner-friendly Jupyter exercises.",
    "Return ONLY valid JSON with the exact keys:",
    "title, instructions, starterCode, solutionCode, expectedOutput, hints.",
    "All text must be in Spanish.",
    "Do not include markdown fences or extra text.",
    "",
    `Parameters:`,
    `- topic: ${parameters.topic}`,
    `- difficulty: ${parameters.difficulty}`,
    `- exerciseType: ${parameters.exerciseType}`,
    `- datasetSize: ${parameters.datasetSize}`,
    "",
    "Constraints:",
    "- starterCode should be executable Python where possible.",
    "- solutionCode must solve the task.",
    "- hints must be an array of 2-4 short tips.",
    "- expectedOutput must describe what the learner should see.",
    "",
    "JSON only.",
  ].join("\n");
};

const parseJsonResponse = (rawText) => {
  const trimmed = String(rawText || "").trim();
  if (!trimmed) {
    throw new Error("Empty response from model.");
  }

  const startIndex = trimmed.indexOf("{");
  const endIndex = trimmed.lastIndexOf("}");
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Model response is not JSON.");
  }

  const jsonText = trimmed.slice(startIndex, endIndex + 1);
  return JSON.parse(jsonText);
};

const validateExercisePayload = (exercise) => {
  const errors = [];
  if (!exercise || typeof exercise !== "object") {
    return { ok: false, errors: ["Invalid JSON object."] };
  }

  const requiredFields = [
    "title",
    "instructions",
    "starterCode",
    "solutionCode",
    "expectedOutput",
    "hints",
  ];

  requiredFields.forEach((field) => {
    if (!(field in exercise)) {
      errors.push(`Missing field: ${field}`);
    }
  });

  if (exercise.hints && !Array.isArray(exercise.hints)) {
    errors.push("hints must be an array.");
  }

  return { ok: errors.length === 0, errors };
};

const generateExerciseAI = async (req, res) => {
  const normalized = normalizeRequest(req.body || {});
  const validation = validateRequest(normalized);

  if (!validation.ok) {
    return res.status(400).json({
      error: "invalid_request",
      message: "Invalid exercise parameters",
      details: validation.errors,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const prompt = buildExercisePrompt(normalized);

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Ollama request failed.");
    }

    const data = await response.json();
    const exercise = parseJsonResponse(data.response);
    const exerciseValidation = validateExercisePayload(exercise);

    if (!exerciseValidation.ok) {
      return res.status(422).json({
        error: "invalid_ai_output",
        message: "AI output missing required fields",
        details: exerciseValidation.errors,
      });
    }

    return res.json({
      meta: {
        createdAt: new Date().toISOString(),
        parameters: normalized,
        model: OLLAMA_MODEL,
        version: "v1-ai",
      },
      exercise,
    });
  } catch (error) {
    const message =
      error && error.name === "AbortError"
        ? "Ollama request timed out."
        : error instanceof Error
        ? error.message
        : "Unknown error.";
    return res.status(500).json({
      error: "ollama_error",
      message,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const buildNotebook = (exercise, parameters) => {
  const datasetNote = exercise.dataset
    ? `Dataset esperado: ${exercise.dataset.filename}`
    : "No hay dataset para este ejercicio.";

  return {
    cells: [
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          `# ${exercise.title}\n`,
          "\n",
          `${exercise.instructions}\n`,
          "\n",
          `**${datasetNote}**\n`,
        ],
      },
      {
        cell_type: "markdown",
        metadata: {},
        source: ["## Instrucciones\n", "\n", `${exercise.expectedOutput}\n`],
      },
      {
        cell_type: "code",
        metadata: {},
        execution_count: null,
        outputs: [],
        source: exercise.starterCode
          ? exercise.starterCode.split("\n").map((line) => `${line}\n`)
          : [],
      },
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          "## Pistas\n",
          "\n",
          ...(exercise.hints?.length
            ? exercise.hints.map((hint) => `- ${hint}\n`)
            : ["No hay pistas disponibles.\n"]),
        ],
      },
    ],
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: {
        name: "python",
        version: "3.x",
      },
      jupyter: {
        source: "exercise-generator",
        parameters,
      },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };
};

const generateExercise = (req, res) => {
  const normalized = normalizeRequest(req.body || {});
  const validation = validateRequest(normalized);

  if (!validation.ok) {
    return res.status(400).json({
      error: "invalid_request",
      message: "Invalid exercise parameters",
      details: validation.errors,
    });
  }

  const seed = normalized.seed ?? Math.floor(Math.random() * 1e9);
  const exercise = buildExercise(normalized, seed);

  return res.json({
    meta: {
      createdAt: new Date().toISOString(),
      parameters: { ...normalized, seed },
      version: "v1",
    },
    exercise,
  });
};

const generateNotebook = (req, res) => {
  const normalized = normalizeRequest(req.body || {});
  const validation = validateRequest(normalized);

  if (!validation.ok) {
    return res.status(400).json({
      error: "invalid_request",
      message: "Invalid exercise parameters",
      details: validation.errors,
    });
  }

  const seed = normalized.seed ?? Math.floor(Math.random() * 1e9);
  const exercise = buildExercise(normalized, seed);
  const notebook = buildNotebook(exercise, { ...normalized, seed });

  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="ejercicio.ipynb"'
  );
  return res.send(JSON.stringify(notebook, null, 2));
};

module.exports = { generateExercise, generateNotebook, generateExerciseAI };
