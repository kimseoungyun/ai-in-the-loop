"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RefreshCw, Clock } from "lucide-react";

interface AIReportProps {
  stockName: string;
  existingReport?: {
    content: string;
    generatedAt: string;
  } | null;
}

// Mock AI generation function
async function generateAIReport(stockName: string): Promise<string> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return `${stockName} 주요 이슈 요약 (최근 7일)

1. 시장 동향 분석
최근 ${stockName} 관련 주요 뉴스와 시장 동향을 분석한 결과, 업계 전반의 흐름과 함께 변동성이 관찰되고 있습니다.

2. 기업 이슈
${stockName}의 최신 사업 현황과 관련된 주요 발표 및 뉴스를 종합하였습니다.

3. 전문가 의견
여러 증권사 애널리스트들의 의견을 종합한 결과, 중립적인 전망이 우세합니다.

투자 참고사항: 본 리포트는 참고용이며, 실제 투자 결정 시에는 추가적인 분석이 필요합니다.`;
}

export function AIReport({ stockName, existingReport }: AIReportProps) {
  const [report, setReport] = useState(existingReport);
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
