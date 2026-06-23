"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import RecentRfqsTable from "../user/RecentRfqsTable";
import SectionCard from "../user/SectionCard";
import type { RecentRfq } from "../user/userDashboardData";
import PublicRfqDetailsModal from "./PublicRfqDetailsModal";
import type { PublicRfqDetails } from "./PublicRfqDetailsModal";

type ApiRfq = PublicRfqDetails;

const formatStatus = (status: ApiRfq["status"]): RecentRfq["status"] =>
  `${status.charAt(0)}${status.slice(1).toLowerCase()}` as RecentRfq["status"];

export default function PublicProfileRfqs() {
  const [rfqs, setRfqs] = useState<ApiRfq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedRfq, setSelectedRfq] = useState<ApiRfq | null>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get<ApiRfq[]>("/rfqs/")
      .then(({ data }) => {
        if (isMounted) setRfqs(data);
      })
      .catch(() => {
        if (isMounted) setLoadError("Unable to load RFQs. Please refresh the page.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const recentRfqs = useMemo<RecentRfq[]>(
    () =>
      [...rfqs]
        .sort(
          (first, second) =>
            new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
        )
        .slice(0, 4)
        .map((rfq) => ({
          id: rfq.rfq_id,
          product: rfq.product_name || "Custom RFQ",
          sourcing: rfq.product_type === "INTERNATIONAL" ? "International" : "Domestic",
          quantity: `${rfq.quantity_required.toLocaleString()} ${rfq.unit_name}`,
          status: formatStatus(rfq.status),
          date: new Date(rfq.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        })),
    [rfqs],
  );

  return (
    <>
      <SectionCard title="Recent RFQs">
        {isLoading ? (
          <p className="py-[8%] text-center text-sm text-[#6b7280]">Loading RFQs...</p>
        ) : loadError ? (
          <p className="py-[8%] text-center text-sm font-semibold text-red-600">{loadError}</p>
        ) : recentRfqs.length > 0 ? (
          <RecentRfqsTable
            onView={(rfq) => {
              setSelectedRfq(rfqs.find((item) => item.rfq_id === rfq.id) || null);
            }}
            rfqs={recentRfqs}
          />
        ) : (
          <p className="py-[8%] text-center text-sm text-[#6b7280]">No RFQs found.</p>
        )}
      </SectionCard>
      <PublicRfqDetailsModal onClose={() => setSelectedRfq(null)} rfq={selectedRfq} />
    </>
  );
}
