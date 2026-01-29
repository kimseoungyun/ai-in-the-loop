import Link from "next/link";
import { Header } from "@/components/header";
import { AIReport } from "@/components/ai-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Hash } from "lucide-react";

// Mock data for demonstration
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
삼성전자의 반도체 사업이 AI 관련 수요 증가로 인해 회복세를 보이고 있습니다. 특히 HBM(고대역폭 메모리) 분야에서 긍정적인 성과가 예상됩니다.

2. 갤럭시 S25 시리즈 출시 임박
새로운 갤럭시 S25 시리즈가 곧 출시될 예정이며, AI 기능 강화가 주요 특징으로 예상됩니다.

3. 파운드리 사업 확대
삼성전자가 2나노 공정 개발에 박차를 가하며 TSMC와의 기술 격차를 줄이기 위해 노력하고 있습니다.

💡 투자 참고사항
반도체 업황 회복과 AI 수요 증가로 중장기적 성장이 기대되나, 단기 변동성에 유의하시기 바랍니다.`,
      generatedAt: "2025-01-27 오전 9:30",
    },
  },
  "2": {
    name: "Apple",
    ticker: "AAPL",
    report: {
      content: `📊 Apple 주요 이슈 요약 (최근 7일)

1. Vision Pro 2세대 개발
Apple이 차세대 Vision Pro 개발에 집중하고 있으며, 더 가벼운 무게와 향상된 성능이 예상됩니다.

2. AI 전략 강화
Apple Intelligence가 더 많은 국가에서 출시될 예정이며, Siri의 대폭 업그레이드가 진행 중입니다.

3. 서비스 매출 성장
App Store, Apple Music, iCloud 등 서비스 부문 매출이 지속적으로 성장하고 있습니다.

💡 투자 참고사항
강력한 브랜드 충성도와 서비스 수익 증가가 긍정적이나, 스마트폰 시장 포화에 대한 우려가 있습니다.`,
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
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-6">
          <p className="text-center text-muted-foreground">
            종목을 찾을 수 없습니다.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
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
          {/* Stock Info Card */}
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

          {/* AI Report */}
          <AIReport stockName={stock.name} existingReport={stock.report} />
        </div>
      </main>
    </div>
  );
}
