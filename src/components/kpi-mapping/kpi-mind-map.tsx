"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Position,
  Handle,
  type NodeProps,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import {
  Database,
  Leaf,
  Users,
  Scale,
  Flame,
  FileSpreadsheet,
  Zap,
  Building2,
  Truck,
  ClipboardList,
  Maximize2,
  Minimize2,
  X,
  type LucideIcon,
} from "lucide-react";

/* ── 타입 ── */
export interface DataSourceNode {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export interface KpiLeafNode {
  id: string;
  code: string;
  name: string;
  domain: "E" | "S" | "G" | "C";
  unit: string;
  status?: "linked" | "partial" | "missing";
}

export interface MindMapLink {
  sourceId: string;
  kpiId: string;
}

export interface KpiMindMapProps {
  dataSources: DataSourceNode[];
  kpis: KpiLeafNode[];
  links: MindMapLink[];
}

/* ── 도메인 색상 ── */
const DOMAIN_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  E: { bg: "bg-green-50", text: "text-carbon-success", border: "border-green-200", label: "환경" },
  S: { bg: "bg-navy-50", text: "text-navy-400", border: "border-navy-200", label: "사회" },
  G: { bg: "bg-taupe-50", text: "text-taupe-400", border: "border-taupe-200", label: "거버넌스" },
  C: { bg: "bg-green-50", text: "text-carbon-success", border: "border-green-200", label: "탄소" },
};

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  E: Leaf,
  S: Users,
  G: Scale,
  C: Flame,
};

/* ── 커스텀 노드: 데이터 소스 (중앙) ── */
function DataSourceNodeComponent({ data }: NodeProps) {
  const Icon = (data.icon as LucideIcon) || Database;
  return (
    <div className="group relative">
      <Handle type="target" position={Position.Top} className="!bg-primary !border-primary !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-primary !w-2 !h-2" />
      <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-card px-6 py-4 shadow-md transition-shadow hover:shadow-lg min-w-[200px]">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">{data.label as string}</p>
          {data.description ? (
            <p className="text-xs text-muted-foreground">{String(data.description)}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── 커스텀 노드: KPI (리프) ── */
function KpiNodeComponent({ data }: NodeProps) {
  const domain = (data.domain as string) || "E";
  const style = DOMAIN_STYLES[domain] || DOMAIN_STYLES.E;
  const DomainIcon = DOMAIN_ICONS[domain] || Leaf;
  const status = data.status as string | undefined;

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !border-muted-foreground !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !border-muted-foreground !w-2 !h-2" />
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-5 py-3 shadow-sm transition-all hover:shadow-md w-[250px]",
          style.border,
          status === "missing" ? "bg-destructive/10 border-dashed" : "bg-card"
        )}
      >
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", style.bg)}>
          <DomainIcon className={cn("h-4 w-4", style.text)} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("text-xs font-semibold rounded px-1.5 py-0.5", style.bg, style.text)}>
              {domain}
            </span>
            <span className="text-sm font-semibold text-foreground truncate">
              {data.label as string}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {data.code as string} · {data.unit as string}
          </p>
        </div>
        {status === "missing" && (
          <span className="ml-auto text-[10px] font-medium text-carbon-danger">누락</span>
        )}
      </div>
    </div>
  );
}

/* ── 커스텀 노드: 도메인 그룹 라벨 ── */
function DomainLabelNode({ data }: NodeProps) {
  const domain = (data.domain as string) || "E";
  const style = DOMAIN_STYLES[domain] || DOMAIN_STYLES.E;
  return (
    <div className={cn("rounded-full px-4 py-1.5 text-sm font-bold", style.bg, style.text)}>
      {style.label}
    </div>
  );
}

const nodeTypes = {
  dataSource: DataSourceNodeComponent,
  kpi: KpiNodeComponent,
  domainLabel: DomainLabelNode,
};

/* ── 레이아웃 계산 ── */
function buildFlowData(
  dataSources: DataSourceNode[],
  kpis: KpiLeafNode[],
  links: MindMapLink[]
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // ── 데이터 소스 노드: 상단 가로 배치 ──
  const sourceWidth = 240;
  const sourceGap = 16;
  const totalSourceWidth = dataSources.length * sourceWidth + (dataSources.length - 1) * sourceGap;
  const sourceStartX = 0;

  dataSources.forEach((ds, i) => {
    nodes.push({
      id: ds.id,
      type: "dataSource",
      position: { x: sourceStartX + i * (sourceWidth + sourceGap), y: 0 },
      data: { label: ds.label, description: ds.description, icon: ds.icon },
    });
  });

  // ── KPI 노드: 하단 가로 배치 (도메인별 행) ──
  const domainGroups: Record<string, KpiLeafNode[]> = {};
  kpis.forEach((kpi) => {
    if (!domainGroups[kpi.domain]) domainGroups[kpi.domain] = [];
    domainGroups[kpi.domain].push(kpi);
  });

  const kpiWidth = 270;
  const kpiGapX = 12;
  const domainGapY = 90;
  const domainOrder = ["C", "E", "S", "G"];
  let currentY = 140; // 데이터 소스 아래 간격

  domainOrder.forEach((domain) => {
    const group = domainGroups[domain];
    if (!group || group.length === 0) return;

    // 도메인 라벨 (행 왼쪽)
    nodes.push({
      id: `domain-${domain}`,
      type: "domainLabel",
      position: { x: -80, y: currentY + 12 },
      data: { domain },
      selectable: false,
      draggable: false,
    });

    // KPI 노드를 가로로 배치
    group.forEach((kpi, i) => {
      nodes.push({
        id: kpi.id,
        type: "kpi",
        position: { x: i * (kpiWidth + kpiGapX), y: currentY },
        data: {
          label: kpi.name,
          code: kpi.code,
          domain: kpi.domain,
          unit: kpi.unit,
          status: kpi.status,
        },
      });
    });

    currentY += domainGapY;
  });

  // 데이터 소스 행을 KPI 전체 너비 기준 중앙 정렬
  const maxKpiRowWidth = Math.max(
    ...domainOrder.map((d) => {
      const g = domainGroups[d];
      return g ? g.length * (kpiWidth + kpiGapX) - kpiGapX : 0;
    })
  );
  const centerOffset = (maxKpiRowWidth - totalSourceWidth) / 2;
  if (centerOffset > 0) {
    nodes.forEach((n) => {
      if (n.type === "dataSource") {
        n.position.x += centerOffset;
      }
    });
  }

  // 엣지 생성 — 데이터 소스별 색상으로 구분
  const sourceColors: Record<string, string> = {
    "ds-employee": "#7c6f64",   // taupe
    "ds-energy": "#879a77",     // green
    "ds-facility": "#8a6e62",   // taupe-400
    "ds-supply": "#bfa091",     // taupe-300
    "ds-board": "#6e8060",      // green-500
    "ds-waste": "#c9ad93",      // beige
  };

  links.forEach((link, i) => {
    const kpi = kpis.find((k) => k.id === link.kpiId);
    const color = sourceColors[link.sourceId] || "hsl(var(--border))";
    edges.push({
      id: `e-${i}`,
      source: link.sourceId,
      target: link.kpiId,
      type: "default",
      animated: kpi?.status === "missing",
      style: {
        stroke: color,
        strokeWidth: 1.5,
        opacity: 0.55,
        strokeDasharray: kpi?.status === "missing" ? "5 5" : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
        width: 12,
        height: 12,
      },
    });
  });

  return { nodes, edges };
}

/* ── 메인 컴포넌트 ── */
export function KpiMindMap({ dataSources, kpis, links }: KpiMindMapProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes: allNodes, edges: allEdges } = useMemo(
    () => buildFlowData(dataSources, kpis, links),
    [dataSources, kpis, links]
  );

  // 선택된 노드에 연결된 항목만 하이라이트
  const { nodes, edges } = useMemo(() => {
    if (!selectedNodeId) return { nodes: allNodes, edges: allEdges };

    // 선택 노드와 연결된 엣지 찾기
    const connectedEdges = allEdges.filter(
      (e) => e.source === selectedNodeId || e.target === selectedNodeId
    );
    const connectedNodeIds = new Set<string>([selectedNodeId]);
    connectedEdges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    const styledNodes = allNodes.map((n) => ({
      ...n,
      style: {
        ...n.style,
        opacity: connectedNodeIds.has(n.id) || n.type === "domainLabel" ? 1 : 0.15,
        transition: "opacity 0.3s ease",
      },
    }));

    const styledEdges = allEdges.map((e) => {
      const isConnected = connectedEdges.some((ce) => ce.id === e.id);
      return {
        ...e,
        style: {
          ...e.style,
          opacity: isConnected ? 0.85 : 0.05,
          strokeWidth: isConnected ? 2 : 1,
          transition: "opacity 0.3s ease",
        },
      };
    });

    return { nodes: styledNodes, edges: styledEdges };
  }, [allNodes, allEdges, selectedNodeId]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "domainLabel") return;
      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const [fullscreen, setFullscreen] = useState(false);

  const flowContent = (
    <>
      {selectedNodeId && (
        <button
          onClick={() => setSelectedNodeId(null)}
          className="absolute top-3 right-3 z-10 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          전체 보기
        </button>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
      >
        <Background gap={20} size={1} color="hsl(var(--border))" />
        {/* 컨트롤 바 — 개별 박스 가로 정렬 */}
        <div className="react-flow__panel top-left">
          <div className="flex items-center">
            <Controls
              showInteractive={false}
              orientation="horizontal"
              className="!static !shadow-none !border-0 !bg-transparent !flex-row !gap-0 !p-0 !m-0 [&>button]:!bg-card [&>button]:!border [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted [&>button]:!rounded-md [&>button]:!shadow-sm [&>button]:!m-0 [&>button]:!ml-[6px] first:[&>button]:!ml-0"
            />
            <button
              onClick={() => setFullscreen((p) => !p)}
              className="ml-[6px] flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm hover:bg-muted transition-colors"
              title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </ReactFlow>
    </>
  );

  // 전체화면 모달
  if (fullscreen) {
    return (
      <>
        {/* 빈 placeholder */}
        <div className="h-[calc(100vh-480px)] min-h-[300px] w-full rounded-xl border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
          전체화면 모드로 표시 중
        </div>
        {/* 풀스크린 오버레이 */}
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setFullscreen(false)} />
        <div className="fixed inset-4 z-50 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setFullscreen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
              title="Close"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>
          {flowContent}
        </div>
      </>
    );
  }

  return (
    <div className="h-[calc(100vh-480px)] min-h-[300px] w-full rounded-xl border border-border bg-card overflow-hidden relative">
      {flowContent}
    </div>
  );
}

/* ── 기본 목업 데이터 ── */
export const MOCK_DATA_SOURCES: DataSourceNode[] = [
  { id: "ds-employee", label: "직원명부", description: "HR 시스템 연동", icon: Users },
  { id: "ds-energy", label: "에너지 사용량", description: "KEPCO API / IoT", icon: Zap },
  { id: "ds-facility", label: "사업장 데이터", description: "사업장별 배출 관리", icon: Building2 },
  { id: "ds-supply", label: "공급망 데이터", description: "Supplier Portal", icon: Truck },
  { id: "ds-board", label: "이사회 운영 자료", description: "법무팀 / 정기보고", icon: ClipboardList },
  { id: "ds-waste", label: "폐기물 관리 대장", description: "Excel / 관리시스템", icon: FileSpreadsheet },
];

export const MOCK_KPI_NODES: KpiLeafNode[] = [
  // Carbon
  { id: "kpi-ghg", code: "CARBON-01", name: "총 GHG 배출량", domain: "C", unit: "tCO₂e", status: "linked" },
  { id: "kpi-scope3", code: "CARBON-02", name: "Scope 3 비율", domain: "C", unit: "%", status: "linked" },
  { id: "kpi-reduction", code: "CARBON-03", name: "2030 감축 달성률", domain: "C", unit: "%", status: "partial" },
  // Environment
  { id: "kpi-energy", code: "ENV-01", name: "에너지 사용량", domain: "E", unit: "GWh", status: "linked" },
  { id: "kpi-renewable", code: "ENV-02", name: "재생에너지 비율", domain: "E", unit: "%", status: "linked" },
  { id: "kpi-recycle", code: "ENV-03", name: "폐기물 재활용률", domain: "E", unit: "%", status: "linked" },
  { id: "kpi-water", code: "ENV-04", name: "물 사용량", domain: "E", unit: "천 m³", status: "missing" },
  // Social
  { id: "kpi-employees", code: "SOCIAL-01", name: "총 직원 수", domain: "S", unit: "명", status: "linked" },
  { id: "kpi-training", code: "SOCIAL-02", name: "교육 이수율", domain: "S", unit: "%", status: "linked" },
  { id: "kpi-safety", code: "SOCIAL-03", name: "재해율", domain: "S", unit: "%", status: "linked" },
  { id: "kpi-turnover", code: "SOCIAL-04", name: "이직률", domain: "S", unit: "%", status: "linked" },
  { id: "kpi-female", code: "SOCIAL-05", name: "여성 관리직 비율", domain: "S", unit: "%", status: "linked" },
  { id: "kpi-newhire", code: "SOCIAL-06", name: "신규 채용률", domain: "S", unit: "%", status: "partial" },
  { id: "kpi-tenure", code: "SOCIAL-07", name: "평균 근속년수", domain: "S", unit: "년", status: "linked" },
  { id: "kpi-fulltime", code: "SOCIAL-08", name: "정규직 비율", domain: "S", unit: "%", status: "linked" },
  // Governance
  { id: "kpi-independent", code: "GOV-01", name: "독립이사 비율", domain: "G", unit: "%", status: "linked" },
  { id: "kpi-female-dir", code: "GOV-02", name: "여성 이사 비율", domain: "G", unit: "%", status: "linked" },
  { id: "kpi-ethics", code: "GOV-03", name: "윤리교육 이수율", domain: "G", unit: "%", status: "linked" },
  { id: "kpi-board-attend", code: "GOV-04", name: "이사회 출석률", domain: "G", unit: "%", status: "linked" },
];

export const MOCK_MIND_MAP_LINKS: MindMapLink[] = [
  // 직원명부 → 다수 KPI
  { sourceId: "ds-employee", kpiId: "kpi-employees" },
  { sourceId: "ds-employee", kpiId: "kpi-turnover" },
  { sourceId: "ds-employee", kpiId: "kpi-female" },
  { sourceId: "ds-employee", kpiId: "kpi-newhire" },
  { sourceId: "ds-employee", kpiId: "kpi-tenure" },
  { sourceId: "ds-employee", kpiId: "kpi-fulltime" },
  { sourceId: "ds-employee", kpiId: "kpi-training" },
  { sourceId: "ds-employee", kpiId: "kpi-female-dir" },
  // 에너지 사용량 → KPI
  { sourceId: "ds-energy", kpiId: "kpi-energy" },
  { sourceId: "ds-energy", kpiId: "kpi-renewable" },
  { sourceId: "ds-energy", kpiId: "kpi-ghg" },
  // 사업장 데이터 → KPI
  { sourceId: "ds-facility", kpiId: "kpi-ghg" },
  { sourceId: "ds-facility", kpiId: "kpi-safety" },
  { sourceId: "ds-facility", kpiId: "kpi-water" },
  { sourceId: "ds-facility", kpiId: "kpi-reduction" },
  // 공급망 데이터 → KPI
  { sourceId: "ds-supply", kpiId: "kpi-scope3" },
  { sourceId: "ds-supply", kpiId: "kpi-reduction" },
  // 이사회 운영 자료 → KPI
  { sourceId: "ds-board", kpiId: "kpi-independent" },
  { sourceId: "ds-board", kpiId: "kpi-female-dir" },
  { sourceId: "ds-board", kpiId: "kpi-ethics" },
  { sourceId: "ds-board", kpiId: "kpi-board-attend" },
  // 폐기물 관리 대장 → KPI
  { sourceId: "ds-waste", kpiId: "kpi-recycle" },
];
