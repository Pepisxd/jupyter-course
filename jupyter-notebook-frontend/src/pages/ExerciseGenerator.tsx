import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Sparkles, Wand2 } from "lucide-react";
import Navbar from "../components/HomePage/navbar";

type ExerciseDataset = {
  format: string;
  filename: string;
  content: string;
  preview: string;
  rows: number;
};

type ExercisePayload = {
  title: string;
  instructions: string;
  dataset: ExerciseDataset | null;
  starterCode: string;
  solutionCode: string;
  expectedOutput: string;
  hints: string[];
};

type ExerciseResponse = {
  meta: {
    createdAt: string;
    parameters: Record<string, string | number | null>;
    version: string;
  };
  exercise: ExercisePayload;
};

const ExerciseGenerator = () => {
  const [topic, setTopic] = useState("pandas");
  const [difficulty, setDifficulty] = useState("basica");
  const [exerciseType, setExerciseType] = useState("completar_codigo");
  const [datasetSize, setDatasetSize] = useState("pequeno");
  const [seed, setSeed] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExerciseResponse | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    setShowSolution(false);

    try {
      const payload = {
        topic,
        difficulty,
        exerciseType,
        datasetSize,
        seed: seed ? Number(seed) : undefined,
      };

      const response = await fetch(
        "http://localhost:3000/api/exercises/generate-ai",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody?.message || "No se pudo generar el ejercicio."
        );
      }

      const data = (await response.json()) as ExerciseResponse;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrio un error inesperado."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDataset = () => {
    if (!result?.exercise.dataset) return;

    const { content, filename, format } = result.exercise.dataset;
    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExercise = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ejercicio.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadNotebook = async () => {
    if (!result) return;
    setIsLoading(true);
    setError("");

    try {
      const payload = result.meta.parameters;
      const response = await fetch(
        "http://localhost:3000/api/exercises/notebook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody?.message || "No se pudo descargar el notebook."
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ejercicio.ipynb";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrio un error inesperado."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#FF5722]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#FF9800]/20 blur-[140px]" />
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/3 bg-[#161616] border border-white/10 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-[#FF9800]" />
              <div>
                <h1 className="text-xl font-semibold">
                  Generador de ejercicios
                </h1>
                <p className="text-sm text-white/60">
                  Configura el ejercicio ideal para practicar.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-white/70">Tema</span>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2 w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="pandas">Pandas</option>
                  <option value="numpy">NumPy</option>
                  <option value="markdown">Markdown</option>
                  <option value="algoritmia">Algoritmia</option>
                  <option value="analisis_datos">Analisis de datos</option>
                  <option value="ml_basico">ML basico</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-white/70">Dificultad</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-2 w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="basica">Basica</option>
                  <option value="media">Media</option>
                  <option value="avanzada">Avanzada</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-white/70">Tipo de ejercicio</span>
                <select
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="mt-2 w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="completar_codigo">Completar codigo</option>
                  <option value="corregir_errores">Corregir errores</option>
                  <option value="explicar_resultado">
                    Explicar resultado
                  </option>
                  <option value="analisis_texto">Analisis en texto</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-white/70">Tamano de dataset</span>
                <select
                  value={datasetSize}
                  onChange={(e) => setDatasetSize(e.target.value)}
                  className="mt-2 w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="pequeno">Pequeno (20-50)</option>
                  <option value="mediano">Mediano (200-500)</option>
                  <option value="grande">Grande (1000+)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-white/70">
                  Semilla (opcional)
                </span>
                <input
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  type="number"
                  placeholder="Ej: 42"
                  className="mt-2 w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-sm"
                />
              </label>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#FF5722] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#FF5722]/90 disabled:opacity-60"
              >
                <Wand2 className="w-4 h-4" />
                {isLoading ? "Generando..." : "Generar ejercicio"}
              </button>

              {error && (
                <p className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>
          </motion.div>

          <div className="lg:w-2/3 space-y-6">
            {result ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#151515] border border-white/10 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {result.exercise.title}
                      </h2>
                      <p className="text-sm text-white/60 mt-1">
                        Generado {new Date(result.meta.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadNotebook}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-[#FF9800]/60 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                        Descargar notebook
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadExercise}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-[#FF9800]/60 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                        Descargar ejercicio
                      </button>
                      {result.exercise.dataset && (
                        <button
                          type="button"
                          onClick={handleDownloadDataset}
                          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-[#FF9800]/60 hover:text-white"
                        >
                          <Download className="w-4 h-4" />
                          Descargar dataset
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-white/80">
                    {result.exercise.instructions}
                  </p>

                  {result.exercise.dataset && (
                    <div className="mt-6">
                      <h3 className="text-sm uppercase tracking-[0.2em] text-white/50">
                        Vista previa del dataset
                      </h3>
                      <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/40 p-4 text-xs text-white/80">
                        {result.exercise.dataset.preview}
                      </pre>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="grid gap-6 lg:grid-cols-2"
                >
                  <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-white/50">
                      Starter code
                    </h3>
                    <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-black/40 p-4 text-xs text-white/80">
                      {result.exercise.starterCode || "Sin codigo inicial."}
                    </pre>
                  </div>

                  <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-white/50">
                      Resultado esperado
                    </h3>
                    <p className="mt-3 text-sm text-white/80">
                      {result.exercise.expectedOutput}
                    </p>

                    {result.exercise.hints?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs uppercase tracking-[0.2em] text-white/50">
                          Pistas
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-white/70">
                          {result.exercise.hints.map((hint) => (
                            <li key={hint}>• {hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-[#141414] border border-white/10 rounded-2xl p-5"
                >
                  <button
                    type="button"
                    onClick={() => setShowSolution((prev) => !prev)}
                    className="text-sm text-[#FF9800] hover:text-[#FFB74D] transition"
                  >
                    {showSolution ? "Ocultar solucion" : "Mostrar solucion"}
                  </button>
                  {showSolution && (
                    <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-black/40 p-4 text-xs text-white/80">
                      {result.exercise.solutionCode ||
                        "No hay solucion disponible."}
                    </pre>
                  )}
                </motion.div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#141414] p-10 text-center text-white/60">
                <p className="text-lg font-medium text-white/80">
                  Genera un ejercicio para comenzar
                </p>
                <p className="text-sm">
                  Selecciona los parametros y crea tu primer reto.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseGenerator;
