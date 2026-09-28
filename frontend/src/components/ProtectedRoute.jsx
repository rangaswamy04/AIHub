import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  const { loading } = useAuth();


  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#5f6472",
          fontSize: "14px",
        }}
      >
        Loading AIHub...
      </div>
    );
  }


  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return children;
}

export default ProtectedRoute;