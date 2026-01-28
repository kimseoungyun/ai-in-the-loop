import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIReport } from "@/components/domain/reports/ai-report";
import { ArrowLeft, Building2, Hash } from "lucide-react";

// NOTE: 현재 앱은 홈과 동일하게 mock 데이터로 동작합니다.
// 실제 DB/Supabase 연동은 Phase 1 범위 내에서 별도 구현 필요(Stock/Report API route).
const MOCK_STOCKS: Record<
  string,
  {
    name: string;
    ticker: string;
    report?: { content: string; generatedAt: string };
  }
> = {
  "1": {
    name: "삼성전자",
    ticker: "005930",
    report: {
      content: `📊 삼성전자 주요 이슈 요약 (최근 7일)

1. 반도체 시장 회복세
AI 수요 증가로 메모리/반도체 업황이 회복세를 보이고 있으며, HBM(고대역폭 메모리) 관련 기대감이 반영되고 있습니다.

2. 모바일 신제품 모멘텀
차기 갤럭시 라인업의 AI 기능 강화가 거론되며, 생태계 락인 및 서비스 확장 기대가 있습니다.

3. 파운드리 경쟁
공정 전환 속도와 수율 개선이 핵심 포인트로, 대외 변수에 따른 변동성 가능성이 있습니다.

💡 투자 참고사항
중장기 성장 기대와 단기 변동성이 공존합니다.`,
      generatedAt: "2025-01-27 오전 9:30",
    },
  },
  "2": {
    name: "Apple",
    ticker: "AAPL",
    report: {
      content: `📊 Apple 주요 이슈 요약 (최근 7일)

1. AI 전략 강화
온디바이스/클라우드 혼합 전략과 생태계 기반 서비스 확장에 대한 기대가 있습니다.

2. 신제품/서비스 매출
서비스 부문 성장이 방어력을 제공하나, 하드웨어 사이클 둔화는 체크 포인트입니다.

3. 규제/공급망 이슈
지역별 규제 및 공급망 변수에 따라 단기 노이즈가 발생할 수 있습니다.

💡 투자 참고사항
현금흐름과 서비스 성장에 주목하되, 이벤트 리스크를 함께 고려하세요.`,
      generatedAt: "2025-01-27 오전 10:15",
    },
  },
  "3": {
    name: "테슬라",
    ticker: "TSLA",
  },
};

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stock = MOCK_STOCKS[id];

  if (!stock) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-center text-muted-foreground">
          종목을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">종목 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {stock.name}
                </h2>
                {stock.ticker && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    {stock.ticker}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <AIReport stockName={stock.name} existingReport={stock.report} />
      </div>
    </div>
  );
}
