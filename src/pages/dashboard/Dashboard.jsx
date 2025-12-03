// src/pages/dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import SummaryCard from "../../components/SummaryCard";

import SmoothLineChart from "../../components/charts/SmoothLineChart";
import DonutChart from "../../components/charts/DonutChart";

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

        // Overview
        setOverview(overview || {});

        // Revenue Trend Chart
        setRevenueTrend(
          (paymentsReport?.byDate || []).map((item) => ({
            label: item.period || "N/A",
            value: Number(item.totalAmount) || 0
          }))
        );

        // Clients Donut Chart
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

  // ⭐ TREND CALCULATOR
  const calcTrend = (current, last) => {
    if (last === 0 || last === undefined || last === null) return "+100%";
    const diff = ((current - last) / last) * 100;
    return diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
  };

  // ⭐ SUMMARY CARDS
  const cards = [
    {
      label: "Total Inquiries",
      value: overview.totalInquiries || 0,
      icon: "bi-chat-square-text",
      trend: calcTrend(
        overview.currentMonthInquiries,
        overview.lastMonthInquiries
      ),
      trendLabel: "vs last month"
    },
    {
      label: "Active Clients",
      value: overview.totalClients || 0,
      icon: "bi-people",
      trend: calcTrend(
        overview.currentMonthClients,
        overview.lastMonthClients
      ),
      trendLabel: "vs last month"
    },
    {
      label: "Revenue (This month)",
      value: formatCurrency(overview.totalPayments || 0, "INR"),
      icon: "bi-currency-rupee",
      trend: calcTrend(
        overview.currentMonthPayments,
        overview.lastMonthPayments
      ),
      trendLabel: "vs last month"
    },
    {
      label: "Active Plans",
      value: overview.activePlans || 0,
      icon: "bi-diagram-3-fill",
      trend: calcTrend(
        overview.currentMonthPlans,
        overview.lastMonthPlans
      ),
      trendLabel: "vs last month"
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted mb-0">Welcome to your Total Management System</p>
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

        {/* Client Status Donut */}
        <div className="col-lg-5">
          <DonutChart
            title="Client Status Mix"
            data={clientTrend}
            colors={["#2563eb", "#22c55e", "#facc15", "#ef4444"]}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
