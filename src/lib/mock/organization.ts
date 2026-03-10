import type { OrganizationSettings, WorksiteItem } from "@/types";
import { mockWorksiteLocation } from "./commute-distance";

const defaultWorksite: WorksiteItem = {
  id: "ws-default",
  name: mockWorksiteLocation.name,
  address: mockWorksiteLocation.address,
  addressDetail: mockWorksiteLocation.addressDetail,
};

export const mockOrganizationSettings: OrganizationSettings = {
  organizationName: "CarbonOS Demo Corp.",
  worksites: [
    defaultWorksite,
    {
      id: "ws-2",
      name: "제2사업장",
      address: "경기도 성남시 분당구 판교역로 235",
      addressDetail: "B동",
    },
  ],
  defaultWorksiteId: defaultWorksite.id,
};

