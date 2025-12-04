import Chart from "react-apexcharts";

const FunnelChart = ({ title, data = [], colors }) => {
  // Convert data [{label, value}] → [{ x, y }]
  const seriesData = data.map((d) => ({
    x: d.label,
    y: d.value
  }));

  const options = {
    chart: {
      type: "bar",
      

      // ✅ REMOVE 3-DOT MENU / DOWNLOAD BUTTON
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        barHeight: "70%", // nice funnel look
      },
    },

    colors: colors || ["#2563eb", "#22c55e", "#facc15", "#ef4444"],

    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        return `${opt.w.globals.labels[opt.dataPointIndex]}: ${val}`;
      },
    },

    legend: { show: false },

    xaxis: {
      categories: data.map((d) => d.label),
    },
  };

  const series = [
    {
      name: "Clients",
      data: seriesData.map((d) => d.y),
    },
  ];

  return (
    <div className="chart-card">
      <h5 className="fw-bold mb-3">{title}</h5>
      <Chart options={options} series={series} type="bar" height={320} />
    </div>
  );
};

export default FunnelChart;
