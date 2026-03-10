import { PageHeader } from "@/components/layout/page-header";

export default function SettingsTemplatesPage() {
  return (
    <>
      <PageHeader
        title="보고서 템플릿"
        description="보고서 템플릿 설정을 관리합니다."
      />
      <div className="mt-6 text-sm text-muted-foreground">
        보고서 템플릿 페이지 콘텐츠가 여기에 표시됩니다.
      </div>
    </>
  );
}
