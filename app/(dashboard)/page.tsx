import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/domain/home/hero-section";
import { FeaturesSection } from "@/components/domain/home/features-section";
import { StockListSection } from "@/components/domain/home/stock-list-section";
import { NotificationSchedule } from "@/components/domain/home/notification-schedule";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

export default async function HomePage() {
    const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // 랜딩 페이지 (비로그인 상태)
        return (
            <div className="mx-auto max-w-2xl px-4">
                <HeroSection />
                <FeaturesSection />
            </div>
        );
    }

    // 로그인 상태: 사용자 주식 목록 가져오기
    const { data: stocks } = await supabase
        .from("HT_STOCK")
        .select("*")
        .eq("HT_PROFILE_ID", user.id)
        .order("created_at", { ascending: false });

    // DB 데이터 타입을 UI 컴포넌트 데이터 타입으로 매핑
    const stocksForDisplay = stocks?.map((stock) => ({
        id: stock.HT_STOCK_ID,
        name: stock.HT_NAME,
        ticker: stock.HT_TICKER || undefined,
        hasReport: false, // TODO: 실제 리포트 보유 여부 확인 로직 추가 필요 (지금은 기본값)
    })) || [];

    // 리포트 보유 여부를 확인하기 위해 별도 쿼리가 필요할 수 있지만, 
    // 현재는 간단하게 모든 주식 목록만 보여주고 AI 레포트는 상세에서 확인하도록 함.
    // 성능 최적화를 위해 차후 join 쿼리 등으로 개선 가능.

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="space-y-6">
                {/* Notification Schedule - Phase 2 기능 (현재는 UI만) */}
                <NotificationSchedule />

                {/* Stock List */}
                <StockListSection stocks={stocksForDisplay} />
            </div>
        </div>
    );
}
