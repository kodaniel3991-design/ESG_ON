"use client";

import dynamic from "next/dynamic";
import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";
import { TopVendorsTable } from "@/components/dashboard/top-vendors-table";
import { DashboardInsightsCard } from "@/components/dashboard/dashboard-insights-card";
import { NotificationsCard } from "@/components/dashboard/notifications-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const CarbonFootprintChart = dynamic(
  () =>
    import("@/components/dashboard/carbon-footprint-chart").then((m) => ({
      default: m.CarbonFootprintChart,
    })),
  { ssr: false, loading: () => <Skeleton className="h-52 w-full rounded-lg" /> }
);

const ScopeDonutChart = dynamic(
  () =>
    import("@/components/dashboard/scope-donut-chart").then((m) => ({
      default: m.ScopeDonutChart,
    })),
  { ssr: false, loading: () => <Skeleton className="h-52 w-full rounded-lg" /> }
);

const OffsetDonutChart = dynamic(
  () =>
    import("@/components/dashboard/offset-donut-chart").then((m) => ({
      default: m.OffsetDonutChart,
    })),
  { ssr: false, loading: () => <Skeleton className="h-52 w-full rounded-lg" /> }
);

export function DashboardContent() {
  const {
    kpisQuery,
    trendQuery,
    scopeDonutQuery,
    offsetSummaryQuery,
    topVendorsQuery,
    insightsQuery,
    notificationsQuery,
  } = useDashboardData();

  const kpis = kpisQuery.data;
  const kpisLoading = kpisQuery.isLoading;
  const trendData = trendQuery.data;
  const trendLoading = trendQuery.isLoading;
  const scopeDonutData = scopeDonutQuery.data;
  const scopeDonutLoading = scopeDonutQuery.isLoading;
  const offsetSummary = offsetSummaryQuery.data;
  const offsetLoading = offsetSummaryQuery.isLoading;
  const topVendors = topVendorsQuery.data;
  const vendorsLoading = topVendorsQuery.isLoading;
  const insights = insightsQuery.data;
  const insightsLoading = insightsQuery.isLoading;
  const notifications = notificationsQuery.data;
  const notificationsLoading = notificationsQuery.isLoading;

  return (
    <div className="grid flex-1 min-h-0 grid-rows-[auto_1fr_1fr] gap-3">
      <section className="shrink-0">
        {kpisLoading ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[7rem] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 lg:grid-rows-[7rem]">
            {kpis?.map((item) => (
              <DashboardKpiCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="flex min-h-0 flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-[2]">
          <CarbonFootprintChart
            data={trendData ?? []}
            totalLabel="1,248 tCO₂e"
            isLoading={trendLoading}
            fillHeight
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-1">
          <ScopeDonutChart
            data={scopeDonutData ?? []}
            totalLabel="1,248 tCO₂e"
            isLoading={scopeDonutLoading}
            fillHeight
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-1">
          <OffsetDonutChart
            data={
              offsetSummary ?? {
                totalEmissionsT: 0,
                offsetT: 0,
              }
            }
            isLoading={offsetLoading}
            fillHeight
          />
        </div>
      </section>

      <section className="grid min-h-0 gap-3 lg:grid-cols-3">
        <div className="min-h-0 overflow-hidden">
          <TopVendorsTable data={topVendors ?? []} isLoading={vendorsLoading} fillHeight />
        </div>
        <div className="min-h-0 overflow-hidden">
          <DashboardInsightsCard
            items={insights ?? []}
            isLoading={insightsLoading}
            fillHeight
          />
        </div>
        <div className="min-h-0 overflow-hidden">
          <NotificationsCard
            items={notifications ?? []}
            isLoading={notificationsLoading}
            fillHeight
          />
        </div>
      </section>
    </div>
  );
}
