import { useState } from "react";
import { analyzeCode } from "../services/api";

function CodeAssistant() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze(event) {
    event.preventDefault();

    setError("");
    setResult("");

    if (!code.trim()) {
      setError("Please enter some code to analyze.");
      return;
    }

    setLoading(true);

    const response = await analyzeCode(code);

    if (response.ok) {
      setResult(response.data.result);
    } else {
      setError(
        response.data.error ||
        "Unable to analyze the code."
      );
    }

    setLoading(false);
  }

  return (
    <div className="simple-tool-page">

      {/* HEADER */}

      <div className="simple-tool-page-header">

        <div className="simple-page-icon">
          &lt;/&gt;
        </div>

        <div>
          <h1>Code Assistant</h1>

          <p>
            Analyze your code and get useful programming suggestions.
          </p>
        </div>

      </div>


      {/* CODE INPUT */}

      <div className="simple-ai-card">

        <form onSubmit={handleAnalyze}>

          <label className="simple-ai-label">
            Paste your code
          </label>

          <textarea
            className="simple-ai-textarea simple-code-textarea"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Paste your Python, JavaScript, Java, or other code here..."
            rows="12"
            spellCheck="false"
          />

          {error && (
            <div className="simple-ai-error">
              {error}
            </div>
          )}

          <div className="simple-ai-actions">

            <span className="simple-ai-hint">
              Include enough code so the AI can understand the problem.
            </span>

            <button
              type="submit"
              className="simple-ai-button"
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Code"}
            </button>

          </div>

        </form>

      </div>


      {/* RESULT */}

      {result && (
        <div className="simple-result-card">

          <div className="simple-result-header">

            <div>
              <h2>Code Analysis</h2>

              <p>
                AI-generated analysis
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

export default CodeAssistant;