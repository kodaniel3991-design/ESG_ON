export const queryKeys = {
  kpi: {
    summary: ["kpi-summary"] as const,
    list: ["kpi-list"] as const,
  },
  data: {
    esgEnvironmentSummary: ["esg-environment-summary"] as const,
    esgSocialSummary: ["esg-social-summary"] as const,
    esgGovernanceSummary: ["esg-governance-summary"] as const,
    scopeBreakdown: ["scope-breakdown"] as const,
    submissions: ["portal-submissions"] as const,
  },
  dashboard: {
    kpis: ["dashboard-kpis"] as const,
    trend: ["dashboard-trend"] as const,
    scopeDonut: ["scope-donut"] as const,
    offsetSummary: ["offset-summary"] as const,
    topVendors: ["top-vendors"] as const,
    insights: ["dashboard-insights"] as const,
    notifications: ["dashboard-notifications"] as const,
  },
} as const;

