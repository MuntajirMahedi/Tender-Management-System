import Chart from "react-apexcharts";

const RoundedBarChart = ({ title, data = [], color = "#6366f1" }) => {
  const options = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 8, columnWidth: "45%" },
    },
    colors: [color],
    xaxis: { categories: data.map((d) => d.label) },
  };

  const series = [{ name: "Count", data: data.map((d) => d.value) }];

  return (
    <div className="chart-card">
      <h5>{title}</h5>
      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
};

export default RoundedBarChart;
