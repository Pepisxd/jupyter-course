import { useState } from "react";
import API_URL from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  ListChecks,
  Cpu,
  AlertTriangle,
} from "lucide-react";
import Navbar from "../components/HomePage/navbar";

type ExerciseFile = {
  filename: string;
  description: string;
  columns: (string | { nombre: string })[];
};

type ExerciseMeta = {
  createdAt: string;
  parameters: Record<string, string | number | null>;
  model?: string;
  source?: string;
  version: string;
};

type ExercisePayload = {
  title: string;
  instructions: string;
  starterCode: string;
  solutionCode: string;
  expectedOutput: string;
  hints: string[];
  files?: ExerciseFile[];
  steps?: string[];
  acceptanceCriteria?: string[];
};

type ExerciseResponse = {
  meta: ExerciseMeta;
  exercise: ExercisePayload;
};

const LOADING_MESSAGES = [
  "Iniciando el modelo de IA...",
  "Cargando pesos del modelo (puede tardar 1-2 min)...",
  "Generando ejercicio personalizado...",
  "Aplicando LoRA fine-tuning...",
  "Casi listo...",
];

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="max-h-72 overflow-auto rounded-lg bg-black/50 p-4 text-xs text-white/80 font-mono leading-relaxed">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition rounded px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white/70"
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
};

const ExerciseGenerator = () => {
  const [topic, setTopic] = useState("pandas");
  const [difficulty, setDifficulty] = useState("basica");
  const [exerciseType, setExerciseType] = useState("completar_codigo");
  const [datasetSize, setDatasetSize] = useState("pequeno");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExerciseResponse | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    setShowSolution(false);
    setShowCriteria(false);
    setLoadingMsgIdx(0);

    // Rotar mensajes de carga cada 20s
    const msgInterval = setInterval(() => {
      setLoadingMsgIdx((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 20000);

    try {
      const response = await fetch(
        `${API_URL}/api/exercises/generate-ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, difficulty, exerciseType, datasetSize }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message || "No se pudo generar el ejercicio.");
      }

      const data = (await response.json()) as ExerciseResponse;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    } finally {
      clearInterval(msgInterval);
      setIsLoading(false);
    }
  };

  const handleDownloadNotebook = async () => {
    if (!result) return;
    try {
      const response = await fetch(`${API_URL}/api/exercises/notebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.meta.parameters),
      });
      if (!response.ok) throw new Error("No se pudo descargar el notebook.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ejercicio.ipynb";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al descargar.");
    }
  };

  const isModelSource = result?.meta?.source === "model";

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#FF5722]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#FF9800]/20 blur-[140px]" />
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── Panel de configuración ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/3 bg-[#161616] border border-white/10 rounded-2xl p-6 shadow-xl self-start"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-[#FF9800]" />
              <div>
                <h1 className="text-xl font-semibold">Generador de Ejercicios</h1>
                <p className="text-sm text-white/50">Impulsado por tu modelo fine-tuned</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Tema",
                  value: topic,
                  onChange: setTopic,
                  options: [
                    { value: "pandas", label: "Pandas" },
                    { value: "numpy", label: "NumPy" },
                    { value: "markdown", label: "Markdown" },
                    { value: "general", label: "General" },
                  ],
                },
                {
                  label: "Dificultad",
                  value: difficulty,
                  onChange: setDifficulty,
                  options: [
                    { value: "basica", label: "Básica" },
                    { value: "intermedia", label: "Intermedia" },
                    { value: "avanzada", label: "Avanzada" },
                  ],
                },
                {
                  label: "Tipo de ejercicio",
                  value: exerciseType,
                  onChange: setExerciseType,
                  options: [
                    { value: "completar_codigo", label: "Completar código" },
                    { value: "corregir_errores", label: "Corregir errores" },
                    { value: "explicar_resultado", label: "Explicar resultado" },
                    { value: "analisis_texto", label: "Análisis en texto" },
                  ],
                },
                {
                  label: "Tamaño de dataset",
                  value: datasetSize,
                  onChange: setDatasetSize,
                  options: [
                    { value: "pequeno", label: "Pequeño (~40 filas)" },
                    { value: "mediano", label: "Mediano (~200 filas)" },
                    { value: "grande", label: "Grande (~1000 filas)" },
                  ],
                },
              ].map(({ label, value, onChange, options }) => (
                <label key={label} className="block">
                  <span className="text-sm text-white/60">{label}</span>
                  <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-2 w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF9800]/50"
                  >
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#FF5722] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#FF5722]/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-4 h-4" />
                {isLoading ? "Generando..." : "Generar ejercicio"}
              </button>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="mt-6 rounded-xl border border-[#FF9800]/20 bg-[#FF9800]/5 p-4 text-xs text-white/50 space-y-1">
              <p className="flex items-center gap-1.5 text-[#FF9800] font-medium text-xs">
                <Cpu className="w-3 h-3" /> CodeLlama-7B + LoRA fine-tuned
              </p>
              <p>La primera generación puede tardar 2-3 min mientras el modelo carga en la GPU.</p>
            </div>
          </motion.div>

          {/* ── Panel de resultado ── */}
          <div className="lg:w-2/3 space-y-5">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#FF9800]/30 bg-[#141414] p-16 text-center gap-5"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-[#FF9800]/20 border-t-[#FF9800] animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#FF9800]" />
                  </div>
                  <div>
                    <p className="text-white/80 font-medium">Generando ejercicio con IA</p>
                    <p className="text-sm text-white/40 mt-1">{LOADING_MESSAGES[loadingMsgIdx]}</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Header */}
                  <div className="bg-[#151515] border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="text-xl font-semibold">{result.exercise.title}</h2>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isModelSource
                                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                                : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                            }`}
                          >
                            {isModelSource ? "IA Generado" : "Plantilla"}
                          </span>
                        </div>
                        <p className="text-xs text-white/40">
                          {new Date(result.meta.createdAt).toLocaleString("es-MX")}
                          {result.meta.model && ` · ${result.meta.model}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadNotebook}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-[#FF9800]/60 hover:text-white transition"
                      >
                        <Download className="w-4 h-4" />
                        Descargar .ipynb
                      </button>
                    </div>

                    <p className="mt-4 text-white/75 text-sm leading-relaxed">
                      {result.exercise.instructions}
                    </p>

                    {/* Files */}
                    {result.exercise.files && result.exercise.files.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.exercise.files.map((f) => (
                          <div
                            key={f.filename}
                            className="flex items-center gap-1.5 text-xs rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
                          >
                            <FileText className="w-3 h-3 text-[#FF9800]" />
                            <span className="text-white/70">{f.filename}</span>
                            {f.description && (
                              <span className="text-white/40">— {f.description}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pasos */}
                  {result.exercise.steps && result.exercise.steps.length > 0 && (
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                      <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
                        Pasos a seguir
                      </h3>
                      <ol className="space-y-2">
                        {result.exercise.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FF9800]/20 text-[#FF9800] text-xs flex items-center justify-center shrink-0 font-medium">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Código */}
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                      <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
                        Código inicial
                      </h3>
                      <CodeBlock code={result.exercise.starterCode || "# Sin código inicial"} />
                    </div>

                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                      <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
                        Resultado esperado
                      </h3>
                      <p className="text-sm text-white/70 leading-relaxed mb-4">
                        {result.exercise.expectedOutput}
                      </p>

                      {result.exercise.hints?.length > 0 && (
                        <>
                          <h4 className="text-xs uppercase tracking-widest text-white/30 mb-2">Pistas</h4>
                          <ul className="space-y-1.5">
                            {result.exercise.hints.map((hint, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                <span className="text-[#FF9800] mt-0.5">›</span>
                                {hint}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Solución */}
                  <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                    <button
                      type="button"
                      onClick={() => setShowSolution((p) => !p)}
                      className="flex items-center gap-2 text-sm text-[#FF9800] hover:text-[#FFB74D] transition w-full"
                    >
                      {showSolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {showSolution ? "Ocultar solución" : "Ver solución"}
                    </button>
                    {showSolution && (
                      <div className="mt-3">
                        <CodeBlock code={result.exercise.solutionCode || "# Sin solución disponible"} />
                      </div>
                    )}
                  </div>

                  {/* Criterios de aceptación */}
                  {result.exercise.acceptanceCriteria && result.exercise.acceptanceCriteria.length > 0 && (
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
                      <button
                        type="button"
                        onClick={() => setShowCriteria((p) => !p)}
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition w-full"
                      >
                        <ListChecks className="w-4 h-4 text-[#FF9800]" />
                        Criterios de aceptación
                        {showCriteria ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                      </button>
                      {showCriteria && (
                        <ul className="mt-3 space-y-2">
                          {result.exercise.acceptanceCriteria.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/65">
                              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#141414] p-10 text-center gap-3"
                >
                  <Sparkles className="w-8 h-8 text-white/20" />
                  <p className="text-white/60 font-medium">Genera un ejercicio para comenzar</p>
                  <p className="text-sm text-white/30">Configura los parámetros y crea tu primer reto con IA.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseGenerator;
