import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertTriangle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "./auth-context";
import { useAuthModal } from "./auth-modal-context";

interface AuthFormProps {
  mode: "login" | "register" | "forgotPassword";
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  // Estados para los campos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Estados para validación
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  // Obtener funciones de autenticación del contexto
  const { login, register, loading, error } = useAuth();
  const { openModal, closeModal } = useAuthModal();

  // Validar el formulario
  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};
    let isValid = true;

    // Validar nombre (solo en registro)
    if (mode === "register" && !name.trim()) {
      errors.name = "El nombre es requerido";
      isValid = false;
    }

    // Validar email
    if (!email) {
      errors.email = "El email es requerido";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email inválido";
      isValid = false;
    }

    // Validar contraseña (excepto en recuperación)
    if (mode !== "forgotPassword") {
      if (!password) {
        errors.password = "La contraseña es requerida";
        isValid = false;
      } else if (password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres";
        isValid = false;
      }
    }

    // Validar confirmación de contraseña (solo en registro)
    if (mode === "register") {
      if (!confirmPassword) {
        errors.confirmPassword = "Confirma tu contraseña";
        isValid = false;
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
        isValid = false;
      }

      // Validar términos y condiciones
      if (!acceptTerms) {
        errors.terms = "Debes aceptar los términos y condiciones";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "login") {
        await login(email, password);
        closeModal(); // Cerrar modal después de login exitoso
      } else if (mode === "register") {
        await register(name, email, password);
        closeModal(); // Cerrar modal después de registro exitoso
      } else if (mode === "forgotPassword") {
        // Simular envío de correo de recuperación
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setResetEmailSent(true);
      }
    } catch (err) {
      console.error("Error en autenticación:", err);
    }
  };

  // Renderizar formulario de recuperación de contraseña
  if (mode === "forgotPassword") {
    return (
      <div className="">
        {resetEmailSent ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                >
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              ¡Correo enviado!
            </h3>
            <p className="text-white/70 mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              . Por favor, revisa tu bandeja de entrada y sigue las
              instrucciones.
            </p>
            <button
              onClick={closeModal}
              className="inline-flex items-center text-[#FF5722] hover:text-[#FF5722]/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a inicio de sesión
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-white/90 text-sm font-medium mb-1"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#333333] text-white w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50 border border-transparent"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => openModal("login")}
                className="inline-flex items-center text-[#FF5722] hover:text-[#FF5722]/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a inicio de sesión
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Renderizar formulario de login o registro
  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-500">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de nombre (solo en registro) */}
        {mode === "register" && (
          <div>
            <label
              htmlFor="name"
              className="block text-white/90 text-sm font-medium mb-1"
            >
              Nombre completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`bg-[#333333] text-white w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50 ${
                  formErrors.name
                    ? "border border-red-500"
                    : "border border-transparent"
                }`}
                placeholder="Tu nombre completo"
              />
            </div>
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>
        )}

        {/* Campo de email */}
        <div>
          <label
            htmlFor="email"
            className="block text-white/90 text-sm font-medium mb-1"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/40" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-[#333333] text-white w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50 ${
                formErrors.email
                  ? "border border-red-500"
                  : "border border-transparent"
              }`}
              placeholder="tu@email.com"
            />
          </div>
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
          )}
        </div>

        {/* Campo de contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block text-white/90 text-sm font-medium mb-1"
          >
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/40" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`bg-[#333333] text-white w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50 ${
                formErrors.password
                  ? "border border-red-500"
                  : "border border-transparent"
              }`}
              placeholder={
                mode === "login" ? "Tu contraseña" : "Crea una contraseña"
              }
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/70"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
          )}
        </div>

        {/* Campo de confirmar contraseña (solo en registro) */}
        {mode === "register" && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-white/90 text-sm font-medium mb-1"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/40" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-[#333333] text-white w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50 ${
                  formErrors.confirmPassword
                    ? "border border-red-500"
                    : "border border-transparent"
                }`}
                placeholder="Confirma tu contraseña"
              />
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>
        )}

        {/* Opciones adicionales */}
        <div className="flex items-center justify-between">
          {mode === "login" ? (
            <>
              {/* Recordar sesión (login) */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#FF5722] focus:ring-[#FF5722] border-gray-600 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-white/70"
                >
                  Recordarme
                </label>
              </div>

              {/* Olvidé mi contraseña */}
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => openModal("forgotPassword")}
                  className="text-[#FF5722] hover:text-[#FF5722]/80"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Términos y condiciones (registro) */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 text-[#FF5722] focus:ring-[#FF5722] border-gray-600 rounded"
                  />
                </div>
                <div className="ml-2 text-sm">
                  <label htmlFor="terms" className="text-white/70">
                    Acepto los{" "}
                    <button
                      type="button"
                      className="text-[#FF5722] hover:text-[#FF5722]/80"
                      onClick={() => window.open("/terminos", "_blank")}
                    >
                      términos y condiciones
                    </button>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {formErrors.terms && (
          <p className="mt-1 text-sm text-red-500">{formErrors.terms}</p>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {mode === "login" ? "Iniciando sesión..." : "Registrando..."}
            </>
          ) : mode === "login" ? (
            "Iniciar Sesión"
          ) : (
            "Crear Cuenta"
          )}
        </button>
      </form>

      {/* Enlace para cambiar de modo */}
      <div className="mt-6  text-center text-white/70">
        {mode === "login" ? (
          <>
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              onClick={() => openModal("register")}
              className="text-[#FF5722] hover:text-[#FF5722]/80 font-medium"
            >
              Regístrate
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes una cuenta?{" "}
            <button
              type="button"
              onClick={() => openModal("login")}
              className="text-[#FF5722] hover:text-[#FF5722]/80 font-medium"
            >
              Inicia sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
