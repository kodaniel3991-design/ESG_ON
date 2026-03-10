import type { EmployeeRosterItem } from "@/types";

export const mockEmployeeRoster: EmployeeRosterItem[] = [
  { id: "emp1", department: "개발팀", name: "김철수", jobTitle: "선임 개발자", employeeId: "E001", commuteTransport: "public", fuel: "", address: "서울시 강남구 테헤란로 123", addressDetail: "101동 1203호" },
  { id: "emp2", department: "마케팅팀", name: "이영희", jobTitle: "팀장", employeeId: "E002", commuteTransport: "car_gasoline", fuel: "휘발유", address: "경기도 성남시 분당구 판교로 456", addressDetail: "A동 7층" },
  { id: "emp3", department: "개발팀", name: "박지훈", jobTitle: "개발자", employeeId: "E003", commuteTransport: "ev", fuel: "", address: "서울시 서초구 서초대로 11", addressDetail: "오피스텔 305호" },
  { id: "emp4", department: "인사팀", name: "정수진", jobTitle: "인사담당", employeeId: "E004", commuteTransport: "walk_bike", fuel: "", address: "서울시 마포구 양화로 9", addressDetail: "2층" },
  { id: "emp5", department: "기획팀", name: "최민호", jobTitle: "기획팀장", employeeId: "E005", commuteTransport: "car_diesel", fuel: "경유", address: "인천시 연수구 송도과학로 77", addressDetail: "B동 1402호" },
];
