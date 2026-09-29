import { useState } from "react";
import { analyzeResume } from "../services/api";

function ResumeAnalyzer() {
  const [resume, setResume] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze(event) {
    event.preventDefault();

    setError("");
    setResult("");

    if (!resume.trim()) {
      setError("Please enter your resume content.");
      return;
    }

    setLoading(true);

    try {
      const response = await analyzeResume(resume);

      if (response.ok) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || "Unable to analyze the resume.");
      }
    } catch (requestError) {
      setError(
        requestError?.message || "Unable to analyze the resume."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="simple-tool-page">

      {/* HEADER */}

      <div className="simple-tool-page-header">

        <div className="simple-page-icon">
          ◫
        </div>

        <div>
          <h1>Resume Analyzer</h1>

          <p>
            Analyze your resume and get useful improvement suggestions.
          </p>
        </div>

      </div>


      {/* RESUME INPUT */}

      <div className="simple-ai-card">

        <form onSubmit={handleAnalyze}>

          <label className="simple-ai-label">
            Paste your resume
          </label>

          <textarea
            className="simple-ai-textarea"
            value={resume}
            onChange={(event) => setResume(event.target.value)}
            placeholder="Paste your resume content here..."
            rows="14"
          />

          {error && (
            <div className="simple-ai-error">
              {error}
            </div>
          )}

          <div className="simple-ai-actions">

            <span className="simple-ai-hint">
              Include your skills, projects, education, and experience.
            </span>

            <button
              type="submit"
              className="simple-ai-button"
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

          </div>

        </form>

      </div>


      {/* RESULT */}

      {result && (
        <div className="simple-result-card">

          <div className="simple-result-header">

            <div>
              <h2>Resume Analysis</h2>

              <p>
                AI-generated resume feedback
              </p>
            </div>

          </div>

          <div className="simple-result-content">
            {result}
          </div>

        </div>
      )}

    </div>
  );
}

export default ResumeAnalyzer;
