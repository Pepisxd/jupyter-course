import type React from "react";
import CourseForm from "../admin/courseForm";

const AdminCoursePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona los cursos y lecciones de la plataforma
          </p>
        </div>

        <CourseForm />
      </div>
    </div>
  );
};

export default AdminCoursePage;
