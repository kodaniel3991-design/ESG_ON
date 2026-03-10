export type DataEntryMode = "manual" | "excel" | "api";

export type PurchasedGoodsMethod =
  | "Activity Based"
  | "Spend Based"
  | "Supplier Specific";

export type PurchasedGoodsStatus = "active" | "inactive";

export interface PurchasedGoodsActivity {
  id: string;
  name: string;
  /**
   * Scope 3 카테고리 ID (예: u1=구입상품 및 서비스, u2=자본재)
   */
  categoryId?: string;
  supplier: string;
  method: PurchasedGoodsMethod;
  unit: string;
  emissionFactor: number;
  status: PurchasedGoodsStatus;
  source?: string;
}

export interface MonthlyActivityData {
  activityId: string;
  values: number[];
}

// Alias to keep semantics explicit for Scope 3 purchased goods flows.
import type { AuditLogItem as Scope1AuditLogItem } from "./scope1";

export type AuditLogItem = Scope1AuditLogItem;

