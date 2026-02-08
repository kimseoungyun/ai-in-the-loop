"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { StockForm } from "@/components/stock-form";

export default function AddStockPage() {
  const [userName, setUserName] = useState("사용자");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "사용자";
    setUserName(name);
  }, []);

  const handleSubmit = (data: { name: string; ticker: string }) => {
    // In a real app, this would save to a database
    console.log("[v0] Saving stock:", data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} userName={userName} />

      <main className="py-2">
        <StockForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
