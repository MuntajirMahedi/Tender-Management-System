import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const BarChartCard = ({ title, data = [], dataKey = "value", color = "#1a73e8" }) => {

  // SAFE DATA (avoid: undefined label, string values, null values)
  const safeData = (data || []).map((item) => ({
    label: item.label || "N/A",
    [dataKey]: Number(item[dataKey]) || 0
  }));

  return (
    <div className="chart-card h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{title}</h5>
      </div>

      {safeData.length === 0 ? (
        <div className="text-center text-muted py-5">No data available</div>
      ) : (
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BarChartCard;
