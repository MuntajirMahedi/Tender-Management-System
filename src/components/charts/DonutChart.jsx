import Chart from "react-apexcharts";

const DonutChart = ({ title, data = [], colors }) => {
  const options = {
    chart: { type: "donut" },
    labels: data.map((d) => d.label),
    colors: colors || ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
  };

  const series = data.map((d) => d.value);

  return (
    <div className="chart-card">
      <h5>{title}</h5>
      <Chart options={options} series={series} type="donut" height={300} />
    </div>
  );
};

export default DonutChart;
