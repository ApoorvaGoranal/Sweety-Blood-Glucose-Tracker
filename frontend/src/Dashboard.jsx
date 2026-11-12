import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import GlucoseChart from "../components/GlucoseChart";

const slots = [
  "Morning fasting",
  "After breakfast",
  "After lunch",
  "After dinner"
];

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [readings, setReadings] = useState([]);
  const [date, setDate] = useState(getToday());
  const [slot, setSlot] = useState("Morning fasting");
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReadings = async () => {
    try {
      const response = await API.get("/readings");
      setReadings(response.data.readings || response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load readings.");
    }
  };

  useEffect(() => {
    loadReadings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const numberValue = Number(value);

    if (!date || !slot || value === "") {
      setError("Please fill in all fields.");
      return;
    }

    if (!Number.isInteger(numberValue) || numberValue < 40 || numberValue > 600) {
      setError("Reading must be a whole number between 40 and 600 mg/dL.");
      return;
    }

    if (date > getToday()) {
      setError("Future dates are not allowed.");
      return;
    }

    const body = {
      reading_date: date,
      slot,
      value: numberValue
    };

    try {
      setLoading(true);

      if (editingId) {
        await API.put(`/readings/${editingId}`, body);
        setMessage("Reading updated successfully!");
      } else {
        await API.post("/readings", body);
        setMessage("Reading added successfully!");
      }

      setValue("");
      setDate(getToday());
      setSlot("Morning fasting");
      setEditingId(null);
      await loadReadings();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reading) => {
    setEditingId(reading.id);
    setDate(String(reading.reading_date).slice(0, 10));
    setSlot(reading.slot);
    setValue(String(reading.value));
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reading?")) {
      return;
    }

    try {
      await API.delete(`/readings/${id}`);
      setMessage("Reading deleted successfully!");
      setError("");
      await loadReadings();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete reading.");
    }
  };
   <Link to="/reports" className="back-link">View Reports</Link>
   
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Sweety 🌸</h1>
          <p>Your Blood Glucose Tracker</p>
        </div>
        <div className="header-user">
          <span>Hello, {user.name || "User"}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h2>Welcome back!</h2>
          <p>Keep track of your daily blood glucose readings.</p>
        </section>

        <section className="card reading-form-card">
          <h2>{editingId ? "Edit Reading" : "Add New Reading"}</h2>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <form onSubmit={handleSubmit}>
            <label>Date</label>
            <input
              className="form-input"
              type="date"
              value={date}
              max={getToday()}
              onChange={(e) => setDate(e.target.value)}
            />

            <label>Reading Slot</label>
            <select
              className="form-input"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              {slots.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <label>Blood Glucose (mg/dL)</label>
            <input
              className="form-input"
              type="number"
              min="40"
              max="600"
              step="1"
              placeholder="Enter reading (40–600)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : editingId ? "Update Reading" : "Add Reading"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setValue("");
                  setDate(getToday());
                  setSlot("Morning fasting");
                  setError("");
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </section>
        <section className="card chart-card">
  <GlucoseChart readings={readings} />
</section>

        <section className="card readings-card">
          <h2>Your Glucose Readings</h2>

          {readings.length === 0 ? (
            <p className="empty-message">No readings yet. Add your first reading above.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Slot</th>
                    <th>Value (mg/dL)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading) => (
                    <tr key={reading.id}>
                      <td>{String(reading.reading_date).slice(0, 10)}</td>
                      <td>{reading.slot}</td>
                      <td>{reading.value}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(reading)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(reading.id)}>
                          Delete
                        </button>
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

export default Dashboard;
