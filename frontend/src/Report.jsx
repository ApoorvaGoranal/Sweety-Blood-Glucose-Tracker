
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Reports() {
  const [type, setType] = useState("daily");
  const [date, setDate] = useState(getToday());
  const [report, setReport] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async () => {
    setLoading(true);
    setError("");
    setReport(null);
    setReadings([]);

    try {
      let response;

      if (type === "daily") {
        response = await API.get(`/reports/daily?date=${date}`);
      } else if (type === "monthly") {
        response = await API.get("/reports/monthly");
      } else {
        response = await API.get("/reports/previous-month");
      }

      const data = response.data;
      const summary = data.report || data.summary || data;

      setReport(summary);
      setReadings(data.readings || summary.readings || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [type, date]);

  const formatValue = (value) => {
    if (value === null || value === undefined) return "—";
    return Number(value).toFixed(1);
  };

  const getCount = () => {
    return report?.count ?? report?.total_readings ?? readings.length;
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Sweety 🌸</h1>
          <p>Blood Glucose Reports</p>
        </div>
        <Link to="/dashboard" className="back-link">
          Back to Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h2>Your Reports</h2>
          <p>Review your blood glucose readings and summary statistics.</p>
        </section>

        <section className="card report-controls">
          <h2>Select Report</h2>

          <div className="report-tabs">
            <button
              className={type === "daily" ? "tab-btn active-tab" : "tab-btn"}
              onClick={() => setType("daily")}
            >
              Daily
            </button>

            <button
              className={type === "monthly" ? "tab-btn active-tab" : "tab-btn"}
              onClick={() => setType("monthly")}
            >
              This Month
            </button>

            <button
              className={type === "previous" ? "tab-btn active-tab" : "tab-btn"}
              onClick={() => setType("previous")}
            >
              Previous Month
            </button>
          </div>

          {type === "daily" && (
            <div className="date-filter">
              <label htmlFor="report-date">Choose date</label>
              <input
                id="report-date"
                className="form-input"
                type="date"
                max={getToday()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}
        </section>

        {loading && <p className="report-status">Loading report...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && report && (
          <>
            <section className="report-summary">
              <div className="card summary-card">
                <p>Highest</p>
                <h2>{formatValue(report.highest ?? report.max)}</h2>
                <span>mg/dL</span>
              </div>

              <div className="card summary-card">
                <p>Lowest</p>
                <h2>{formatValue(report.lowest ?? report.min)}</h2>
                <span>mg/dL</span>
              </div>

              <div className="card summary-card">
                <p>Average</p>
                <h2>{formatValue(report.average ?? report.avg)}</h2>
                <span>mg/dL</span>
              </div>

              <div className="card summary-card">
                <p>Total Readings</p>
                <h2>{getCount()}</h2>
                <span>readings</span>
              </div>
            </section>

            {type === "daily" && (
              <section className="card readings-card">
                <h2>Readings for {date}</h2>

                {readings.length === 0 ? (
                  <p className="empty-message">
                    No readings recorded for this date.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Slot</th>
                          <th>Glucose Value (mg/dL)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readings.map((reading) => (
                          <tr key={reading.id}>
                            <td>{reading.slot}</td>
                            <td>{reading.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;
