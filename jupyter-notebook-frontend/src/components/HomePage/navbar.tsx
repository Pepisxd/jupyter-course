"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/auth-context";
import { useAuthModal } from "../../auth/auth-modal-context";
import { X, Menu, Home, BookOpen, Mail, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { openModal } = useAuthModal();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const menuItems = [
    { path: "/", label: "Inicio", icon: Home },
    { path: "/course-content", label: "Cursos", icon: BookOpen },
    { path: "/recursos", label: "Recursos", icon: Info },
    { path: "/contacto", label: "Contacto", icon: Mail },
  ];

  return (
    <>
      {/* Navbar principal */}
      <nav className="sticky top-0 left-0 w-full bg-[#1E1E1E] text-white p-4 shadow-lg z-50">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <img
              src="/src/assets/jupyter-logo.png"
              alt="jupyter-logo"
              className="h-8"
            />
          </a>

          {/* Enlaces de navegación (escritorio) */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`hover:text-[#FF5722] transition-colors ${
                  location.pathname === item.path ? "text-[#FF5722]" : ""
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Botones de autenticación (escritorio) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span>Hola, {user.nombre?.trim().split(" ")[0]}</span>{" "}
                {/*Boton para el dashbord de admin*/}
                {user.rol === "admin" && (
                  <Link
                    to="/admin/courses"
                    className="text-white hover:text-[#FF5722] transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-[#FF5722] hover:bg-[#FF5722]/90 px-4 py-2 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openModal("login")}
                  className="text-white hover:text-[#FF5722] transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => openModal("register")}
                  className="bg-[#FF5722] hover:bg-[#FF5722]/90 px-4 py-2 rounded-lg transition-colors"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Botón de menú móvil */}
          <button
            onClick={toggleDrawer}
            className="md:hidden text-white hover:text-[#FF5722] transition-colors"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={toggleDrawer}
            />

            {/* Panel deslizable */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-0 right-0 w-[280px] h-full bg-[#1E1E1E] shadow-xl z-50 md:hidden"
            >
              {/* Encabezado del menú */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-white font-semibold">Jupyter Curso</span>
                <button
                  onClick={toggleDrawer}
                  className="text-white hover:text-[#FF5722] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Enlaces de navegación */}
              <div className="p-4 space-y-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors ${
                        location.pathname === item.path
                          ? "text-[#FF5722]"
                          : "text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>

              {/* Botones de autenticación */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                {user ? (
                  <div className="space-y-4">
                    <p className="text-white">
                      Hola, {user.nombre?.split(" ")[0]}
                    </p>
                    {/**Boton para el dashbord de admin */}
                    {user.rol === "admin" && (
                      <Link
                        to="/admin/courses"
                        className="w-full text-white hover:text-[#FF5722] transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-2 rounded-lg transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        openModal("login");
                        toggleDrawer();
                      }}
                      className="w-full text-white hover:text-[#FF5722] py-2 transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => {
                        openModal("register");
                        toggleDrawer();
                      }}
                      className="w-full bg-[#FF5722] hover:bg-[#FF5722]/90 text-white py-2 rounded-lg transition-colors"
                    >
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
