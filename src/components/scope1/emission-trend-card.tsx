"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

const MONTH_LABELS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

interface EmissionTrendCardProps {
  monthlyTotals: number[]; // length 12
}

export function EmissionTrendCard({ monthlyTotals }: EmissionTrendCardProps) {
  const total = monthlyTotals.reduce((s, v) => s + (Number.isNaN(v) ? 0 : v), 0);
  const maxVal = Math.max(...monthlyTotals, 1);

  // SVG 차트 설정
  const W = 900;
  const H = 220;
  const padL = 52;
  const padR = 20;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Y축 눈금: 0 ~ maxVal을 4등분
  const yTicks = 5;
  const yStep = maxVal / (yTicks - 1);
  const yTickVals = Array.from({ length: yTicks }, (_, i) => Math.round(yStep * (yTicks - 1 - i)));

  const xOf = (i: number) => padL + (i / 11) * chartW;
  const yOf = (v: number) => padT + chartH - (v / maxVal) * chartH;

  // 꺾은선 path
  const linePath = monthlyTotals
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`)
    .join(" ");

  // 영역 fill path
  const areaPath =
    linePath +
    ` L ${xOf(11).toFixed(1)} ${(padT + chartH).toFixed(1)} L ${xOf(0).toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              {formatNumber(total, 2)} tCO₂e — Scope 1 월별 추이
            </CardTitle>
            <p className="text-xs text-muted-foreground">월별 배출량 추이를 한눈에 확인합니다.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 220 }}
          aria-label="Scope 1 월별 배출량 추이"
        >
          <defs>
            <linearGradient id="s1area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* 수평 그리드 + Y축 레이블 */}
          {yTickVals.map((val, i) => {
            const y = padT + (i / (yTicks - 1)) * chartH;
            return (
              <g key={i}>
                <line
                  x1={padL} y1={y.toFixed(1)}
                  x2={W - padR} y2={y.toFixed(1)}
                  stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4"
                />
                <text
                  x={padL - 6} y={y + 4}
                  textAnchor="end" fontSize="11" fill="#9ca3af"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* 영역 fill */}
          <path d={areaPath} fill="url(#s1area)" />

          {/* 꺾은선 */}
          <path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 데이터 점 + X축 레이블 */}
          {monthlyTotals.map((v, i) => (
            <g key={i}>
              <circle
                cx={xOf(i).toFixed(1)}
                cy={yOf(v).toFixed(1)}
                r="4.5"
                fill="#fff"
                stroke="#10b981"
                strokeWidth="2"
              />
              <text
                x={xOf(i).toFixed(1)}
                y={H - 6}
                textAnchor="middle"
                fontSize="11"
                fill="#9ca3af"
              >
                {MONTH_LABELS[i]}
              </text>
            </g>
          ))}
        </svg>

        {/* 범례 + 합계 */}
        <div className="mt-1 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-emerald-500 bg-white" />
            <span className="font-medium text-emerald-700">Scope 1</span>
          </div>
          <span>
            연간 합계:{" "}
            <span className="font-semibold text-foreground">
              {formatNumber(total, 2)} tCO₂e
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
