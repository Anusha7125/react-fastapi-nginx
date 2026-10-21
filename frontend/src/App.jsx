
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [health, setHealth] = useState("Checking...");
  const [message, setMessage] = useState("Connecting to FastAPI...");
  const [lastChecked, setLastChecked] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyMessage, setHistoryMessage] = useState(
    "Loading health history..."
  );
  const [checking, setChecking] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const checkingRef = useRef(false);
  const historyLoadingRef = useRef(false);

  const loadHistory = useCallback(async () => {
    if (historyLoadingRef.current) return;

    historyLoadingRef.current = true;
    setLoadingHistory(true);

    try {
      const response = await fetch("/api/history", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();
      const checks = Array.isArray(data.checks) ? data.checks : [];

      setHistory(checks);
      setHistoryMessage(
        checks.length
          ? `${checks.length} recent records loaded from PostgreSQL.`
          : "No health-check records found yet."
      );
    } catch (error) {
      setHistoryMessage(
        error instanceof Error
          ? `Could not load history: ${error.message}`
          : "Could not load health history. Please try again."
      );
    } finally {
      historyLoadingRef.current = false;
      setLoadingHistory(false);
    }
  }, []);

  const checkAPI = useCallback(async () => {
    if (checkingRef.current) return;

    checkingRef.current = true;
    setChecking(true);
    setHealth("Checking...");
    setMessage("Connecting to FastAPI...");

    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();

      if (data.status === "healthy") {
        setHealth("Online");
        setMessage(
          data.database === "connected"
            ? "FastAPI responded successfully. PostgreSQL is connected."
            : "FastAPI responded, but database connectivity is unconfirmed."
        );
      } else {
        setHealth("Unknown");
        setMessage("The API returned an unexpected health status.");
      }
    } catch (error) {
      setHealth("Offline");
      setMessage(
        error instanceof Error
          ? `Could not reach the API: ${error.message}`
          : "Could not reach the API. Check the backend and proxy."
      );
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
      checkingRef.current = false;
      setChecking(false);

      // Load history even if the health check fails.
      loadHistory();
    }
  }, [loadHistory]);

  useEffect(() => {
    checkAPI();
  }, [checkAPI]);

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">DOCKER PROJECT · Q7</p>
        <h1>API Dashboard</h1>
        <p>Monitor backend health and service availability.</p>
      </header>

      <main className="dashboard">
        <section className="status-card">
          <div>
            <p className="label">FastAPI Backend</p>
            <h2>{health}</h2>
            <p className="description">{message}</p>
          </div>

          <span
            className={`status-indicator ${
              health === "Online" ? "online" : "offline"
            }`}
          />
        </section>

        <section className="details-grid">
          <article className="detail-card">
            <p className="label">Backend Framework</p>
            <h3>FastAPI</h3>
            <p>Python REST API</p>
          </article>

          <article className="detail-card">
            <p className="label">Request Routing</p>
            <h3>Nginx</h3>
            <p>Single public entry point on port 80</p>
          </article>

          <article className="detail-card">
            <p className="label">Database</p>
            <h3>PostgreSQL</h3>
            <p>
              {health === "Online" && message.includes("PostgreSQL")
                ? "Connected successfully"
                : health === "Offline"
                  ? "Connection unavailable"
                  : "Checking database connection"}
            </p>
          </article>
        </section>

        <section className="actions">
          <div>
            <h3>Service Health Check</h3>
            <p>Last checked: {lastChecked || "Not checked yet"}</p>
          </div>

          <button onClick={checkAPI} disabled={checking}>
            {checking ? "Checking..." : "Check API"}
          </button>
        </section>

        <section className="history-section">
          <div className="history-heading">
            <h3>Health Check History</h3>

            <button
              onClick={loadHistory}
              disabled={loadingHistory}
            >
              {loadingHistory ? "Refreshing..." : "Refresh History"}
            </button>
          </div>

          <p>{historyMessage}</p>

          {history.length > 0 && (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Checked At</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <span className="history-status">
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {new Date(item.checked_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
