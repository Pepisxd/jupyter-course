const TOPICS = [
  "pandas",
  "numpy",
  "markdown",
  "algoritmia",
  "analisis_datos",
  "ml_basico",
];

const DIFFICULTIES = ["basica", "media", "avanzada"];
const EXERCISE_TYPES = [
  "completar_codigo",
  "corregir_errores",
  "explicar_resultado",
  "analisis_texto",
];
const DATASET_SIZES = ["pequeno", "mediano", "grande"];

const SIZE_TO_ROWS = {
  pequeno: 30,
  mediano: 200,
  grande: 1000,
};

const normalizeRequest = (body) => {
  const toKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  return {
    topic: toKey(body.topic || body.tema),
    difficulty: toKey(body.difficulty || body.dificultad),
    exerciseType: toKey(body.exerciseType || body.tipo),
    datasetSize: toKey(body.datasetSize || body.tamano || body.tamanio),
    seed: Number.isFinite(body.seed) ? body.seed : null,
  };
};

const validateRequest = (payload) => {
  const errors = [];

  if (!TOPICS.includes(payload.topic)) {
    errors.push({
      field: "topic",
      allowed: TOPICS,
      message: "Unsupported topic",
    });
  }
  if (!DIFFICULTIES.includes(payload.difficulty)) {
    errors.push({
      field: "difficulty",
      allowed: DIFFICULTIES,
      message: "Unsupported difficulty",
    });
  }
  if (!EXERCISE_TYPES.includes(payload.exerciseType)) {
    errors.push({
      field: "exerciseType",
      allowed: EXERCISE_TYPES,
      message: "Unsupported exercise type",
    });
  }
  if (!DATASET_SIZES.includes(payload.datasetSize)) {
    errors.push({
      field: "datasetSize",
      allowed: DATASET_SIZES,
      message: "Unsupported dataset size",
    });
  }

  return { ok: errors.length === 0, errors };
};

const mulberry32 = (seed) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInt = (rng, min, max) =>
  Math.floor(rng() * (max - min + 1)) + min;

const pick = (rng, values) => values[randomInt(rng, 0, values.length - 1)];

const buildTabularDataset = (rng, rows) => {
  const header = ["id", "ingresos", "edad", "gasto", "segmento"];
  const lines = [header.join(",")];

  for (let i = 1; i <= rows; i += 1) {
    const ingresos = randomInt(rng, 1000, 5000);
    const edad = randomInt(rng, 18, 65);
    const gasto = Math.round(ingresos * (0.15 + rng() * 0.5));
    const segmento = ingresoSegmento(ingresos, gasto);
    lines.push([i, ingresos, edad, gasto, segmento].join(","));
  }

  return {
    format: "csv",
    filename: "datos_clientes.csv",
    content: lines.join("\n"),
    preview: lines.slice(0, 6).join("\n"),
    rows,
  };
};

const ingresoSegmento = (ingresos, gasto) => {
  if (ingresos > 3500 && gasto > 1400) return "premium";
  if (gasto > 1200) return "frecuente";
  return "estandar";
};

const buildNumpyDataset = (rng, rows) => {
  const values = Array.from({ length: rows }, () => randomInt(rng, 1, 100));
  return {
    format: "json",
    filename: "valores.json",
    content: JSON.stringify({ valores: values }, null, 2),
    preview: JSON.stringify({ valores: values.slice(0, 10) }, null, 2),
    rows,
  };
};

const buildMlDataset = (rng, rows) => {
  const header = ["x1", "x2", "y"];
  const lines = [header.join(",")];
  for (let i = 0; i < rows; i += 1) {
    const x1 = randomInt(rng, 0, 50);
    const x2 = randomInt(rng, 0, 50);
    const noise = randomInt(rng, -5, 5);
    const y = x1 * 1.5 + x2 * 0.7 + noise;
    lines.push([x1, x2, y.toFixed(2)].join(","));
  }

  return {
    format: "csv",
    filename: "datos_regresion.csv",
    content: lines.join("\n"),
    preview: lines.slice(0, 6).join("\n"),
    rows,
  };
};

const buildAlgorithmDataset = (rng, rows) => {
  const values = Array.from({ length: rows }, () => randomInt(rng, 1, 200));
  return {
    format: "json",
    filename: "lista_numeros.json",
    content: JSON.stringify({ numeros: values }, null, 2),
    preview: JSON.stringify({ numeros: values.slice(0, 10) }, null, 2),
    rows,
  };
};

const buildMarkdownExercise = (payload) => ({
  title: "Markdown basico: documentar un analisis",
  instructions:
    "Crea una celda Markdown con titulo, objetivos y una lista de pasos del analisis.",
  dataset: null,
  starterCode: "",
  solutionCode:
    "# Analisis del dataset\n\n**Objetivos**\n- Describir columnas\n- Identificar valores faltantes\n- Proponer limpieza\n\n**Pasos**\n1. Cargar datos\n2. Explorar estadisticas\n3. Visualizar resultados",
  expectedOutput: "Markdown bien estructurado con titulo, lista y negritas.",
  hints: ["Usa # para titulos", "Usa - o 1. para listas"],
});

const buildPandasExercise = (payload, dataset) => {
  const baseInstructions =
    "Carga el CSV y calcula el promedio de gasto por segmento.";
  const baseStarter =
    "import pandas as pd\n\ndf = pd.read_csv('datos_clientes.csv')\n# TODO: agrupar por segmento y calcular promedio\n";

  if (payload.exerciseType === "corregir_errores") {
    return {
      title: "Pandas: corregir errores en el agrupamiento",
      instructions:
        "Corrige el codigo para calcular el promedio de gasto por segmento.",
      dataset,
      starterCode:
        "import pandas as pd\n\ndf = pd.read_csv('datos_clientes.csv')\n# ERROR: columna mal escrita y funcion incorrecta\nresultado = df.group('segment').mean('gasto')\nprint(resultado)\n",
      solutionCode:
        "import pandas as pd\n\ndf = pd.read_csv('datos_clientes.csv')\nresultado = df.groupby('segmento')['gasto'].mean()\nprint(resultado)\n",
      expectedOutput:
        "Serie con promedio de gasto por segmento (estandar, frecuente, premium).",
      hints: ["Usa groupby", "La columna se llama 'segmento'"],
    };
  }

  if (payload.exerciseType === "explicar_resultado") {
    return {
      title: "Pandas: interpretar un groupby",
      instructions:
        "Ejecuta el codigo y explica que representa el resultado.",
      dataset,
      starterCode:
        "import pandas as pd\n\ndf = pd.read_csv('datos_clientes.csv')\nresultado = df.groupby('segmento')['gasto'].mean()\nresultado\n",
      solutionCode:
        "El resultado es el promedio de gasto por cada segmento.",
      expectedOutput: "Explicacion clara del resumen por grupo.",
      hints: ["Piensa en agrupar por categoria"],
    };
  }

  if (payload.exerciseType === "analisis_texto") {
    return {
      title: "Pandas: analisis en texto",
      instructions:
        "Describe en texto que segmento gasta mas y justifica con el promedio.",
      dataset,
      starterCode:
        "import pandas as pd\n\ndf = pd.read_csv('datos_clientes.csv')\nresultado = df.groupby('segmento')['gasto'].mean()\nresultado\n",
      solutionCode:
        "El segmento premium tiene mayor gasto promedio. Se observa en la media mas alta.",
      expectedOutput:
        "Parrafo con conclusion y referencia a los promedios.",
      hints: ["Compara los valores de la serie"],
    };
  }

  return {
    title: "Pandas: completar codigo",
    instructions: baseInstructions,
    dataset,
    starterCode: baseStarter,
    solutionCode:
      "import pandas as pd\n\ndf = pd.read_csv('datos_clientes.csv')\nresultado = df.groupby('segmento')['gasto'].mean()\nprint(resultado)\n",
    expectedOutput:
      "Serie con promedio de gasto por segmento (estandar, frecuente, premium).",
    hints: ["Usa groupby y mean"],
  };
};

const buildNumpyExercise = (payload, dataset) => {
  if (payload.exerciseType === "corregir_errores") {
    return {
      title: "NumPy: corregir broadcasting",
      instructions:
        "Corrige el codigo para sumar 5 a cada elemento del arreglo.",
      dataset,
      starterCode:
        "import numpy as np\n\nvalores = np.array([1, 2, 3, 4])\nresultado = valores + [5, 5]\nprint(resultado)\n",
      solutionCode:
        "import numpy as np\n\nvalores = np.array([1, 2, 3, 4])\nresultado = valores + 5\nprint(resultado)\n",
      expectedOutput: "Arreglo con cada valor incrementado en 5.",
      hints: ["Suma un escalar para broadcasting"],
    };
  }

  return {
    title: "NumPy: estadisticas basicas",
    instructions:
      "Carga el JSON y calcula la media, mediana y desviacion estandar.",
    dataset,
    starterCode:
      "import json\nimport numpy as np\n\nwith open('valores.json') as f:\n    data = json.load(f)\nvalores = np.array(data['valores'])\n# TODO: calcula media, mediana, desviacion\n",
    solutionCode:
      "import json\nimport numpy as np\n\nwith open('valores.json') as f:\n    data = json.load(f)\nvalores = np.array(data['valores'])\nmedia = valores.mean()\nmediana = np.median(valores)\nstd = valores.std()\nprint(media, mediana, std)\n",
    expectedOutput:
      "Tres valores numericos: media, mediana, desviacion estandar.",
    hints: ["Usa mean, median, std de numpy"],
  };
};

const buildAlgorithmExercise = (payload, dataset) => ({
  title: "Algoritmia: ordenar y filtrar",
  instructions:
    "Carga la lista y devuelve los 10 numeros mas altos ordenados.",
  dataset,
  starterCode:
    "import json\n\nwith open('lista_numeros.json') as f:\n    data = json.load(f)\nnums = data['numeros']\n# TODO: ordenar y tomar los 10 mas altos\n",
  solutionCode:
    "import json\n\nwith open('lista_numeros.json') as f:\n    data = json.load(f)\nnums = data['numeros']\nresultado = sorted(nums, reverse=True)[:10]\nprint(resultado)\n",
  expectedOutput: "Lista con 10 valores, en orden descendente.",
  hints: ["Usa sorted y slicing"],
});

const buildAnalyticsExercise = (payload, dataset) => ({
  title: "Analisis de datos: perfil de clientes",
  instructions:
    "Calcula el porcentaje de clientes por segmento y crea un grafico de barras.",
  dataset,
  starterCode:
    "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('datos_clientes.csv')\n# TODO: calcular porcentaje por segmento\n",
  solutionCode:
    "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('datos_clientes.csv')\nconteo = df['segmento'].value_counts(normalize=True) * 100\nconteo.plot(kind='bar')\nplt.ylabel('Porcentaje')\nplt.show()\n",
  expectedOutput: "Grafico de barras con porcentajes por segmento.",
  hints: ["Usa value_counts(normalize=True)"],
});

const buildMlExercise = (payload, dataset) => ({
  title: "ML basico: regresion lineal",
  instructions:
    "Entrena una regresion lineal para predecir y usando x1 y x2.",
  dataset,
  starterCode:
    "import pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\n\n# TODO: cargar datos y entrenar\n",
  solutionCode:
    "import pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\n\ndf = pd.read_csv('datos_regresion.csv')\nX = df[['x1', 'x2']]\ny = df['y']\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nmodelo = LinearRegression()\nmodelo.fit(X_train, y_train)\npred = modelo.predict(X_test)\nprint('MSE:', mean_squared_error(y_test, pred))\n",
  expectedOutput: "MSE impreso en consola.",
  hints: ["Divide datos en train/test", "Usa LinearRegression"],
});

const buildExercise = (payload, seed) => {
  const rng = mulberry32(seed);
  const rows = SIZE_TO_ROWS[payload.datasetSize] || 30;

  if (payload.topic === "markdown") {
    return buildMarkdownExercise(payload);
  }

  let dataset = null;
  if (payload.topic === "pandas" || payload.topic === "analisis_datos") {
    dataset = buildTabularDataset(rng, rows);
  } else if (payload.topic === "numpy") {
    dataset = buildNumpyDataset(rng, rows);
  } else if (payload.topic === "algoritmia") {
    dataset = buildAlgorithmDataset(rng, rows);
  } else if (payload.topic === "ml_basico") {
    dataset = buildMlDataset(rng, rows);
  }

  if (payload.topic === "pandas") return buildPandasExercise(payload, dataset);
  if (payload.topic === "numpy") return buildNumpyExercise(payload, dataset);
  if (payload.topic === "algoritmia")
    return buildAlgorithmExercise(payload, dataset);
  if (payload.topic === "analisis_datos")
    return buildAnalyticsExercise(payload, dataset);
  if (payload.topic === "ml_basico") return buildMlExercise(payload, dataset);

  return buildMarkdownExercise(payload);
};

module.exports = {
  TOPICS,
  DIFFICULTIES,
  EXERCISE_TYPES,
  DATASET_SIZES,
  normalizeRequest,
  validateRequest,
  buildExercise,
};
