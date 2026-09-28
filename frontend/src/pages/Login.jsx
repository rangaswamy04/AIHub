import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await loginUser(formData);

    if (result.ok) {
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("username", result.data.username);
      localStorage.setItem("email", result.data.email);
      localStorage.setItem("plan", "free");

      navigate("/");
    } else {
      setError(
        result.data.message ||
        "Login failed. Please check your details."
      );
    }

    setLoading(false);
  }

  return (
    <div className="simple-auth-page">

      <div className="simple-auth-card">

        {/* BRAND */}

        <div className="simple-auth-brand">

          <div className="simple-auth-logo">
            ✦
          </div>

          <div>
            <strong>AIHub</strong>

            <span>
              AI Productivity
            </span>
          </div>

        </div>


        {/* HEADER */}

        <div className="simple-auth-header">

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to continue to AIHub.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="simple-auth-error">
            {error}
          </div>
        )}


        {/* FORM */}

        <form
          className="simple-auth-form"
          onSubmit={handleSubmit}
        >

          <div className="simple-form-group">

            <label>
              Username
            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />

          </div>


          <div className="simple-form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

          </div>


          <button
            type="submit"
            className="simple-auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>


        {/* REGISTER */}

        <div className="simple-auth-footer">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create an account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;