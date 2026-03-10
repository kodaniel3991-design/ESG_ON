import { PageHeader } from "@/components/layout/page-header";

export default function SettingsMappingPage() {
  return (
    <>
      <PageHeader
        title="매핑 엔진"
        description="설정 · 데이터 매핑 규칙을 관리합니다."
      />
      <div className="mt-6 text-sm text-muted-foreground">
        설정 매핑 엔진 페이지 콘텐츠가 여기에 표시됩니다.
      </div>
    </>
  );
}
