"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, RefreshCw, Clock } from "lucide-react";
import { generateReport } from "@/actions/reports";
import { toast } from "sonner";

interface AIReportProps {
  stockId: string;
  stockName: string;
  existingReport?: {
    content: string;
    generatedAt: string;
  } | null;
}

export function AIReport({ stockId, stockName, existingReport }: AIReportProps) {
  const [report, setReport] = useState(existingReport);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateReport(stockId, stockName);
      if (result.success && result.data) {
        setReport({
          content: result.data.content,
          generatedAt: new Date().toLocaleString("ko-KR"),
        });
        toast.success("AI 리포트가 생성되었습니다.");
      } else {
        toast.error(result.error || "리포트 생성에 실패했습니다.");
      }
    } catch (error) {
      toast.error("알 수 없는 오류가 발생했습니다.");
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
              {stockName}의 미래 가치와 최근 이슈를
              <br />
              AI가 분석하여 예측 리포트를 제공합니다.
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
                  AI 리포트 생성
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
