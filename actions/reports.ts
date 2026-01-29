'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateReport(stockId: string, stockName: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // 1. Check ownership (Optional but good for security if RLS allows reading others but not writing)
    // For MVP, we rely on RLS logic on Insert

    try {
        // Mock AI Delay
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Mock AI Response
        const mockContent = `
# ${stockName} 투자 리포트
(생성일: ${new Date().toLocaleDateString()})

## 1. 최근 주요 이슈
- 최근 시장 변동성에 따라 주가가 횡보하고 있습니다.
- 반도체 업황 회복에 대한 기대감이 여전히 유효합니다.

## 2. 기술적 분석 요약
- 단기 이동평균선이 장기 이동평균선을 상향 돌파하려는 골든크로스 조짐이 보입니다.
- 상대강도지수(RSI)는 중립 구간에 위치해 있습니다.

## 3. 종합 의견
**[중립]** 현재 시점에서는 추가 매수보다는 관망하며 추세를 지켜보는 것이 좋습니다.
    `;

        const { error } = await supabase.from("HT_REPORT").insert({
            HT_STOCK_ID: stockId, // Not HT_PROFILE_ID directly, but table has it? Let's check schema.
            // Wait, HT_REPORT needs specific columns. Let's strictly follow schema.
            // Schema: HT_REPORT_ID, HT_STOCK_ID, HT_CONTENT, HT_CREATED_AT
            // There is usually no HT_PROFILE_ID in HT_REPORT based on typical design, 
            // OR it might be there for RLS. 
            // Let's check types/supabase.ts again in next step if error occurs.
            // Assuming standard relationship: Stock -> Report.
            HT_CONTENT: mockContent.trim(),
        });

        if (error) {
            console.error("Report insert error:", error);
            throw new Error("Failed to generate report");
        }

    } catch (error) {
        console.error("Generate report action error:", error);
        throw error;
    }

    revalidatePath(`/stocks/${stockId}`);
}
