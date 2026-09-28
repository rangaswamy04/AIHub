import { useState } from "react";
import { generateText } from "../services/api";

function TextGenerator() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate(event) {
    event.preventDefault();

    setError("");
    setResult("");

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setLoading(true);

    const response = await generateText(topic);

    if (response.ok) {
      setResult(response.data.result);
    } else {
      setError(
        response.data.error ||
        "Unable to generate text."
      );
    }

    setLoading(false);
  }

  return (
    <div className="simple-tool-page">

      {/* HEADER */}

      <div className="simple-tool-page-header">

        <div className="simple-page-icon">
          ✎
        </div>

        <div>
          <h1>Text Generator</h1>

          <p>
            Generate useful and well-structured content with AI.
          </p>
        </div>

      </div>


      {/* GENERATOR */}

      <div className="simple-ai-card">

        <form onSubmit={handleGenerate}>

          <label className="simple-ai-label">
            What would you like to generate?
          </label>

          <textarea
            className="simple-ai-textarea"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Example: Write a professional introduction for a software developer..."
            rows="7"
          />

          {error && (
            <div className="simple-ai-error">
              {error}
            </div>
          )}

          <div className="simple-ai-actions">

            <span className="simple-ai-hint">
              Keep your request clear and specific.
            </span>

            <button
              type="submit"
              className="simple-ai-button"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate"}
            </button>

          </div>

        </form>

      </div>


      {/* RESULT */}

      {result && (
        <div className="simple-result-card">

          <div className="simple-result-header">

            <div>
              <h2>Generated Content</h2>

              <p>
                AI-generated result
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

export default TextGenerator;