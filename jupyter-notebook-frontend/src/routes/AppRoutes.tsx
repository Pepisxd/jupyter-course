import { Routes, Route, Navigate } from "react-router-dom";
import { AuthModalProvider } from "../auth/auth-modal-context";
import ProtectedRoute from "../components/protectedRoute";

import Home from "../pages/Home";
import CourseContent from "../pages/CourseContent";
import NotFound from "../pages/404";
import AuthModals from "../auth/auth-modals";
import ContentManager from "../admin/contentManager";
import ChatInterface from "../pages/ChatPage";

const AppRoutes = () => {
  return (
    <AuthModalProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/course-content"
          element={
            <ProtectedRoute>
              <CourseContent />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/404" />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <ContentManager />
            </ProtectedRoute>
          }
        />
      </Routes>
      <AuthModals />
    </AuthModalProvider>
  );
};

export default AppRoutes;
