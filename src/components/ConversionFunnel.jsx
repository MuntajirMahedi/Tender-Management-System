import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  Cell,
} from "recharts";

import { inquiryApi, clientApi } from "../api";
import { getUpcomingRenewals } from "../api/renewals";
import usePermission from "../hooks/usePermission";

const ConversionFunnel = () => {
  const { can } = usePermission();

  const canInquiries = can("inquiry:view");
  const canClients = can("client:view");
  const canRenewals = can("renewal:view");

  const [funnelData, setFunnelData] = useState([]);

  useEffect(() => {
    if (!canInquiries && !canClients && !canRenewals) return;

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

        if (canInquiries) {
          temp.push({
            name: "Total Inquiries",
            value: inquiries.length,
            fill: "#1E40AF",
          });

          const prospects = inquiries.filter((i) => i.status === "Prospect").length;
          temp.push({
            name: "Prospects",
            value: prospects,
            fill: "#2563EB",
          });
        }

        if (canClients) {
          temp.push({
            name: "Total Clients",
            value: clients.length,
            fill: "#3B82F6",
          });

          const activeClients = clients.filter((c) => c.status === "Active").length;
          temp.push({
            name: "Active Clients",
            value: activeClients,
            fill: "#60A5FA",
          });
        }

        if (canRenewals) {
          temp.push({
            name: "Upcoming Renewals",
            value: renewals.length,
            fill: "#93C5FD",
          });
        }

        setFunnelData(temp);
      } catch (err) {
        console.error("Funnel Load Error:", err);
      }
    };

    load();
  }, [canInquiries, canClients, canRenewals]);

  if (funnelData.length === 0) return null;

  return (
    <div
      className="summary-card"
      style={{
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between mb-2">
        <h5 className="fw-bold">Conversion Funnel</h5>

        <span
          style={{
            background: "#f1f5f9",
            color: "#475569",
            padding: "4px 12px",
            fontSize: "12px",
            borderRadius: "12px",
            fontWeight: 600,
          }}
        >
          Live
        </span>
      </div>

      {/* RECHARTS FUNNEL — EXACT DESIGN */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <FunnelChart>
            <Tooltip />

            <Funnel dataKey="value" data={funnelData} isAnimationActive>
              <LabelList
                dataKey="name"
                position="center"
                fill="#fff"
                stroke="none"
                style={{ fontWeight: "600" }}
              />

              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConversionFunnel;
