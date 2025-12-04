import { useEffect, useState } from "react";
import { reportApi } from "../../api";
import PageHeader from "../../components/PageHeader";

import RoundedBarChart from "../../components/charts/RoundedBarChart";
import SmoothLineChart from "../../components/charts/SmoothLineChart";
import DonutChart from "../../components/charts/FunnelChart";
import AreaChartCard from "../../components/charts/AreaChartCard";

const Reports = () => {
  const [inquiriesReport, setInquiriesReport] = useState({ byStatus: [] });
  const [clientsReport, setClientsReport] = useState({ byStatus: [] });
  const [paymentsReport, setPaymentsReport] = useState({ byDate: [] });
  const [ticketsReport, setTicketsReport] = useState({ byStatus: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [
          inquiries,
          clients,
          payments,
          tickets
        ] = await Promise.all([
          reportApi.getInquiriesReport(),
          reportApi.getClientsReport(),
          reportApi.getPaymentsReport({ groupBy: "month" }),
          reportApi.getTicketsReport()
        ]);

        setInquiriesReport(inquiries || { byStatus: [] });
        setClientsReport(clients || { byStatus: [] });
        setPaymentsReport(payments || { byDate: [] });
        setTicketsReport(tickets || { byStatus: [] });

      } catch (error) {
        console.error("Failed to load reports", error);
      }
    };

    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Centralized analytics across modules"
      />

      <div className="row g-4">

        {/* Inquiries */}
        <div className="col-lg-6">
          <RoundedBarChart
            title="Inquiries by Status"
            data={(inquiriesReport.byStatus || []).map(item => ({
              label: item.status,
              value: item.count
            }))}
            color="#4f46e5"
          />
        </div>

        {/* Clients */}
        <div className="col-lg-6">
          <DonutChart
            title="Clients by Status"
            data={(clientsReport.byStatus || []).map(item => ({
              label: item.status,
              value: item.count
            }))}
            colors={["#8b5cf6", "#2563eb", "#22c55e", "#f43f5e"]}
          />
        </div>

        {/* Payments Trend */}
        <div className="col-lg-12">
          <SmoothLineChart
            title="Payment Collection Trend"
            data={(paymentsReport.byDate || []).map(item => ({
              label: item.period,
              value: item.totalAmount
            }))}
            color="#22c55e"
          />
        </div>

        {/* Tickets */}
        <div className="col-lg-12">
          <AreaChartCard
            title="Tickets by Status"
            data={(ticketsReport.byStatus || []).map(item => ({
              label: item.status,
              value: item.count
            }))}
            color="#f97316"
          />
        </div>

      </div>
    </div>
  );
};

export default Reports;
