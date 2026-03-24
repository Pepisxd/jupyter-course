import { Mail, Github, Linkedin, GraduationCap, MessageCircle } from "lucide-react";
import yopImg from "../assets/yop.png";
import udgImg from "../assets/udg.png";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5 py-16 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MessageCircle className="w-8 h-8 text-[#FF5722]" />
          <h1 className="text-4xl font-bold">Contacto</h1>
        </div>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          ¿Tienes dudas sobre el curso? Escríbeme y con gusto te ayudo.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Formulario */}
        <div className="bg-gray-900 rounded-2xl border border-white/10 p-8">
          <h2 className="text-xl font-semibold mb-6">Envíame un mensaje</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem("name") as HTMLInputElement).value;
              const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
              window.location.href = `mailto:josealbertoorpp@gmail.com?subject=Consulta sobre el curso - ${name}&body=${encodeURIComponent(message)}`;
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Nombre</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Tu nombre"
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Correo electrónico</label>
              <input
                name="email"
                type="email"
                required
                placeholder="tu@correo.com"
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Mensaje</label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="¿En qué puedo ayudarte?"
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF5722] resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Enviar mensaje
            </button>
          </form>
        </div>

        {/* Info de contacto */}
        <div className="space-y-8">
          {/* Perfil */}
          <div className="bg-gray-900 rounded-2xl border border-white/10 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#FF5722]/40">
                <img src={yopImg} alt="José Alberto" className="-mt-3 w-full" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">José Alberto Orozco Rodríguez</h3>
                <p className="text-white/50 text-sm">Desarrollador del Curso</p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="mailto:josealbertoorpp@gmail.com"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#FF5722]/10 flex items-center justify-center group-hover:bg-[#FF5722]/20 transition-colors">
                  <Mail className="w-4 h-4 text-[#FF5722]" />
                </div>
                <span className="text-sm">josealbertoorpp@gmail.com</span>
              </a>

              <a
                href="https://github.com/pepisxd"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Github className="w-4 h-4" />
                </div>
                <span className="text-sm">github.com/pepisxd</span>
              </a>

              <a
                href="https://linkedin.com/in/pepisxd"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm">linkedin.com/in/pepisxd</span>
              </a>
            </div>
          </div>

          {/* UDG */}
          <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0">
              <img src={udgImg} alt="UDG" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-medium">Proyecto Académico</p>
              <p className="text-white/50 text-sm">Universidad de Guadalajara</p>
            </div>
            <GraduationCap className="w-5 h-5 text-[#FF5722] ml-auto flex-shrink-0" />
          </div>

          {/* Tiempo de respuesta */}
          <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 rounded-2xl p-6">
            <p className="text-sm text-white/70">
              <span className="text-[#FF5722] font-semibold">Tiempo de respuesta:</span> Generalmente respondo en menos de 24 horas en días hábiles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
