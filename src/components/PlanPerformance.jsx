// src/components/PlanPerformance.jsx
import { useEffect, useState } from "react";
import { getPlans } from "../api/plans"; // adjust according to your structure
import usePermission from "../hooks/usePermission";
import DonutChart from "./charts/DonutChart";

const PlanPerformance = () => {
  const { can } = usePermission();
  const canView = can("plan:view");

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!canView) return;

    const load = async () => {
      try {
        const res = await getPlans();
        const plans = res.plans || [];

        // Count types
        const counts = {
          Tender: 0,
          GEM: 0,
          DC: 0,
          Other: 0,
        };

        plans.forEach((p) => {
          if (counts[p.planType] !== undefined) {
            counts[p.planType] += 1;
          } else {
            counts.Other += 1;
          }
        });

        // Convert to donut chart data
        const result = [
          { label: "Tender Services", value: counts["Tender"] },
          { label: "GEM Portal", value: counts["GEM"] },
          { label: "DC Registration", value: counts["DC"] },
          { label: "Other", value: counts["Other"] },
        ];

        setData(result.filter((d) => d.value > 0)); // remove 0 values
      } catch (err) {
        console.error("Plan Performance load failed", err);
      }
    };

    load();
  }, [canView]);

  if (!canView) return null;

  return (
    <div
      className="summary-card"
      style={{
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        height: "100%",
      }}
    >
      <h5 className="fw-bold mb-3">Plan Performance</h5>

      <DonutChart
        title=""
        data={data}
        colors={["#2563eb", "#22c55e", "#f59e0b", "#6b7280"]} // blue, green, yellow, gray
      />

      {/* Legend */}
      <div className="mt-3">
        {data.map((item) => (
          <div className="d-flex justify-content-between small mb-1" key={item.label}>
            <span>{item.label}</span>
            <span className="fw-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanPerformance;
