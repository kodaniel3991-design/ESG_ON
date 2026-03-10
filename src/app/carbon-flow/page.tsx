"use client";

import { useQuery } from "@tanstack/react-query";
import { getCarbonFlowTree } from "@/services/api";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMtCO2e } from "@/lib/utils";
import type { CarbonFlowNode } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Building2, Folder, Activity } from "lucide-react";

function FlowNode({ node, depth = 0 }: { node: CarbonFlowNode; depth?: number }) {
  const Icon =
    node.type === "organization"
      ? Building2
      : node.type === "category"
        ? Folder
        : Activity;

  return (
    <div className="border-l border-border pl-4" style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center gap-2 py-2">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="font-medium">{node.name}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {formatMtCO2e(node.value)}
        </span>
      </div>
      {node.children?.length ? (
        <div className="space-y-0">
          {node.children.map((child) => (
            <FlowNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CarbonFlowPage() {
  const { data: tree, isLoading } = useQuery({
    queryKey: ["carbon-flow"],
    queryFn: getCarbonFlowTree,
  });

  return (
    <>
      <PageHeader
        title="Carbon Flow"
        description="Hierarchical view of emissions from organization down to activities."
      />

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emission hierarchy</CardTitle>
            <p className="text-sm text-muted-foreground">
              Drill from organization → scope/category → activity
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : tree ? (
              <FlowNode node={tree} />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
