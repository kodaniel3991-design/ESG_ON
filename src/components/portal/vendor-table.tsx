"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PortalVendor } from "@/types";
import { RiskBadge } from "./risk-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<PortalVendor["status"], string> = {
  active: "연동됨",
  invited: "초대됨",
  pending: "대기",
  suspended: "중단",
};

const SUBMISSION_LABEL: Record<PortalVendor["submissionStatus"], string> = {
  not_started: "미시작",
  in_progress: "진행중",
  submitted: "제출됨",
  verified: "검증완료",
  rejected: "반려",
};

interface VendorTableProps {
  vendors: PortalVendor[];
  isLoading?: boolean;
  onInvite?: (vendor: PortalVendor) => void;
  onResendInvite?: (vendor: PortalVendor) => void;
}

export function VendorTable({
  vendors,
  isLoading,
  onInvite,
  onResendInvite,
}: VendorTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PortalVendor["status"] | "">("");
  const [riskFilter, setRiskFilter] = useState<PortalVendor["riskLevel"] | "">("");

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || v.status === statusFilter;
      const matchRisk = !riskFilter || v.riskLevel === riskFilter;
      return matchSearch && matchStatus && matchRisk;
    });
  }, [vendors, search, statusFilter, riskFilter]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">협력사 목록</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-64 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">협력사 목록</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="검색 (이름, 이메일)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 rounded-md border border-input bg-transparent pl-8 pr-3 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PortalVendor["status"] | "")}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">상태 전체</option>
            {(Object.entries(STATUS_LABEL) as [PortalVendor["status"], string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as PortalVendor["riskLevel"] | "")}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">리스크 전체</option>
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
            <option value="critical">심각</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">협력사</th>
                <th className="px-4 py-3 font-medium">이메일</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">제출</th>
                <th className="px-4 py-3 font-medium">리스크</th>
                <th className="px-4 py-3 font-medium">ESG</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">{STATUS_LABEL[v.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">T{v.tier}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        v.submissionStatus === "verified"
                          ? "success"
                          : v.submissionStatus === "submitted"
                            ? "warning"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {SUBMISSION_LABEL[v.submissionStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3"><RiskBadge level={v.riskLevel} /></td>
                  <td className="px-4 py-3">{v.esgScore != null ? `${v.esgScore}점` : "—"}</td>
                  <td className="px-4 py-3">
                    {v.status === "pending" && onInvite && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => onInvite(v)}>
                        <Send className="h-3.5 w-3.5" /> 초대
                      </Button>
                    )}
                    {v.status === "invited" && onResendInvite && (
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => onResendInvite(v)}>
                        <RefreshCw className="h-3.5 w-3.5" /> 재발송
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          총 {filtered.length}건 (전체 {vendors.length}건)
        </p>
      </CardContent>
    </Card>
  );
}
