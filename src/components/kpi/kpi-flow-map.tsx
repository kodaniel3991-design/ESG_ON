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
  Maximize2,
  Minimize2,
  Database,
  Target,
  BarChart3,
  PenLine,
  FileSpreadsheet,
  Plug,
  TrendingUp,
  FileText,
  CheckCircle,
  ShieldCheck,
  Star,
  Gauge,
  Calculator,
  ClipboardCheck,
  Sparkles,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

/* ── 색상 테마 ── */
const PHASE_STYLES: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  target: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-300", iconBg: "bg-amber-100" },
  input: { bg: "bg-primary/5", text: "text-primary", border: "border-primary/40", iconBg: "bg-primary/10" },
  analysis: { bg: "bg-green-50", text: "text-carbon-success", border: "border-green-200", iconBg: "bg-green-100" },
  report: { bg: "bg-taupe-50", text: "text-taupe-600", border: "border-taupe-200", iconBg: "bg-taupe-100" },
  level: { bg: "bg-navy-50", text: "text-navy-500", border: "border-navy-200", iconBg: "bg-navy-100" },
};

/* ── 커스텀 노드: 단계 헤더 ── */
function PhaseHeaderNode({ data }: NodeProps) {
  const Icon = (data.icon as LucideIcon) ?? Database;
  const style = PHASE_STYLES[(data.phase as string) ?? "target"];
  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground !border-muted-foreground !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground !border-muted-foreground !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !border-muted-foreground !w-2 !h-2" id="bottom" />
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !border-muted-foreground !w-2 !h-2" id="top" />
      <div className={cn("flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 shadow-md min-w-[160px]", style.border, style.bg)}>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", style.iconBg)}>
          <Icon className={cn("h-5 w-5", style.text)} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{data.label as string}</p>
          <p className="text-[11px] text-muted-foreground">{data.sublabel as string}</p>
        </div>
      </div>
    </div>
  );
}

/* ── 커스텀 노드: 하위 항목 ── */
function SubItemNode({ data }: NodeProps) {
  const Icon = (data.icon as LucideIcon) ?? Database;
  const style = PHASE_STYLES[(data.phase as string) ?? "target"];
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !border-muted-foreground !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !border-muted-foreground !w-1.5 !h-1.5" id="bottom" />
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground !border-muted-foreground !w-1.5 !h-1.5" />
      <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm", style.border, "bg-card")}>
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", style.iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", style.text)} />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground whitespace-nowrap">{data.label as string}</p>
          <p className="text-[9px] text-muted-foreground whitespace-nowrap">{data.sublabel as string}</p>
        </div>
      </div>
    </div>
  );
}

/* ── 피드백 노드 ── */
function FeedbackNode({ data }: NodeProps) {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="!bg-primary !border-primary !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-primary !border-primary !w-2 !h-2" />
      <div className="flex items-center gap-2 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-2">
        <TrendingUp className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-primary">{data.label as string}</span>
      </div>
    </div>
  );
}

/* ── 구분 라벨 ── */
function SectionLabelNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-1 rounded-md bg-muted/60 border border-border">
      <p className="text-[10px] font-semibold text-muted-foreground tracking-wide">{data.label as string}</p>
    </div>
  );
}

const nodeTypes = { phaseHeader: PhaseHeaderNode, subItem: SubItemNode, feedback: FeedbackNode, sectionLabel: SectionLabelNode };

/* ── 레이아웃 ── */
function buildLayout() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const arrow = (color: string) => ({ type: MarkerType.ArrowClosed as const, color, width: 12, height: 12 });
  const lineStyle = (color: string, dash?: boolean) => ({ stroke: color, strokeWidth: 2, ...(dash ? { strokeDasharray: "6 4" } : {}) });

  const topY = 0;
  const colGap = 320;
  const rowGap = 130;
  const subGap = 190;

  // ── 상단: 관리 수준 + 목표 ──
  nodes.push({ id: "label-setup", type: "sectionLabel", position: { x: -140, y: topY + 12 }, data: { label: "목표 설정" } });

  // Phase 0: 관리 수준 분류 (중대성 평가 연결)
  const p0x = 0;
  nodes.push({ id: "p0", type: "phaseHeader", position: { x: p0x, y: topY }, data: { label: "관리 수준 분류", sublabel: "중대성 평가 결과 연동", icon: ClipboardCheck, phase: "level" } });

  nodes.push({ id: "p0-critical", type: "subItem", position: { x: p0x - 60, y: topY + rowGap }, data: { label: "의무 (Critical)", sublabel: "프레임워크 필수 공시", icon: ShieldCheck, phase: "level" } });
  nodes.push({ id: "p0-material", type: "subItem", position: { x: p0x + 140, y: topY + rowGap }, data: { label: "중대 (Material)", sublabel: "중대성 평가 핵심 이슈", icon: Star, phase: "level" } });
  nodes.push({ id: "p0-general", type: "subItem", position: { x: p0x + 340, y: topY + rowGap }, data: { label: "일반 (General)", sublabel: "기본 모니터링", icon: Gauge, phase: "level" } });

  edges.push({ id: "p0-c", source: "p0", target: "p0-critical", sourceHandle: "bottom", style: lineStyle("#1e40af"), markerEnd: arrow("#1e40af") });
  edges.push({ id: "p0-m", source: "p0", target: "p0-material", sourceHandle: "bottom", style: lineStyle("#1e40af"), markerEnd: arrow("#1e40af") });
  edges.push({ id: "p0-g", source: "p0", target: "p0-general", sourceHandle: "bottom", style: lineStyle("#1e40af"), markerEnd: arrow("#1e40af") });

  // Phase 1: 목표 설정
  const p1x = p0x + colGap + 250;
  nodes.push({ id: "p1", type: "phaseHeader", position: { x: p1x, y: topY }, data: { label: "목표 설정", sublabel: "KPI별 연간/분기 목표", icon: Target, phase: "target" } });
  edges.push({ id: "p0-p1", source: "p0", target: "p1", style: lineStyle("#d97706"), markerEnd: arrow("#d97706"), label: "KPI 목록", labelStyle: { fontSize: 10, fill: "#d97706" } });

  nodes.push({ id: "p1-annual", type: "subItem", position: { x: p1x - 30, y: topY + rowGap }, data: { label: "연간 목표", sublabel: "연도별 목표값 설정", icon: Target, phase: "target" } });
  nodes.push({ id: "p1-quarterly", type: "subItem", position: { x: p1x + subGap, y: topY + rowGap }, data: { label: "분기 목표", sublabel: "분기별 세부 목표", icon: Target, phase: "target" } });

  edges.push({ id: "p1-a", source: "p1", target: "p1-annual", sourceHandle: "bottom", style: lineStyle("#d97706"), markerEnd: arrow("#d97706") });
  edges.push({ id: "p1-q", source: "p1", target: "p1-quarterly", sourceHandle: "bottom", style: lineStyle("#d97706"), markerEnd: arrow("#d97706") });

  // ── 하단: 데이터 + 분석 + 보고서 ──
  const botY = 300;
  nodes.push({ id: "label-exec", type: "sectionLabel", position: { x: -140, y: botY + 12 }, data: { label: "실행 관리" } });

  // Phase 2: 데이터 입력
  const p2x = 0;
  nodes.push({ id: "p2", type: "phaseHeader", position: { x: p2x, y: botY }, data: { label: "데이터 입력", sublabel: "월별 실적 수집", icon: PenLine, phase: "input" } });
  edges.push({ id: "p1-p2", source: "p1", target: "p2", style: lineStyle("#6366f1"), markerEnd: arrow("#6366f1"), label: "목표값", labelStyle: { fontSize: 10, fill: "#6366f1" } });

  nodes.push({ id: "p2-manual", type: "subItem", position: { x: p2x - 80, y: botY + rowGap }, data: { label: "직접 입력", sublabel: "수동 데이터 입력", icon: PenLine, phase: "input" } });
  nodes.push({ id: "p2-excel", type: "subItem", position: { x: p2x + 100, y: botY + rowGap }, data: { label: "Excel 업로드", sublabel: "일괄 데이터 업로드", icon: FileSpreadsheet, phase: "input" } });
  nodes.push({ id: "p2-auto", type: "subItem", position: { x: p2x + 280, y: botY + rowGap }, data: { label: "자동 집계", sublabel: "배출량 → KPI 연동", icon: Calculator, phase: "input" } });
  nodes.push({ id: "p2-ocr", type: "subItem", position: { x: p2x + 460, y: botY + rowGap }, data: { label: "AI 고지서 OCR", sublabel: "이미지 → 사용량 추출", icon: Sparkles, phase: "input" } });

  edges.push({ id: "p2-man", source: "p2", target: "p2-manual", sourceHandle: "bottom", style: lineStyle("#6366f1"), markerEnd: arrow("#6366f1") });
  edges.push({ id: "p2-exc", source: "p2", target: "p2-excel", sourceHandle: "bottom", style: lineStyle("#6366f1"), markerEnd: arrow("#6366f1") });
  edges.push({ id: "p2-aut", source: "p2", target: "p2-auto", sourceHandle: "bottom", style: lineStyle("#6366f1"), markerEnd: arrow("#6366f1") });
  edges.push({ id: "p2-ocr", source: "p2", target: "p2-ocr", sourceHandle: "bottom", style: lineStyle("#6366f1"), markerEnd: arrow("#6366f1") });

  // Phase 3: 성과 분석
  const p3x = p1x - 50;
  nodes.push({ id: "p3", type: "phaseHeader", position: { x: p3x, y: botY }, data: { label: "성과 분석", sublabel: "목표 대비 달성률", icon: BarChart3, phase: "analysis" } });
  edges.push({ id: "p2-p3", source: "p2", target: "p3", style: lineStyle("#16a34a"), markerEnd: arrow("#16a34a"), label: "실적 데이터", labelStyle: { fontSize: 10, fill: "#16a34a" } });

  nodes.push({ id: "p3-track", type: "subItem", position: { x: p3x - 60, y: botY + rowGap }, data: { label: "On Track", sublabel: "달성률 ≥ 90%", icon: CheckCircle, phase: "analysis" } });
  nodes.push({ id: "p3-warn", type: "subItem", position: { x: p3x + 130, y: botY + rowGap }, data: { label: "주의", sublabel: "달성률 70~90%", icon: AlertTriangle, phase: "analysis" } });
  nodes.push({ id: "p3-miss", type: "subItem", position: { x: p3x + 310, y: botY + rowGap }, data: { label: "미달", sublabel: "달성률 < 70%", icon: AlertTriangle, phase: "analysis" } });

  edges.push({ id: "p3-t", source: "p3", target: "p3-track", sourceHandle: "bottom", style: lineStyle("#16a34a"), markerEnd: arrow("#16a34a") });
  edges.push({ id: "p3-w", source: "p3", target: "p3-warn", sourceHandle: "bottom", style: lineStyle("#16a34a"), markerEnd: arrow("#16a34a") });
  edges.push({ id: "p3-m", source: "p3", target: "p3-miss", sourceHandle: "bottom", style: lineStyle("#16a34a"), markerEnd: arrow("#16a34a") });

  // Phase 4: 보고서
  const p4x = p3x + colGap + 150;
  nodes.push({ id: "p4", type: "phaseHeader", position: { x: p4x, y: botY }, data: { label: "공시·보고서", sublabel: "GRI·K-ESG·CSRD 반영", icon: FileText, phase: "report" } });
  edges.push({ id: "p3-p4", source: "p3", target: "p4", style: lineStyle("#78716c"), markerEnd: arrow("#78716c"), label: "성과 데이터", labelStyle: { fontSize: 10, fill: "#78716c" } });

  // 피드백 루프
  nodes.push({ id: "fb", type: "feedback", position: { x: p3x, y: botY + 260 }, data: { label: "다음 주기 목표 재설정" } });
  edges.push({ id: "p4-fb", source: "p4", target: "fb", style: lineStyle("#6366f1", true), markerEnd: arrow("#6366f1") });
  edges.push({ id: "fb-p1", source: "fb", target: "p1", targetHandle: "top", style: lineStyle("#6366f1", true), markerEnd: arrow("#6366f1") });

  return { nodes, edges };
}

/* ── 직접 연결된 노드만 탐색 ── */
function findDirectConnectedIds(nodeId: string, allEdges: Edge[]) {
  const nodeIds = new Set<string>([nodeId]);
  const edgeIds = new Set<string>();
  for (const e of allEdges) {
    if (e.source === nodeId || e.target === nodeId) { edgeIds.add(e.id); nodeIds.add(e.source); nodeIds.add(e.target); }
  }
  return { nodeIds, edgeIds };
}

export function KpiFlowMap() {
  const { nodes: allNodes, edges: allEdges } = useMemo(() => buildLayout(), []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const { nodes, edges } = useMemo(() => {
    if (!selectedNodeId) return { nodes: allNodes, edges: allEdges };
    const { nodeIds, edgeIds } = findDirectConnectedIds(selectedNodeId, allEdges);
    return {
      nodes: allNodes.map((n) => ({ ...n, style: { ...n.style, opacity: nodeIds.has(n.id) || n.type === "sectionLabel" ? 1 : 0.12, transition: "opacity 0.3s ease" } })),
      edges: allEdges.map((e) => ({ ...e, style: { ...e.style, opacity: edgeIds.has(e.id) ? 0.9 : 0.05, strokeWidth: edgeIds.has(e.id) ? 2.5 : 1, transition: "opacity 0.3s ease" } })),
    };
  }, [allNodes, allEdges, selectedNodeId]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "sectionLabel") return;
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const flowContent = (
    <>
      {selectedNodeId && (
        <button onClick={() => setSelectedNodeId(null)} className="absolute top-3 right-3 z-10 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
          전체 보기
        </button>
      )}
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodeClick={onNodeClick} onPaneClick={() => setSelectedNodeId(null)}
        fitView fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3} maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false} nodesConnectable={false}
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          {selectedNodeId && <button onClick={() => setSelectedNodeId(null)} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">전체 보기</button>}
          <button onClick={() => setFullscreen(false)} className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-muted">
            <Minimize2 className="h-3.5 w-3.5" /> 축소
          </button>
        </div>
        <div className="h-full w-full">{flowContent}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-xs font-medium text-muted-foreground">KPI 관리 흐름도 — 노드를 클릭하면 연결된 흐름만 표시됩니다</p>
        <button onClick={() => setFullscreen(true)} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted">
          <Maximize2 className="h-3 w-3" /> 전체화면
        </button>
      </div>
      <div className="h-[500px] relative">{flowContent}</div>
    </div>
  );
}
