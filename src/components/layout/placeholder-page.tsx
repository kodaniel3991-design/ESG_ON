import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader
        title={title}
        description={description ?? `${title} 화면입니다. 곧 구성될 예정입니다.`}
      />
      <Card className="mt-6 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            콘텐츠가 준비 중입니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
