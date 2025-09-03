"use client";

import React from "react";
import Modal from "../components/HomePage/modal";
import AuthForm from "./auth-form";
import { useAuthModal } from "./auth-modal-context";

const AuthModals: React.FC = () => {
  const { modalType, closeModal } = useAuthModal();

  return (
    <>
      {/* Modal de Login */}
      <Modal
        isOpen={modalType === "login"}
        onClose={closeModal}
        title="Iniciar Sesión"
      >
        <AuthForm mode="login" />
      </Modal>

      {/* Modal de Registro */}
      <Modal
        isOpen={modalType === "register"}
        onClose={closeModal}
        title="Crear Cuenta"
      >
        <AuthForm mode="register" />
      </Modal>

      {/* Modal de Recuperación de Contraseña */}
      <Modal
        isOpen={modalType === "forgotPassword"}
        onClose={closeModal}
        title="Recuperar Contraseña"
      >
        <AuthForm mode="forgotPassword" />
      </Modal>
    </>
  );
};

export default AuthModals;
