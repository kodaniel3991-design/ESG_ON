import type { CarbonFlowNode } from "@/types";

export const mockCarbonFlowRoot: CarbonFlowNode = {
  id: "root",
  name: "CarbonOS Corp",
  type: "organization",
  value: 12450,
  unit: "tCO₂e",
  children: [
    {
      id: "scope1",
      name: "Scope 1",
      type: "category",
      value: 2100,
      unit: "tCO₂e",
      children: [
        {
          id: "s1-combustion",
          name: "Stationary combustion",
          type: "activity",
          value: 1200,
          unit: "tCO₂e",
        },
        {
          id: "s1-mobile",
          name: "Fleet vehicles",
          type: "activity",
          value: 700,
          unit: "tCO₂e",
        },
        {
          id: "s1-fugitive",
          name: "Fugitive",
          type: "activity",
          value: 200,
          unit: "tCO₂e",
        },
      ],
    },
    {
      id: "scope2",
      name: "Scope 2",
      type: "category",
      value: 3200,
      unit: "tCO₂e",
      children: [
        {
          id: "s2-electricity",
          name: "Purchased electricity",
          type: "activity",
          value: 2800,
          unit: "tCO₂e",
        },
        {
          id: "s2-steam",
          name: "Steam & heating",
          type: "activity",
          value: 400,
          unit: "tCO₂e",
        },
      ],
    },
    {
      id: "scope3",
      name: "Scope 3",
      type: "category",
      value: 7150,
      unit: "tCO₂e",
      children: [
        {
          id: "s3-goods",
          name: "Purchased goods",
          type: "activity",
          value: 3200,
          unit: "tCO₂e",
        },
        {
          id: "s3-travel",
          name: "Business travel",
          type: "activity",
          value: 850,
          unit: "tCO₂e",
        },
        {
          id: "s3-commuting",
          name: "Employee commuting",
          type: "activity",
          value: 420,
          unit: "tCO₂e",
        },
      ],
    },
  ],
};
