"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "@/components/domain/home/hero-section";
import { FeaturesSection } from "@/components/domain/home/features-section";
import { StockListSection } from "@/components/domain/home/stock-list-section";
import { NotificationSchedule } from "@/components/domain/home/notification-schedule";

// Mock data for demonstration
const MOCK_STOCKS = [
  { id: "1", name: "삼성전자", ticker: "005930", hasReport: true },
  { id: "2", name: "Apple", ticker: "AAPL", hasReport: true },
  { id: "3", name: "테슬라", ticker: "TSLA", hasReport: false },
];

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [stocks, setStocks] = useState<typeof MOCK_STOCKS>([]);

  useEffect(() => {
    // TODO: 실제 인증 시스템 연동 시 수정 필요
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const name = localStorage.getItem("userName") || "사용자";
    setIsLoggedIn(loggedIn);
    setUserName(name);
    if (loggedIn) {
      setStocks(MOCK_STOCKS);
    }
  }, []);

  if (!isLoggedIn) {
    // 랜딩 페이지 (비로그인 상태)
    return (
      <div className="mx-auto max-w-2xl px-4">
        <HeroSection />
        <FeaturesSection />
      </div>
    );
  }

  // 대시보드 (로그인 상태)
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="space-y-6">
        {/* Notification Schedule - Phase 2 기능 (현재는 UI만) */}
        <NotificationSchedule />

        {/* Stock List */}
        <StockListSection stocks={stocks} />
      </div>
    </div>
  );
}
