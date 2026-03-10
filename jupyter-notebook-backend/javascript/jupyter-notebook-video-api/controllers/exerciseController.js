const {
  buildExercise,
  normalizeRequest,
  validateRequest,
} = require("../utils/exerciseGenerator");

const MODAL_URL = process.env.MODAL_URL || "";
const MODAL_TIMEOUT_MS = Number(process.env.MODAL_TIMEOUT_MS || 600000);

// Modal puede devolver 303 con un URL de resultado para funciones lentas.
// Esta función sigue el redirect y hace polling hasta obtener el resultado.
async function fetchModalWithRedirect(url, body, signal) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
    redirect: "manual",
  });

  if (response.status === 303) {
    const resultUrl = response.headers.get("location");
    if (!resultUrl) throw new Error("Modal redirect sin location header.");

    // Polling hasta que el resultado esté listo (Modal devuelve 202 mientras espera)
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await fetch(resultUrl, { signal });
      if (poll.status === 200) return poll;
      if (poll.status !== 202) {
        const text = await poll.text();
        throw new Error(`Modal poll error ${poll.status}: ${text}`);
      }
    }
    throw new Error("Modal: timeout esperando resultado.");
  }

  return response;
}

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

  if (!MODAL_URL) {
    return res.status(503).json({
      error: "modal_not_configured",
      message: "MODAL_URL no está configurado en el servidor.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MODAL_TIMEOUT_MS);

  try {
    const response = await fetchModalWithRedirect(
      `${MODAL_URL}/generate`,
      {
        topic: normalized.topic,
        difficulty: normalized.difficulty,
        exerciseType: normalized.exerciseType,
        datasetSize: normalized.datasetSize,
      },
      controller.signal
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Modal request failed.");
    }

    const data = await response.json();
    const exercise = data.exercise;

    if (!exercise || !exercise.title) {
      return res.status(422).json({
        error: "invalid_ai_output",
        message: "La respuesta del modelo no contiene un ejercicio válido.",
      });
    }

    return res.json({
      meta: {
        createdAt: new Date().toISOString(),
        parameters: normalized,
        model: "codellama-edugen-v2",
        source: data.source || "model",
        version: "v2-modal",
      },
      exercise,
    });
  } catch (error) {
    const message =
      error && error.name === "AbortError"
        ? "La solicitud al modelo expiró. Intenta de nuevo."
        : error instanceof Error
        ? error.message
        : "Error desconocido.";
    return res.status(500).json({
      error: "modal_error",
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
