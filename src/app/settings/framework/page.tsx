import { PageHeader } from "@/components/layout/page-header";

export default function SettingsFrameworkPage() {
  return (
    <>
      <PageHeader
        title="프레임워크 마스터"
        description="공시 프레임워크 및 요구사항 마스터를 관리합니다."
      />
      <div className="mt-6 text-sm text-muted-foreground">
        프레임워크 마스터 페이지 콘텐츠가 여기에 표시됩니다.
      </div>
    </>
  );
}
