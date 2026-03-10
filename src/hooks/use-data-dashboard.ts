"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getEnvironmentSummary,
  getSocialSummary,
  getGovernanceSummary,
  getScopeBreakdown,
  getSubmissions,
} from "@/services/api";
import { queryKeys } from "@/lib/query-keys";

export function useDataDashboard() {
  const envSummaryQuery = useQuery({
    queryKey: queryKeys.data.esgEnvironmentSummary,
    queryFn: getEnvironmentSummary,
  });
  const socialSummaryQuery = useQuery({
    queryKey: queryKeys.data.esgSocialSummary,
    queryFn: getSocialSummary,
  });
  const govSummaryQuery = useQuery({
    queryKey: queryKeys.data.esgGovernanceSummary,
    queryFn: getGovernanceSummary,
  });
  const scopeBreakdownQuery = useQuery({
    queryKey: queryKeys.data.scopeBreakdown,
    queryFn: getScopeBreakdown,
  });
  const submissionsQuery = useQuery({
    queryKey: queryKeys.data.submissions,
    queryFn: getSubmissions,
  });

  const esgLoading =
    envSummaryQuery.isLoading ||
    socialSummaryQuery.isLoading ||
    govSummaryQuery.isLoading;

  return {
    envSummaryQuery,
    socialSummaryQuery,
    govSummaryQuery,
    scopeBreakdownQuery,
    submissionsQuery,
    esgLoading,
  };
}

