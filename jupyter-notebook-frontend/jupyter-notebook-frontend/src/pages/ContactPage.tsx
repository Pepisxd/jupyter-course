import { motion } from "framer-motion";
import { Mail, Github, Linkedin, GraduationCap, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/HomePage/navbar";
import yopImg from "../assets/yop.png";
import udgImg from "../assets/udg.png";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF5722] to-[#e64a19]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-2">
              Jupyter Notebook
            </p>
            <h1 className="text-4xl font-bold mb-3">Contacto</h1>
            <p className="text-white/75 text-sm max-w-md">
              ¿Tienes dudas sobre el curso? Escríbeme y con gusto te ayudo.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#242424] border border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-[#FF5722]" />
            </div>
            <h2 className="text-base font-semibold">Envíame un mensaje</h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem("name") as HTMLInputElement).value;
              const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
              window.location.href = `mailto:josealbertoorpp@gmail.com?subject=Consulta sobre el curso - ${name}&body=${encodeURIComponent(message)}`;
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Nombre
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Tu nombre"
                className="w-full bg-[#1E1E1E] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="tu@correo.com"
                className="w-full bg-[#1E1E1E] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Mensaje
              </label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="¿En qué puedo ayudarte?"
                className="w-full bg-[#1E1E1E] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#FF5722] hover:bg-[#e64a19] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Enviar mensaje
            </button>
          </form>
        </motion.div>

        {/* Info de contacto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Perfil */}
          <div className="bg-[#242424] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#FF5722]/30 flex-shrink-0">
                <img src={yopImg} alt="José Alberto" className="-mt-2 w-full" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">José Alberto Orozco Rodríguez</h3>
                <p className="text-white/40 text-xs mt-0.5">Desarrollador del Curso</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href="mailto:josealbertoorpp@gmail.com"
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF5722]/10 border border-[#FF5722]/20 flex items-center justify-center group-hover:bg-[#FF5722]/20 transition-colors flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#FF5722]" />
                </div>
                <span className="text-xs">josealbertoorpp@gmail.com</span>
              </a>

              <a
                href="https://github.com/pepisxd"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors flex-shrink-0">
                  <Github className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">github.com/pepisxd</span>
              </a>

              <a
                href="https://linkedin.com/in/pepisxd"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-xs">linkedin.com/in/pepisxd</span>
              </a>
            </div>
          </div>

          {/* UDG */}
          <div className="bg-[#242424] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0">
              <img src={udgImg} alt="UDG" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Proyecto Académico</p>
              <p className="text-white/40 text-xs mt-0.5">Universidad de Guadalajara</p>
            </div>
            <GraduationCap className="w-5 h-5 text-[#FF5722] flex-shrink-0" />
          </div>

          {/* Tiempo de respuesta */}
          <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-2xl p-5">
            <p className="text-xs text-white/60 leading-relaxed">
              <span className="text-[#FF5722] font-semibold">Tiempo de respuesta: </span>
              Generalmente respondo en menos de 24 horas en días hábiles.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
