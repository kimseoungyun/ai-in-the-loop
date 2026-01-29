import { TrendingUp } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <TrendingUp className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">
        등록된 종목이 없습니다
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        관심 있는 주식 종목을 추가하고 AI가 분석한 최신 이슈 리포트를 받아보세요.
      </p>
    </div>
  );
}
