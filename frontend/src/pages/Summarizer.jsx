import { useState } from "react";
import { summarizeText } from "../services/api";

function Summarizer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSummarize(event) {
    event.preventDefault();

    setError("");
    setResult("");

    if (!text.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }

    setLoading(true);

    const response = await summarizeText(text);

    if (response.ok) {
      setResult(response.data.result);
    } else {
      setError(
        response.data.error ||
        "Unable to summarize the text."
      );
    }

    setLoading(false);
  }

  return (
    <div className="simple-tool-page">

      {/* HEADER */}

      <div className="simple-tool-page-header">

        <div className="simple-page-icon">
          ≡
        </div>

        <div>
          <h1>Summarizer</h1>

          <p>
            Turn long text into clear and concise summaries.
          </p>
        </div>

      </div>


      {/* INPUT CARD */}

      <div className="simple-ai-card">

        <form onSubmit={handleSummarize}>

          <label className="simple-ai-label">
            Paste the text you want to summarize
          </label>

          <textarea
            className="simple-ai-textarea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste an article, notes, paragraph, or any other text here..."
            rows="9"
          />

          {error && (
            <div className="simple-ai-error">
              {error}
            </div>
          )}

          <div className="simple-ai-actions">

            <span className="simple-ai-hint">
              Add the complete text for a better summary.
            </span>

            <button
              type="submit"
              className="simple-ai-button"
              disabled={loading}
            >
              {loading ? "Summarizing..." : "Summarize"}
            </button>

          </div>

        </form>

      </div>


      {/* RESULT */}

      {result && (
        <div className="simple-result-card">

          <div className="simple-result-header">

            <div>
              <h2>Summary</h2>

              <p>
                AI-generated summary
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

export default Summarizer;