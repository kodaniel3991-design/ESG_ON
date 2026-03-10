"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { VendorEsgScore } from "@/types";
import { RiskBadge } from "./risk-badge";

export function EsgScoreCard(props: { item: VendorEsgScore }) {
  const item = props.item;
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <p className="text-sm font-medium text-muted-foreground">{item.vendorName}</p>
        <RiskBadge level={item.riskLevel} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{item.overallScore}</span>
          <span className="text-sm text-muted-foreground">종합</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><span className="text-muted-foreground">환경</span> {item.environmentScore}</div>
          <div><span className="text-muted-foreground">사회</span> {item.socialScore}</div>
          <div><span className="text-muted-foreground">거버넌스</span> {item.governanceScore}</div>
        </div>
        <p className="text-xs text-muted-foreground">기준일: {item.lastUpdated}</p>
      </CardContent>
    </Card>
  );
}
