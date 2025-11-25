import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const LineChartCard = ({ title, data = [], dataKey = "value", color = "#1a73e8" }) => {

  // SAFE transform
  const safeData = (data || []).map((item) => ({
    label: item.label || "N/A",
    [dataKey]: Number(item[dataKey]) || 0
  }));

  return (
    <div className="chart-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{title}</h5>
      </div>

      {safeData.length === 0 ? (
        <div className="text-center text-muted py-5">No data available</div>
      ) : (
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default LineChartCard;
