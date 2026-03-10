import type { DistanceApiSettings, WorksiteLocation } from "@/types";

export const mockWorksiteLocation: WorksiteLocation = {
  name: "본사",
  address: "서울특별시 중구 세종대로 110",
  addressDetail: "15층",
};

export const mockDistanceApiSettings: DistanceApiSettings = {
  provider: "none",
  enabled: false,
  baseUrl: "",
  apiKey: "",
};

