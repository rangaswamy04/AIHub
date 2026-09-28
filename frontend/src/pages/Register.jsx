import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
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

    const result = await registerUser(formData);

    if (result.ok) {
      navigate("/login");
    } else {
      if (typeof result.data === "object") {
        const firstError = Object.values(result.data)[0];

        if (Array.isArray(firstError)) {
          setError(firstError[0]);
        } else {
          setError("Registration failed. Please check your details.");
        }
      } else {
        setError("Registration failed.");
      }
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
            Create your account
          </h1>

          <p>
            Start using AIHub's productivity tools.
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
              placeholder="Choose a username"
              required
            />

          </div>


          <div className="simple-form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
              placeholder="Create a password"
              required
            />

          </div>


          <button
            type="submit"
            className="simple-auth-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>


        {/* LOGIN */}

        <div className="simple-auth-footer">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Sign in
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;