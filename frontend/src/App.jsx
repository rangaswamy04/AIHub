import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AIChat from "./pages/AIChat";
import TextGenerator from "./pages/TextGenerator";
import Summarizer from "./pages/Summarizer";
import CodeAssistant from "./pages/CodeAssistant";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Pricing from "./pages/Pricing";

function AppLayout() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <Sidebar />}

      <main className={isAuthPage ? "auth-main" : ""}>
        <Routes>

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/text-generator"
            element={
              <ProtectedRoute>
                <TextGenerator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/summarizer"
            element={
              <ProtectedRoute>
                <Summarizer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/code-assistant"
            element={
              <ProtectedRoute>
                <CodeAssistant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            }
          />


        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;