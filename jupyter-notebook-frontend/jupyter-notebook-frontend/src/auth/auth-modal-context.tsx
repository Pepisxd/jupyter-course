import React, { createContext, useContext, useState } from "react";

type ModalType = "login" | "register" | "forgotPassword" | null;

interface AuthModalContextType {
  modalType: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within a AuthModalProvider");
  }
  return context;
};

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modalType, setModal] = useState<ModalType>(null);

  // Función para abrir un modal específico
  const openModal = (type: ModalType) => {
    setModal(type);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModal(null);
  };

  // Valor que se pasa a los componentes hijos
  const value = {
    modalType,
    openModal,
    closeModal,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};
