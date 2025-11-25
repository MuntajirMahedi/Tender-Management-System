import { useEffect, useState } from "react";
import SummaryCard from "../../components/SummaryCard";

import SmoothLineChart from "../../components/charts/SmoothLineChart";
import DonutChart from "../../components/charts/DonutChart";
import RoundedBarChart from "../../components/charts/RoundedBarChart";

import { reportApi } from "../../api";
import { formatCurrency } from "../../utils/formatters";

const Dashboard = () => {
  const [overview, setOverview] = useState({});
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [clientTrend, setClientTrend] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ overview }, paymentsReport, clientsReport] = await Promise.all([
          reportApi.getOverview(),
          reportApi.getPaymentsReport({ groupBy: "month" }),
          reportApi.getClientsReport()
        ]);

        setOverview(overview || {});

        // Revenue Trend
        setRevenueTrend(
          (paymentsReport?.byDate || []).map((item) => ({
            label: item.period || "N/A",
            value: Number(item.totalAmount) || 0
          }))
        );

        // Client Status Mix
        setClientTrend(
          (clientsReport?.byStatus || []).map((item) => ({
            label: item.status || "Unknown",
            value: Number(item.count) || 0
          }))
        );

      } catch (error) {
        console.error("Unable to load dashboard metrics", error);
      }
    };

    load();
  }, []);

  // Summary Cards
  const cards = [
    {
      label: "Total Inquiries",
      value: overview.totalInquiries || 0,
      icon: "bi-chat-square-text",
      trend: 12,
      trendLabel: "vs last month"
    },
    {
      label: "Active Clients",
      value: overview.totalClients || 0,
      icon: "bi-people",
      trend: 8,
      trendLabel: "vs last month"
    },
    {
      label: "Revenue (This month)",
      value: formatCurrency(overview.totalPayments || 0, "INR"),
      icon: "bi-currency-rupee",
      trend: 23,
      trendLabel: "vs last month"
    },
    {
      label: "Active Plans",
      value: overview.activePlans || 0,
      icon: "bi-diagram-3-fill",
      trend: -5,
      trendLabel: "vs last month"
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome to your Total Management System
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid mb-4">
        {cards.map((card, index) => (
          <SummaryCard
            key={card.label}
            title={card.label}
            value={card.value}
            trend={card.trend}
            trendLabel={card.trendLabel}
            icon={card.icon}
            colorIndex={index}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        
        {/* Revenue Trend */}
        <div className="col-lg-7">
          <SmoothLineChart
            title="Revenue Trend"
            data={revenueTrend}
            color="#1a73e8"
          />
        </div>

        {/* Client Status Mix (Donut) */}
        <div className="col-lg-5">
          <DonutChart
            title="Client Status Mix"
            data={clientTrend}
            colors={["#2563eb", "#22c55e", "#facc15", "#ef4444"]}
          />
        </div>

      </div>

      {/* Extra Charts (Optional Future Expansion) */}
      {/* 
      <div className="row g-4">
        <div className="col-lg-12">
          <RoundedBarChart
            title="Clients (Bar View)"
            data={clientTrend}
            color="#6366f1"
          />
        </div>
      </div> 
      */}

    </div>
  );
};

export default Dashboard;
