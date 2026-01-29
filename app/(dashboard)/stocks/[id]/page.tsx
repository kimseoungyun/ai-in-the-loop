import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bot, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { generateReport } from "@/actions/reports";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StockDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

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
    .order("HT_CREATED_AT", { ascending: false })
    .limit(1);

  const latestReport = reports?.[0];

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
          <Card className="min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI 투자 리포트
                </CardTitle>
                {latestReport && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(latestReport.HT_CREATED_AT).toLocaleDateString()}
                    <Clock className="h-3 w-3" />
                    {new Date(latestReport.HT_CREATED_AT).toLocaleTimeString()}
                  </div>
                )}
              </div>

              <form action={async () => {
                "use server";
                await generateReport(id, stock.HT_NAME);
              }}>
                <GenerateButton />
              </form>
            </CardHeader>
            <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
              {latestReport ? (
                <ReactMarkdown>{latestReport.HT_CONTENT}</ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
                  <Bot className="h-12 w-12 opacity-20" />
                  <p>아직 생성된 리포트가 없습니다.<br />'리포트 생성' 버튼을 눌러 AI 등석을 시작해보세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Meta Info (Placeholder for now) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">종목 정보</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">등록일</span>
                <span className="font-medium">{new Date(stock.HT_CREATED_AT).toLocaleDateString()}</span>
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
