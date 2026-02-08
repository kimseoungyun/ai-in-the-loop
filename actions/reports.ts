"use server";

import { genAI } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { revalidatePath } from "next/cache";

export type ReportState = {
    success?: boolean;
    error?: string | null;
    data?: {
        content: string;
    };
};

import { SupabaseClient } from "@supabase/supabase-js";

export async function generateReport(stockId: string, stockName: string): Promise<ReportState> {
    const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "로그인이 필요합니다." };
    }

    // Check ownership/existence of stock
    const { data: stock, error: stockError } = await supabase
        .from("HT_STOCK")
        .select("*")
        .eq("HT_STOCK_ID", stockId)
        .single();

    if (stockError || !stock) {
        return { error: "존재하지 않는 종목입니다." };
    }

    // Explicitly cast or check to ensure TS knows stock is the Row type
    const stockData = stock as Database['public']['Tables']['HT_STOCK']['Row'];

    if (stockData.HT_PROFILE_ID !== user.id) {
        return { error: "권한이 없습니다." };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
당신은 주식 시장 전문가입니다. 
'${stockName}' 종목에 대해 다음 내용을 포함하여 한국어로 리포트를 작성해주세요:

1. **미래 가치 예측**: 이 기업의 향후 성장 가능성과 주가 전망 (긍정적/부정적 요인 포함)
2. **최근 주요 이슈**: 최근 1개월 내의 주요 뉴스나 이벤트 요약
3. **투자 리스크**: 주의해야 할 위험 요소

형식은 마크다운으로 작성하고, 전문적인 어조를 유지하되 일반 투자자가 이해하기 쉽게 설명해주세요.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Save to DB
        const { error: insertError } = await supabase.from("HT_REPORT").insert({
            HT_PROFILE_ID: user.id,
            HT_STOCK_ID: stockId,
            HT_CONTENT: text,
        });

        if (insertError) {
            console.error("Report insert error:", insertError);
            return { error: "리포트 저장 중 오류가 발생했습니다." };
        }

        revalidatePath(`/stocks/${stockId}`);
        return { success: true, data: { content: text } };

    } catch (error) {
        console.error("AI Generation error:", error);
        return { error: "AI 리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
    }
}
