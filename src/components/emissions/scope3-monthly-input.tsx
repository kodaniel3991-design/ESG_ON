"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import { Scope3CommutingInput } from "./scope3-commuting-input";
import { Paperclip, Upload, X, FileText, ChevronLeft, ChevronRight, Eye } from "lucide-react";

type Scope3Group = "upstream" | "downstream";

export interface Scope3CategoryConfig {
  id: string;
  label: string;
  group: Scope3Group;
  factorSource?: string;
}

interface Attachment {
  id: string;
  file: File;
  url: string;
  name: string;
}

const COMMUTING_CATEGORY_ID = "u7";

interface Scope3MonthlyInputProps {
  categories: Scope3CategoryConfig[];
}

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

function FileViewer({ att, onClose }: { att: Attachment; onClose: () => void }) {
  const isImage = att.file.type.startsWith("image/");
  const isPdf = att.file.type === "application/pdf";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="relative flex max-h-[90vh] max-w-[90vw] flex-col overflow-hidden rounded-lg bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="max-w-xs truncate text-sm font-medium">{att.name}</span>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-auto">
          {isImage && <img src={att.url} alt={att.name} className="max-h-[80vh] w-auto object-contain" />}
          {isPdf && <iframe src={att.url} className="h-[80vh] w-[70vw]" title={att.name} />}
          {!isImage && !isPdf && (
            <div className="flex flex-col items-center gap-4 p-8 text-muted-foreground">
              <FileText className="h-16 w-16" />
              <p className="text-sm">{att.name}</p>
              <a href={att.url} download={att.name}><Button variant="outline" size="sm">다운로드</Button></a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Scope3MonthlyInput({ categories }: Scope3MonthlyInputProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i));
  const [year, setYear] = useState(String(currentYear));
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? "");
  const [activity, setActivity] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, Array(12).fill(0)]))
  );
  const [factor, setFactor] = useState<Record<string, number>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, c.id === COMMUTING_CATEGORY_ID ? 0.01 : 1]))
  );
  const [saved, setSaved] = useState(false);

  // 첨부파일
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({});
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [viewerAtt, setViewerAtt] = useState<Attachment | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attKey = (catId: string, monthIdx: number) => `${year}-${catId}-${monthIdx}`;
  const currentAtts = selectedMonth !== null ? (attachments[attKey(selectedId, selectedMonth)] ?? []) : [];

  const addFiles = useCallback((files: FileList | File[], catId: string, monthIdx: number) => {
    const key = attKey(catId, monthIdx);
    const newAtts: Attachment[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setAttachments((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), ...newAtts] }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, selectedId]);

  const removeAtt = (catId: string, monthIdx: number, attId: string) => {
    const key = attKey(catId, monthIdx);
    setAttachments((prev) => {
      const list = prev[key] ?? [];
      const removed = list.find((a) => a.id === attId);
      if (removed) URL.revokeObjectURL(removed.url);
      return { ...prev, [key]: list.filter((a) => a.id !== attId) };
    });
  };

  const grouped = useMemo(() => ({
    upstream: categories.filter((c) => c.group === "upstream"),
    downstream: categories.filter((c) => c.group === "downstream"),
  }), [categories]);

  const selected = categories.find((c) => c.id === selectedId);
  const isGoodsCategory = selected?.label === "구입상품 및 서비스";
  const isCommuting = selectedId === COMMUTING_CATEGORY_ID;
  const activityValues = activity[selectedId] ?? Array(12).fill(0);
  const emissionFactor = factor[selectedId] ?? (isCommuting ? 0.01 : 1);
  const factorSource = selected?.factorSource;

  const emissions = useMemo(
    () => activityValues.map((a) => (Number.isNaN(a) ? 0 : a) * emissionFactor),
    [activityValues, emissionFactor]
  );
  const totalEmissions = emissions.reduce((sum, v) => sum + v, 0);

  const handleActivityChange = (monthIndex: number, raw: string) => {
    const v = raw === "" ? 0 : parseFloat(raw);
    setActivity((prev) => {
      const current = prev[selectedId] ?? Array(12).fill(0);
      const next = [...current];
      next[monthIndex] = Number.isNaN(v) ? 0 : v;
      return { ...prev, [selectedId]: next };
    });
    setSaved(false);
  };

  const handleFactorChange = (raw: string) => {
    const v = raw === "" ? 0 : parseFloat(raw);
    setFactor((prev) => ({ ...prev, [selectedId]: Number.isNaN(v) ? 0 : v }));
    setSaved(false);
  };

  const handleCommutingFactorChange = (v: number) => {
    setFactor((prev) => ({ ...prev, [COMMUTING_CATEGORY_ID]: v }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderCategoryList = (cats: Scope3CategoryConfig[]) =>
    cats.map((cat) => {
      const isActive = selectedId === cat.id;
      const totalAtts = Array.from({ length: 12 }, (_, i) =>
        (attachments[attKey(cat.id, i)] ?? []).length
      ).reduce((s, n) => s + n, 0);
      return (
        <button
          key={cat.id}
          type="button"
          onClick={() => { setSelectedId(cat.id); setSelectedMonth(null); }}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
            isActive
              ? "bg-primary/10 text-primary font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-muted/70"
          )}
        >
          <span>{cat.label}</span>
          {totalAtts > 0 && (
            <span className="flex items-center gap-0.5 text-primary">
              <Paperclip className="h-3 w-3" />
              {totalAtts}
            </span>
          )}
        </button>
      );
    });

  return (
    <>
      {viewerAtt && <FileViewer att={viewerAtt} onClose={() => setViewerAtt(null)} />}

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        {/* 카테고리 사이드 */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Scope 3 카테고리</p>
          <div className="space-y-3 text-sm">
            <div>
              <p className="mb-1 font-semibold text-muted-foreground">업스트림</p>
              <div className="space-y-1">{renderCategoryList(grouped.upstream)}</div>
            </div>
            <div>
              <p className="mb-1 mt-2 font-semibold text-muted-foreground">다운스트림</p>
              <div className="space-y-1">{renderCategoryList(grouped.downstream)}</div>
            </div>
          </div>
        </div>

        {isCommuting ? (
          <Scope3CommutingInput
            year={year}
            onYearChange={setYear}
            factor={emissionFactor}
            onFactorChange={handleCommutingFactorChange}
          />
        ) : (
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {isGoodsCategory ? "월별 사용량 입력" : selected?.label ?? "카테고리를 선택하세요"}
                </CardTitle>
                {isGoodsCategory ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <p>선택된 카테고리 기준으로 사용량과 배출량을 관리합니다.</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">연도</span>
                      <select
                        id="scope3-year"
                        value={year}
                        onChange={(e) => { setYear(e.target.value); setSelectedMonth(null); }}
                        className="h-8 w-[110px] rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                      >
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">데이터 상태</span>
                      <span className="inline-flex items-center rounded-full border border-border bg-taupe-50 px-2 py-0.5 text-[11px] font-medium text-carbon-warning">Draft</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">활동량을 입력하면 배출량(tCO₂e)이 자동 산출됩니다.</p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <label htmlFor="scope3-factor" className="mr-2 text-xs font-medium text-muted-foreground">
                  배출계수 (tCO₂e/단위)
                </label>
                <input
                  id="scope3-factor"
                  type="number"
                  min={0}
                  step="any"
                  value={emissionFactor}
                  onChange={(e) => handleFactorChange(e.target.value)}
                  className="h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-right text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {factorSource && (
                  <p className="mt-1 max-w-xs text-[11px] leading-snug text-muted-foreground">
                    배출계수 출처: {factorSource}
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                      <th className="w-24 px-2 py-3 text-left font-medium">구분</th>
                      {MONTH_LABELS.map((label, idx) => (
                        <th
                          key={label}
                          className={cn(
                            "w-20 px-2 py-3 text-right font-medium",
                            selectedMonth === idx && "bg-primary/10 text-primary"
                          )}
                        >
                          {label}
                        </th>
                      ))}
                      <th className="w-24 px-2 py-3 text-right font-medium">합계</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-2 py-3 font-medium">{isGoodsCategory ? "사용량" : "활동량"}</td>
                      {MONTH_LABELS.map((_, idx) => {
                        const attCount = (attachments[attKey(selectedId, idx)] ?? []).length;
                        const isSelected = selectedMonth === idx;
                        return (
                          <td key={idx} className={cn("px-2 py-1 text-right", isSelected && "bg-primary/5")}>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={activityValues[idx] ?? 0}
                              onChange={(e) => handleActivityChange(idx, e.target.value)}
                              onFocus={() => setSelectedMonth(idx)}
                              className={cn(
                                "h-9 w-full min-w-[4rem] rounded-md border bg-transparent px-2 py-2 text-right text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
                                isSelected ? "border-primary" : "border-input"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedMonth(isSelected ? null : idx)}
                              className={cn(
                                "mt-0.5 flex w-full items-center justify-end gap-0.5 text-[10px]",
                                attCount > 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Paperclip className="h-2.5 w-2.5" />
                              {attCount > 0 ? attCount : "첨부"}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-2 py-3 text-right text-muted-foreground">
                        {formatNumber(activityValues.reduce((s, v) => s + (Number.isNaN(v) ? 0 : v), 0), 4)}
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 font-medium">
                      <td className="px-2 py-3">배출량 (tCO₂e)</td>
                      {emissions.map((v, idx) => (
                        <td key={idx} className={cn("px-2 py-3 text-right", selectedMonth === idx && "bg-primary/5")}>
                          {formatNumber(v, 4)}
                        </td>
                      ))}
                      <td className="px-2 py-3 text-right">{formatNumber(totalEmissions, 4)} tCO₂e</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 첨부파일 패널 */}
              {selectedMonth !== null && (
                <div
                  className="rounded-lg border border-primary/30 bg-primary/5 p-4"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); if (selectedMonth !== null) addFiles(e.dataTransfer.files, selectedId, selectedMonth); }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setSelectedMonth((m) => m !== null && m > 0 ? m - 1 : m)} disabled={selectedMonth === 0} className="rounded p-0.5 hover:bg-muted disabled:opacity-30">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold text-primary">
                        {year}년 {MONTH_LABELS[selectedMonth]} 첨부자료
                      </span>
                      <button type="button" onClick={() => setSelectedMonth((m) => m !== null && m < 11 ? m + 1 : m)} disabled={selectedMonth === 11} className="rounded p-0.5 hover:bg-muted disabled:opacity-30">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-1 h-3.5 w-3.5" />파일 업로드
                      </Button>
                      <button type="button" onClick={() => setSelectedMonth(null)} className="rounded p-1 hover:bg-muted">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {currentAtts.length === 0 ? (
                    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed py-8 text-muted-foreground transition-colors", dragOver ? "border-primary bg-primary/10" : "border-border")}>
                      <Upload className="h-8 w-8" />
                      <p className="text-sm">파일을 드래그하거나 업로드 버튼을 클릭하세요</p>
                      <p className="text-xs">PDF, 이미지, 문서 등 모든 파일 지원</p>
                    </div>
                  ) : (
                    <div className={cn("space-y-2 rounded-md border-2 border-dashed p-2 transition-colors", dragOver ? "border-primary bg-primary/10" : "border-transparent")}>
                      {currentAtts.map((att) => {
                        const isImage = att.file.type.startsWith("image/");
                        const isPdf = att.file.type === "application/pdf";
                        return (
                          <div key={att.id} className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
                              {isImage ? (
                                <img src={att.url} alt={att.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{att.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(att.file.size / 1024).toFixed(1)} KB{isPdf && " · PDF"}{isImage && " · 이미지"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => setViewerAtt(att)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="보기">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => removeAtt(selectedId, selectedMonth, att.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="삭제">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-muted/50">
                        <Upload className="h-3 w-3" />파일 추가
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && selectedMonth !== null) {
                        addFiles(e.target.files, selectedId, selectedMonth);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={handleSave}>저장</Button>
                <span className="text-sm text-muted-foreground">
                  {saved ? "저장되었습니다." : (
                    <>{year}년 데이터는{" "}<span className="font-semibold text-carbon-warning">Draft</span>{" "}상태입니다.</>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
