import Chart from "react-apexcharts";

const SmoothLineChart = ({ title, data = [], color = "#22c55e" }) => {
  const options = {
    chart: { type: "line", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 4 },
    colors: [color],
    xaxis: { categories: data.map((d) => d.label) },
    markers: { size: 5 },
  };

  const series = [{ name: "Payments", data: data.map((d) => d.value) }];

  return (
    <div className="chart-card">
      <h5>{title}</h5>
      <Chart options={options} series={series} type="line" height={300} />
    </div>
  );
};

export default SmoothLineChart;
