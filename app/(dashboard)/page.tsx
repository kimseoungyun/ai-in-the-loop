import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StockList } from "@/components/stock/stock-list";
import { StockCreateDialog } from "@/components/stock/stock-create-dialog";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: stocks } = await supabase
        .from("HT_STOCK")
        .select("*")
        .eq("HT_PROFILE_ID", user.id)
        .order("HT_CREATED_AT", { ascending: false });

    return (
        <div className="flex-1 p-8 pt-6 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
                    <p className="text-muted-foreground mt-2">
                        어서오세요, {user.user_metadata.full_name || user.email}님! 오늘의 투자 리포트를 확인하세요.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <StockCreateDialog />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-tight">내 관심 종목</h3>
                {/* @ts-ignore : Supabase type mapping slightly off strictly but safe here */}
                <StockList stocks={stocks ?? []} />
            </div>
        </div>
    );
}
