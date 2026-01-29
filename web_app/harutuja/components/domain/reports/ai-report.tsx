"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw, Sparkles } from "lucide-react";

interface AIReportProps {
  stockName: string;
  existingReport?: {
    content: string;
    generatedAt: string;
  } | null;
}

// NOTE: 현재 MVP는 mock 동작(Phase 1). 실제 AI/DB 연동은 `app/(dashboard)/api/reports` 구현 후 교체.
async function generateAIReport(stockName: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return `📊 ${stockName} 주요 이슈 요약 (최근 7일)

1. 시장 동향
최근 ${stockName} 관련 뉴스 흐름을 종합하면 단기 변동성은 있으나, 업계 전반의 관심도는 유지되고 있습니다.

2. 기업 이슈
공시/발표/제품/사업 관련 핵심 이슈를 요약해 투자 판단에 필요한 포인트만 정리했습니다.

3. 투자자 관점 메모
리스크(단기 변동성, 이벤트)와 기회(중장기 모멘텀)를 함께 확인하세요.

⚠️ 본 리포트는 참고용 요약이며, 투자 결정의 책임은 본인에게 있습니다.`;
}

export function AIReport({ stockName, existingReport }: AIReportProps) {
  const [report, setReport] = useState(existingReport ?? null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const content = await generateAIReport(stockName);
      setReport({
        content,
        generatedAt: new Date().toLocaleString("ko-KR"),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          AI 요약 리포트
        </CardTitle>
        {report && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="text-muted-foreground"
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            새로고침
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {report ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {report.content}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>생성일시: {report.generatedAt}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {stockName}의 최근 주요 이슈를
              <br />
              AI가 분석하여 요약해드립니다.
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI 요약 생성
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

