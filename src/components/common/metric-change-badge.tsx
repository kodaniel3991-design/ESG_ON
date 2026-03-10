 "use client";

 import { TrendingDown, TrendingUp } from "lucide-react";
 import { formatPercent } from "@/lib/utils";

 interface MetricChangeBadgeProps {
   value: number;
   label?: string;
 }

 export function MetricChangeBadge({
   value,
   label = "전년대비",
 }: MetricChangeBadgeProps) {
   const isUp = value >= 0;
   const baseClass = "flex items-center gap-0.5 text-xs";
   const colorClass = isUp ? "text-carbon-success" : "text-carbon-danger";

   return (
     <span className={`${baseClass} ${colorClass}`}>
       {isUp ? (
         <TrendingUp className="h-3.5 w-3.5" />
       ) : (
         <TrendingDown className="h-3.5 w-3.5" />
       )}
       {formatPercent(value)} {label}
     </span>
   );
 }
