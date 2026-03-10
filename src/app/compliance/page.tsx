"use client";

import { useQuery } from "@tanstack/react-query";
import { getComplianceStatus } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck } from "lucide-react";

function statusVariant(
  status: string
): "success" | "warning" | "danger" | "secondary" {
  switch (status) {
    case "compliant":
      return "success";
    case "partial":
      return "warning";
    case "non_compliant":
      return "danger";
    default:
      return "secondary";
  }
}

export default function ComplianceStatusPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["compliance"],
    queryFn: getComplianceStatus,
  });

  return (
    <>
      <PageHeader
        title="Compliance Status"
        description="Regulatory and voluntary framework alignment."
      />

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Framework requirements</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Current status per requirement; update when assessments are
              completed.
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0"
                  >
                    <div>
                      <p className="font-medium">{item.framework}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.requirement}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due {item.dueDate}
                        </span>
                      )}
                      <Badge variant={statusVariant(item.status)}>
                        {item.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Checked {item.lastChecked}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
