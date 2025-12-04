import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { inquiryApi, clientApi } from "../api";
import { getUpcomingRenewals } from "../api/renewals";
import usePermission from "../hooks/usePermission";

const ConversionFunnel = () => {
  const { can } = usePermission();

  // Permissions
  const canInquiries = can("inquiry:view");
  const canClients = can("client:view");
  const canRenewals = can("renewal:view");

  const [funnelData, setFunnelData] = useState([]);

  useEffect(() => {
    if (!canInquiries && !canClients && !canRenewals) return; // No permission → hide card

    const load = async () => {
      try {
        const [inqRes, clientRes, renewRes] = await Promise.all([
          canInquiries ? inquiryApi.getInquiries() : Promise.resolve({ inquiries: [] }),
          canClients ? clientApi.getClients() : Promise.resolve({ clients: [] }),
          canRenewals ? getUpcomingRenewals() : Promise.resolve({ plans: [] }),
        ]);

        const inquiries = inqRes?.inquiries || [];
        const clients = clientRes?.clients || [];
        const renewals = renewRes?.plans || [];

        const temp = [];

        // Inquiry-based
        if (canInquiries) {
          temp.push({ label: "Total Inquiries", value: inquiries.length });

          const prospects = inquiries.filter((i) => i.status === "Prospect").length;
          temp.push({ label: "Prospects", value: prospects });
        }

        // Client-based
        if (canClients) {
          temp.push({ label: "Total Clients", value: clients.length });

          const activeClients = clients.filter((c) => c.status === "Active").length;
          temp.push({ label: "Active Clients", value: activeClients });
        }

        // Renewal-based
        if (canRenewals) {
          temp.push({ label: "Upcoming Renewals", value: renewals.length });
        }

        setFunnelData(temp);
      } catch (err) {
        console.error("Funnel Load Error:", err);
      }
    };

    load();
  }, [canInquiries, canClients, canRenewals]);

  // No data → hide full card
  if (funnelData.length === 0) return null;

  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      animations: { enabled: true },
    //   background: "transparent",
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: true,
        distributed: true,
        barHeight: "80%",
        isFunnel: true,
        // background: "transparent",
      },
    },
    colors: ["#1E40AF", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"],
    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        return funnelData[opt.dataPointIndex]?.label + ": " + val;
      },
      style: {
        fontSize: "14px",
        fontWeight: 600,
        // colors: ["#fff"],
      },
      dropShadow: {
        enabled: true,
        blur: 3,
        opacity: 0.4,
      },
    },
    xaxis: {
      categories: funnelData.map((d) => d.label),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    legend: { show: false },
    tooltip: { enabled: true },
  };

  return (
    <div
      className="summary-card"
      style={{
        padding: "20px",
        borderRadius: "16px",
        // boxShadow: "0 8px 24px hsla(0, 0%, 0%, 0.00)",
        position: "relative",
        // background: "transparent", // ⭐ SAME DESIGN — only background transparent
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between mb-2">
        <h5 className="fw-bold">Conversion Funnel</h5>

        <span
          style={{
            // background: "transparent",
            // color: "#475569",
            padding: "4px 12px",
            fontSize: "12px",
            borderRadius: "12px",
            fontWeight: 600,
          }}
        >
          Live
        </span>
      </div>

      {/* Funnel Chart */}
      <div style={{ position: "relative", height: "350px", marginTop: "10px" }}>
        <Chart
          type="bar"
          height={350}
          series={[{ data: funnelData.map((d) => d.value) }]}
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default ConversionFunnel;
