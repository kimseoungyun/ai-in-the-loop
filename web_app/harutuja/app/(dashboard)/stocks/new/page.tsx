"use client";

import { StockForm } from "@/components/domain/stocks/stock-form";

export default function NewStockPage() {
  const handleSubmit = (data: { name: string; ticker: string }) => {
    // tmp-vo와 동일하게: 현재는 저장 로직 없이 로그만 남김
    console.log("[harutuja] Saving stock:", data);
  };

  return (
    <main className="py-2">
      <StockForm onSubmit={handleSubmit} />
    </main>
  );
}
