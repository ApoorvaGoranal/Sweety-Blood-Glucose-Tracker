
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

function GlucoseChart({ readings }) {
  const chartData = [...readings]
    .sort((a, b) =>
      new Date(a.reading_date) - new Date(b.reading_date)
    )
    .map((reading) => ({
      date: String(reading.reading_date).slice(0, 10),
      value: Number(reading.value),
      slot: reading.slot
    }));

  if (chartData.length === 0) {
    return <p className="empty-message">Add readings to see your glucose trend.</p>;
  }

  return (
    <div className="chart-container">
      <h2>Glucose Trend</h2>
      <p className="chart-description">
        Your recorded blood glucose readings over time.
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value) => [`${value} mg/dL`, "Glucose"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3978e8"
            strokeWidth={3}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GlucoseChart;
