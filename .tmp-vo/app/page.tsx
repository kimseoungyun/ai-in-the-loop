"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StockCard } from "@/components/stock-card";
import { EmptyState } from "@/components/empty-state";
import { NotificationSchedule } from "@/components/notification-schedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Bell, BarChart3, Zap, LogOut, User } from "lucide-react";

// Mock data for demonstration
const MOCK_STOCKS = [
  { id: "1", name: "삼성전자", ticker: "005930", hasReport: true },
  { id: "2", name: "Apple", ticker: "AAPL", hasReport: true },
  { id: "3", name: "테슬라", ticker: "TSLA", hasReport: false },
];

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [stocks, setStocks] = useState<typeof MOCK_STOCKS>([]);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const name = localStorage.getItem("userName") || "사용자";
    setIsLoggedIn(loggedIn);
    setUserName(name);
    if (loggedIn) {
      setStocks(MOCK_STOCKS);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserName("");
    setStocks([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-4 w-4 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 3v18h18" />
                <path d="M18 9l-5 5-4-4-3 3" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">하루 투자</span>
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{userName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              로그인
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        {!isLoggedIn ? (
          // Landing Page
          <div className="mx-auto max-w-2xl px-4">
            {/* Hero Section */}
            <section className="py-16 text-center">
              <h1 className="text-balance text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                매일 아침,
                <br />
                투자 인사이트를 받아보세요
              </h1>
              <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">
                관심 종목의 투자 리포트를
                <br />
                이메일 또는 카카오톡으로 받아보세요
              </p>
              <div className="mt-8">
                <Link href="/login">
                  <Button size="lg" className="px-8">
                    시작하기
                  </Button>
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  Google 계정으로 간편하게 시작하세요
                </p>
              </div>
            </section>

            {/* Features */}
            <section className="space-y-3 pb-16">
              <Card className="border-border">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Bell className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">매일 알림</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      원하는 시간에 투자 리포트를 받아보세요
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <BarChart3 className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">맞춤 분석</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      관심 종목에 대한 상세 분석을 제공합니다
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Zap className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">빠른 인사이트</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      핵심 정보만 간결하게 정리해 드립니다
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : (
          // Logged in - Dashboard
          <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="space-y-6">
              {/* Notification Schedule */}
              <NotificationSchedule />

              {/* Stock List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      내 관심 종목
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {stocks.length > 0
                        ? `${stocks.length}개의 종목을 추적 중입니다`
                        : "종목을 추가해보세요"}
                    </p>
                  </div>
                  <Link href="/add">
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
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          하루 투자 | 매일 투자 리포트
        </p>
      </footer>
    </div>
  );
}
