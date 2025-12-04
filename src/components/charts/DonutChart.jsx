// src/components/charts/DonutChart.jsx
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const DonutChart = ({ title = "", data = [], colors = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: colors.length
              ? colors
              : ["#2563eb", "#22c55e", "#facc15", "#ef4444"],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 15,
            },
          },
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
        },
        cutout: "65%", // donut thickness
      },
    });

    return () => chartRef.current && chartRef.current.destroy();
  }, [data, colors, title]);

  return (
    <div className="chart-container" style={{ width: "100%", height: "280px" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default DonutChart;
