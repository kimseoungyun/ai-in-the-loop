import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bot, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { generateReport } from "@/actions/reports";
import { GenerateButton } from "@/components/report/generate-button";
import { AIReport } from "@/components/domain/reports/ai-report";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StockDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Stock Info
  const { data: stock, error: stockError } = await supabase
    .from("HT_STOCK")
    .select("*")
    .eq("HT_STOCK_ID", id)
    .single();

  if (stockError || !stock) {
    notFound();
  }

  // 2. Fetch Latest Report
  const { data: reports } = await supabase
    .from("HT_REPORT")
    .select("*")
    .eq("HT_STOCK_ID", id)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestReport = reports?.[0];

  const reportData = latestReport ? {
    content: latestReport.HT_CONTENT,
    generatedAt: new Date(latestReport.created_at).toLocaleString("ko-KR"),
  } : null;

  return (
    <div className="flex-1 p-8 pt-6 space-y-6 max-w-4xl mx-auto">
      {/* Header / Nav */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{stock.HT_NAME}</h2>
          <p className="text-muted-foreground">{stock.HT_TICKER}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content: Report */}
        <div className="md:col-span-2 space-y-6">
          <AIReport
            stockId={id}
            stockName={stock.HT_NAME}
            existingReport={reportData}
          />
        </div>

        {/* Sidebar: Meta Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">종목 정보</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">등록일</span>
                <span className="font-medium">{new Date(stock.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">티커</span>
                <span className="font-medium">{stock.HT_TICKER}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
