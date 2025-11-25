import Chart from "react-apexcharts";

const HorizontalBarChart = ({ title, data = [] }) => {
  const options = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 8 },
    },
    colors: ["#10b981"],
    xaxis: { categories: data.map((d) => d.label) },
  };

  const series = [{ name: "Inquiries", data: data.map((d) => d.value) }];

  return (
    <div className="chart-card">
      <h5>{title}</h5>
      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
};

export default HorizontalBarChart;
