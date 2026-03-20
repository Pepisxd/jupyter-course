import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../lib/api";

interface User {
  nombre: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay un token almacenado al cargar la aplicación
    const token = localStorage.getItem("token");
    if (token) {
      // Configurar el token en axios para todas las peticiones
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Obtener información del usuario
      axios
        .get(`${API_URL}/api/auth/me`)
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          // Si hay error, limpiar el token inválido
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      const { token, nombre, email: userEmail, rol } = response.data;

      // Guardar el token en localStorage
      localStorage.setItem("token", token);

      // Configurar el token en axios para todas las peticiones
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Actualizar el estado del usuario
      setUser({ nombre, email: userEmail, rol });
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Error al iniciar sesión");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/api/auth/register`, {
        nombre: name,
        email,
        password,
      });
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Error al registrar usuario");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Limpiar el token y el estado del usuario
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
