import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SummaryCard from "../../components/SummaryCard";
import QuickActions from "../../components/QuickActions";

import SmoothLineChart from "../../components/charts/SmoothLineChart";
import ConversionFunnel from "../../components/ConversionFunnel";
import FunnelChart from "../../components/charts/FunnelChart";

import RecentActivities from "../../components/RecentActivities";
import UpcomingFollowups from "../../components/UpcomingFollowups";

// ⭐ NEW WIDGETS
import SupportTickets from "../../components/SupportTickets";
import PlanPerformance from "../../components/PlanPerformance";
import UpcomingRenewals from "../../components/UpcomingRenewals";

import { reportApi, invoiceApi, ticketApi } from "../../api";
import { formatCurrency } from "../../utils/formatters";

import usePermission from "../../hooks/usePermission";

const Dashboard = () => {
  const navigate = useNavigate();
  const { can } = usePermission();

  // Permissions
  const canInquiries = can("inquiry:view");
  const canClients = can("client:view");
  const canPayments = can("payment:view");
  const canPlans = can("plan:view");
  const canInvoices = can("invoice:view");
  const canTickets = can("ticket:view");

  const canRevenueChart = can("report:view");
  const canClientChart = can("client:view");

  const canQuickActions = can("inquiry:create");

  // States
  const [overview, setOverview] = useState({});
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [clientTrend, setClientTrend] = useState([]);

  const isThisMonth = (d) => {
    const date = new Date(d);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const isLastMonth = (d) => {
    const date = new Date(d);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() - 1;
  };

  const calcTrend = (current, last) => {
    const c = Number(current) || 0;
    const l = Number(last) || 0;
    if (l === 0) return c === 0 ? "0%" : "+100%";
    const diff = ((c - l) / l) * 100;
    return diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [
          { overview },
          paymentsReport,
          clientsReport,
          invoiceRes,
          ticketRes
        ] = await Promise.all([
          reportApi.getOverview(),
          reportApi.getPaymentsReport({ groupBy: "month" }),
          reportApi.getClientsReport(),
          invoiceApi.getInvoices(),
          ticketApi.getTickets()
        ]);

        setOverview(overview || {});

        // Revenue Trend
        setRevenueTrend(
          paymentsReport?.byDate?.map((i) => ({
            label: i.period,
            value: Number(i.totalAmount) || 0
          })) || []
        );

        // Client Funnel
        setClientTrend(
          clientsReport?.byStatus?.map((i) => ({
            label: i.status,
            value: Number(i.count) || 0
          })) || []
        );

        // Pending invoice trends
        const pending = invoiceRes.invoices.filter(
          (i) => i.paymentStatus === "Pending" || i.paymentStatus === "Partial"
        );

        const pendingThis = pending.filter((i) => isThisMonth(i.invoiceDate)).length;
        const pendingLast = pending.filter((i) => isLastMonth(i.invoiceDate)).length;

        // Ticket trends
        const openT = ticketRes.tickets.filter(
          (t) => t.status === "Open" || t.status === "In Progress"
        );

        const openThis = openT.filter((t) => isThisMonth(t.openedDate)).length;
        const openLast = openT.filter((t) => isLastMonth(t.openedDate)).length;

        setOverview((prev) => ({
          ...prev,
          pendingPayments: pending.length,
          openSupportTickets: openT.length,
          pendingPaymentsTrend: calcTrend(pendingThis, pendingLast),
          openTicketsTrend: calcTrend(openThis, openLast)
        }));
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  // Summary Cards
  const cards = [
    canInquiries && {
      label: "Total Inquiries",
      value: overview.totalInquiries || 0,
      icon: "bi-chat-square-text",
      trend: calcTrend(overview.currentMonthInquiries, overview.lastMonthInquiries),
      trendLabel: "vs last month",
      to: "/inquiries"
    },

    canClients && {
      label: "Active Clients",
      value: overview.totalClients || 0,
      icon: "bi-people",
      trend: calcTrend(overview.currentMonthClients, overview.lastMonthClients),
      trendLabel: "vs last month",
      to: "/clients"
    },

    canPayments && {
      label: "Revenue (This month)",
      value: formatCurrency(overview.totalPayments || 0, "INR"),
      icon: "bi-currency-rupee",
      trend: calcTrend(overview.currentMonthPayments, overview.lastMonthPayments),
      trendLabel: "vs last month",
      to: "/payments"
    },

    canPlans && {
      label: "Active Plans",
      value: overview.activePlans || 0,
      icon: "bi-diagram-3-fill",
      trend: calcTrend(overview.currentMonthPlans, overview.lastMonthPlans),
      trendLabel: "vs last month",
      to: "/plans"
    },

    canInvoices && {
      label: "Pending Payments",
      value: overview.pendingPayments || 0,
      icon: "bi-hourglass-split",
      trend: overview.pendingPaymentsTrend,
      trendLabel: "vs last month",
      to: "/payments"
    },

    canTickets && {
      label: "Open Support Tickets",
      value: overview.openSupportTickets || 0,
      icon: "bi-life-preserver",
      trend: overview.openTicketsTrend,
      trendLabel: "vs last month",
      to: "/tickets"
    }
  ].filter(Boolean);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted mb-0">Welcome to your Total Management System</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid mb-4">
        {cards.map((card, i) => (
          <SummaryCard
            key={card.label}
            title={card.label}
            value={card.value}
            trend={card.trend}
            trendLabel={card.trendLabel}
            icon={card.icon}
            colorIndex={i}
            clickable={!!card.to}
            onClick={() => navigate(card.to)}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
  {/* LEFT SIDE: LARGE FUNNEL */}
  <div className="col-lg-7">
    <ConversionFunnel />
  </div>

  {/* RIGHT SIDE: CLIENT FUNNEL */}
  {canClientChart && (
    <div className="col-lg-5">
      <FunnelChart
        title="Client Status Funnel"
        data={clientTrend}
        colors={["#2563eb", "#22c55e", "#facc15", "#ef4444"]}
      />
    </div>
  )}
</div>

      {/* ⭐ Support + Plan + Renewals */}
      <div className="row g-4 mb-4">
        {can("ticket:view") && (
          <div className="col-lg-4">
            <SupportTickets />
          </div>
        )}

        {can("plan:view") && (
          <div className="col-lg-4">
            <PlanPerformance />
          </div>
        )}

        {can("renewal:view") && (
          <div className="col-lg-4">
            <UpcomingRenewals />
          </div>
        )}
      </div>

      {/* Recent Activities + Upcoming Followups */}
      {(can("audit:view") || can("inquiry:view")) && (
        <div className="row g-4 mb-4">
          {can("audit:view") && (
            <div className="col-lg-6">
              <RecentActivities />
            </div>
          )}

          {(can("inquiry:view") || can("inquiry:followup")) && (
            <div className="col-lg-6">
              <UpcomingFollowups />
            </div>
          )}
        </div>
      )}

      {canQuickActions && (
        <div className="mb-4">
          <QuickActions />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
