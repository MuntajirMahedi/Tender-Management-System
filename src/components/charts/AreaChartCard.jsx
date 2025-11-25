import Chart from "react-apexcharts";

const AreaChartCard = ({ title, data = [] }) => {
  const options = {
    chart: { type: "area", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 4 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    colors: ["#1A73E8"],
    xaxis: { categories: data.map((d) => d.label) },
    tooltip: { theme: "light" },
  };

  const series = [
    {
      name: "Revenue",
      data: data.map((d) => d.value),
    },
  ];

  return (
    <div className="chart-card">
      <h5>{title}</h5>
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default AreaChartCard;
