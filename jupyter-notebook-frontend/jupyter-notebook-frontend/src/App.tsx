import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./auth/auth-context";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
