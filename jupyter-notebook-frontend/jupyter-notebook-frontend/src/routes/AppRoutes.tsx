import { Routes, Route, Navigate } from "react-router-dom";
import { AuthModalProvider } from "../auth/auth-modal-context";
import ProtectedRoute from "../components/protectedRoute";

import Home from "../pages/Home";
import CourseContent from "../pages/CourseContent";
import NotFound from "../pages/404";
import AuthModals from "../auth/auth-modals";
import ContentManager from "../admin/contentManager";
import ChatInterface from "../pages/ChatPage";
import ResourcesPage from "../pages/resourcesPage";
import ExerciseGenerator from "../pages/ExerciseGenerator";
import ContactPage from "../pages/ContactPage";
import VerifyPage from "../pages/VerifyPage";
import TermsPage from "../pages/TermsPage";
import AdminExercisePage from "../pages/AdminExercisePage";
import ExerciseComparePage from "../pages/ExerciseComparePage";

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
        <Route path="/resources" element={<ResourcesPage />} />
        <Route
          path="/exercises"
          element={
            <ProtectedRoute>
              <ExerciseGenerator />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/404" />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/verificar" element={<VerifyPage />} />
        <Route path="/terminos" element={<TermsPage />} />
        <Route
          path="/admin/exercises"
          element={
            <ProtectedRoute>
              <AdminExercisePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exercises/compare"
          element={
            <ProtectedRoute>
              <ExerciseComparePage />
            </ProtectedRoute>
          }
        />
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
