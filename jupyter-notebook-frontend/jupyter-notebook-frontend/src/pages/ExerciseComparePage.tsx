import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Sparkles, ChevronDown, ChevronUp, ArrowLeft,
  Cpu, Zap, AlertTriangle, Download, FileText,
} from "lucide-react";
import Navbar from "../components/HomePage/navbar";

type ExerciseFile = { filename: string; description: string; columns: (string | { nombre: string })[] };
type ExerciseMeta = { createdAt: string; parameters: Record<string, string | number | null>; model?: string; source?: string; version: string };
type ExercisePayload = { title: string; instructions: string; starterCode: string; solutionCode: string; expectedOutput: string; hints: string[]; files?: ExerciseFile[]; steps?: string[] };
type ExerciseResponse = { meta: ExerciseMeta; exercise: ExercisePayload };

type PanelState = { loading: boolean; result: ExerciseResponse | null; error: string; loadingMsg: string };

const MSGS_BASE = [
  "Iniciando modelo...",
  "Cargando pesos (puede tardar 1-2 min)...",
  "Generando ejercicio...",
  "Casi listo...",
];

const MSGS_STRUCTURED = [
  "Iniciando modelo...",
  "Cargando pesos (puede tardar 1-2 min)...",
  "Generando ejercicio...",
  "Estructurando resultado...",
  "Casi listo...",
];

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="relative group">
      <pre className="max-h-64 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-white/80 font-mono leading-relaxed whitespace-pre-wrap">{code}</pre>
      <button onClick={copy} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition rounded px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white/70">
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
};

const LoadingSpinner = ({ msg, color }: { msg: string; color: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16">
    <div className="relative">
      <div className={`w-12 h-12 rounded-full border-2 border-white/10 border-t-${color} animate-spin`} />
      <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-white/40" />
    </div>
    <p className="text-sm text-white/50 text-center max-w-[180px]">{msg}</p>
  </div>
);

const ResultPanel = ({ result, onDownload }: { result: ExerciseResponse; onDownload: () => void }) => {
  const [showSolution, setShowSolution] = useState(false);
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
          <h3 className="font-semibold text-sm leading-snug">{result.exercise.title}</h3>
          <button onClick={onDownload} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/50 hover:text-white hover:border-white/30 transition">
            <Download className="w-3 h-3" /> .ipynb
          </button>
        </div>
        <p className="text-xs text-white/35">{result.meta.model}</p>
        <p className="mt-2 text-xs text-white/60 leading-relaxed">{result.exercise.instructions}</p>
      </div>

      {result.exercise.files && result.exercise.files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.exercise.files.map((f) => (
            <div key={f.filename} className="flex items-center gap-1 text-xs rounded border border-white/10 bg-white/5 px-2 py-1">
              <FileText className="w-2.5 h-2.5 text-[#FF5722]" />
              <span className="text-white/60">{f.filename}</span>
            </div>
          ))}
        </div>
      )}

      {result.exercise.steps && result.exercise.steps.length > 0 && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Pasos</p>
          <ol className="space-y-1">
            {result.exercise.steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/55">
                <span className="w-4 h-4 rounded-full bg-[#FF5722]/20 text-[#FF5722] flex items-center justify-center shrink-0 mt-0.5 text-[10px]">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div>
        <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Código inicial</p>
        <CodeBlock code={result.exercise.starterCode || "# Sin código inicial"} />
      </div>

      {result.exercise.expectedOutput && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Resultado esperado</p>
          <p className="text-xs text-white/55 leading-relaxed">{result.exercise.expectedOutput}</p>
        </div>
      )}

      {result.exercise.hints?.length > 0 && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Pistas</p>
          <ul className="space-y-1">
            {result.exercise.hints.map((h, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-white/50">
                <span className="text-[#FF5722]">›</span>{h}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={() => setShowSolution((p) => !p)} className="flex items-center gap-1.5 text-xs text-[#FF5722] hover:opacity-80 transition">
        {showSolution ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showSolution ? "Ocultar solución" : "Ver solución"}
      </button>
      {showSolution && <CodeBlock code={result.exercise.solutionCode || "# Sin solución"} />}
    </div>
  );
};

const EMPTY_PANEL: PanelState = { loading: false, result: null, error: "", loadingMsg: "" };

const ExerciseComparePage = () => {
  const [topic, setTopic] = useState("pandas");
  const [difficulty, setDifficulty] = useState("basica");
  const [exerciseType, setExerciseType] = useState("completar_codigo");

  const [base, setBase] = useState<PanelState>(EMPTY_PANEL);
  const [structured, setStructured] = useState<PanelState>(EMPTY_PANEL);

  const startLoadingLoop = (
    messages: string[],
    setter: React.Dispatch<React.SetStateAction<PanelState>>
  ) => {
    let idx = 0;
    setter((p) => ({ ...p, loadingMsg: messages[0] }));
    const iv = setInterval(() => {
      idx = Math.min(idx + 1, messages.length - 1);
      setter((p) => ({ ...p, loadingMsg: messages[idx] }));
    }, 20000);
    return iv;
  };

  const fetchBase = async () => {
    setBase({ loading: true, result: null, error: "", loadingMsg: MSGS_BASE[0] });
    const iv = startLoadingLoop(MSGS_BASE, setBase);
    try {
      const res = await fetch(`${API_URL}/api/exercises/generate-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, exerciseType, datasetSize: "mediano" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Error al generar.");
      const data = await res.json();
      setBase((p) => ({ ...p, result: data, loading: false }));
    } catch (e) {
      setBase((p) => ({ ...p, error: e instanceof Error ? e.message : "Error inesperado.", loading: false }));
    } finally {
      clearInterval(iv);
    }
  };

  const fetchStructured = async () => {
    setStructured({ loading: true, result: null, error: "", loadingMsg: MSGS_STRUCTURED[0] });
    const iv = startLoadingLoop(MSGS_STRUCTURED, setStructured);
    try {
      const res = await fetch(`${API_URL}/api/exercises/generate-structured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, exerciseType, datasetSize: "mediano" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Error al generar.");
      const data = await res.json();
      setStructured((p) => ({ ...p, result: data, loading: false }));
    } catch (e) {
      setStructured((p) => ({ ...p, error: e instanceof Error ? e.message : "Error inesperado.", loading: false }));
    } finally {
      clearInterval(iv);
    }
  };

  const handleCompare = () => {
    fetchBase();
    fetchStructured();
  };

  const downloadNotebook = async (panel: ExerciseResponse) => {
    try {
      const res = await fetch(`${API_URL}/api/exercises/notebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(panel.meta.parameters),
      });
      if (!res.ok) throw new Error("No se pudo descargar.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ejercicio.ipynb";
      link.click();
      URL.revokeObjectURL(url);
    } catch {/* ignored */}
  };

  const isLoading = base.loading || structured.loading;

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722] to-[#e64a19]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <Link to="/admin/exercises" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" /> Volver al generador
          </Link>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">Admin · Comparación</p>
            <h1 className="text-3xl font-bold mb-2">Comparar modelos de generación</h1>
            <p className="text-white/70 text-sm max-w-lg">Genera el mismo ejercicio con los dos modos y compara calidad, estructura y detalle.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Config */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#242424] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-end">
          {[
            { label: "Tema", value: topic, onChange: setTopic, options: [{ value: "pandas", label: "Pandas" }, { value: "numpy", label: "NumPy" }, { value: "markdown", label: "Markdown" }] },
            { label: "Dificultad", value: difficulty, onChange: setDifficulty, options: [{ value: "basica", label: "Básica" }, { value: "intermedia", label: "Intermedia" }, { value: "avanzada", label: "Avanzada" }] },
            { label: "Tipo", value: exerciseType, onChange: setExerciseType, options: [{ value: "completar_codigo", label: "Completar código" }, { value: "corregir_errores", label: "Corregir errores" }] },
          ].map(({ label, value, onChange, options }) => (
            <label key={label} className="flex-1 block min-w-[140px]">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</span>
              <select value={value} onChange={(e) => onChange(e.target.value)}
                className="mt-1.5 w-full bg-[#1E1E1E] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722] transition-all">
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          ))}
          <button onClick={handleCompare} disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-[#FF5722] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e64a19] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap">
            <Wand2 className="w-4 h-4" />
            {isLoading ? "Generando..." : "Comparar ambos"}
          </button>
        </motion.div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Panel izquierdo: Modelo base */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-[#242424] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Modelo base</p>
                <p className="text-xs text-white/35">CodeLlama fine-tuned sin post-procesado</p>
              </div>
            </div>
            <div className="p-5">
              <AnimatePresence mode="wait">
                {base.loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingSpinner msg={base.loadingMsg} color="blue-400" />
                  </motion.div>
                ) : base.error ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{base.error}
                  </motion.div>
                ) : base.result ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ResultPanel result={base.result} onDownload={() => downloadNotebook(base.result!)} />
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <Cpu className="w-7 h-7 text-white/15" />
                    <p className="text-sm text-white/30">Output directo del modelo fine-tuned</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Panel derecho: IA Estructurada */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[#242424] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
              <div className="w-7 h-7 rounded-lg bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-[#FF5722]" />
              </div>
              <div>
                <p className="text-sm font-semibold">IA Estructurada</p>
                <p className="text-xs text-white/35">Modelo fine-tuned + estructurado por IA</p>
              </div>
            </div>
            <div className="p-5">
              <AnimatePresence mode="wait">
                {structured.loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingSpinner msg={structured.loadingMsg} color="[#FF5722]" />
                  </motion.div>
                ) : structured.error ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{structured.error}
                  </motion.div>
                ) : structured.result ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ResultPanel result={structured.result} onDownload={() => downloadNotebook(structured.result!)} />
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <Zap className="w-7 h-7 text-white/15" />
                    <p className="text-sm text-white/30">Modelo fine-tuned + estructurado por IA</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseComparePage;
