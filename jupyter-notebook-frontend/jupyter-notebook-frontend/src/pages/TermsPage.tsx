import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div style={{ background: "#1E1E1E", minHeight: "100vh" }} className="text-white">
      {/* Header */}
      <div
        style={{ background: "#242424", borderBottom: "1px solid #333" }}
        className="px-6 py-4 flex items-center gap-4"
      >
        <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Volver al inicio
        </Link>
      </div>

      {/* Hero */}
      <div
        style={{ background: "#FF5722" }}
        className="relative px-6 py-16 text-center overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <h1 className="relative text-4xl font-bold text-white mb-3">
          Términos y Condiciones
        </h1>
        <p className="relative text-white/80 text-lg">
          Curso de Jupyter Notebook — Universidad de Guadalajara
        </p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        <section>
          <h2 className="text-xl font-semibold text-orange-500 mb-3">1. Acceso y elegibilidad</h2>
          <p className="text-gray-300 leading-relaxed">
            El acceso a esta plataforma está reservado exclusivamente para alumnos activos de la
            Universidad de Guadalajara. Para registrarse es obligatorio utilizar un correo
            institucional con terminación <span className="text-white font-medium">@alumnos.udg.mx</span>.
            Cualquier intento de registro con correos no institucionales será rechazado automáticamente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-orange-500 mb-3">2. Uso del contenido</h2>
          <p className="text-gray-300 leading-relaxed">
            Todo el material disponible en esta plataforma — incluyendo videos, ejercicios y recursos —
            es de uso exclusivamente educativo. Queda prohibida la reproducción, distribución o
            comercialización del contenido sin autorización expresa del autor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-orange-500 mb-3">3. Credenciales de acceso</h2>
          <p className="text-gray-300 leading-relaxed">
            Cada cuenta es personal e intransferible. El usuario es responsable de mantener la
            confidencialidad de su contraseña y de todas las actividades realizadas bajo su cuenta.
            Queda estrictamente prohibido compartir credenciales con terceros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-orange-500 mb-3">4. Generación de ejercicios con IA</h2>
          <p className="text-gray-300 leading-relaxed">
            La plataforma incluye una herramienta de generación de ejercicios basada en inteligencia
            artificial. Esta funcionalidad está diseñada únicamente como apoyo pedagógico. Los
            ejercicios generados no sustituyen la evaluación formal del curso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-orange-500 mb-3">5. Revocación de acceso</h2>
          <p className="text-gray-300 leading-relaxed">
            El administrador se reserva el derecho de suspender o revocar el acceso a cualquier
            usuario que incumpla estos términos, haga un uso indebido de la plataforma, o cuya
            condición de alumno activo de la UDG no pueda ser verificada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-orange-500 mb-3">6. Privacidad</h2>
          <p className="text-gray-300 leading-relaxed">
            Los datos personales recopilados (nombre y correo institucional) se utilizan únicamente
            para gestionar el acceso a la plataforma. No se comparten con terceros ni se utilizan
            con fines comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-orange-500 mb-3">7. Contacto</h2>
          <p className="text-gray-300 leading-relaxed">
            Para cualquier duda sobre estos términos puedes contactar al administrador a través de la
            página de{" "}
            <Link to="/contacto" className="text-orange-500 hover:underline">
              contacto
            </Link>
            .
          </p>
        </section>

        <p className="text-gray-500 text-sm pt-4 border-t border-gray-700">
          Última actualización: marzo 2026
        </p>
      </div>
    </div>
  );
}
