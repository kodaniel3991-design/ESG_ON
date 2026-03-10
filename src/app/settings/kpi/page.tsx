import { PageHeader } from "@/components/layout/page-header";

export default function SettingsKPIPage() {
  return (
    <>
      <PageHeader
        title="KPI 마스터"
        description="KPI 지표 정의 및 마스터 데이터를 관리합니다."
      />
      <div className="mt-6 text-sm text-muted-foreground">
        KPI 마스터 페이지 콘텐츠가 여기에 표시됩니다.
      </div>
    </>
  );
}
