"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StockCard } from "@/components/domain/stocks/stock-card";
import { EmptyState } from "@/components/domain/stocks/empty-state";
import { Plus } from "lucide-react";

interface Stock {
  id: string;
  name: string;
  ticker?: string;
  hasReport: boolean;
}

interface StockListSectionProps {
  stocks: Stock[];
}

export function StockListSection({ stocks }: StockListSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">내 관심 종목</h2>
          <p className="text-sm text-muted-foreground">
            {stocks.length > 0
              ? `${stocks.length}개의 종목을 추적 중입니다`
              : "종목을 추가해보세요"}
          </p>
        </div>
        <Link href="/stocks/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            종목 추가
          </Button>
        </Link>
      </div>

      {stocks.length > 0 ? (
        <div className="space-y-3">
          {stocks.map((stock) => (
            <StockCard
              key={stock.id}
              id={stock.id}
              name={stock.name}
              ticker={stock.ticker}
              hasReport={stock.hasReport}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
