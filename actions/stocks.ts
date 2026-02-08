'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const CreateStockSchema = z.object({
    name: z.string().min(1, "종목명은 필수입니다."),
    ticker: z.string().optional().default(""),
});

export type State = {
    error?: string | null;
    success?: boolean;
};


export async function createStock(prevState: any, formData: FormData): Promise<State> {
    const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "로그인이 필요합니다." };
    }

    const validatedFields = CreateStockSchema.safeParse({
        name: formData.get("name"),
        ticker: formData.get("ticker"),
    });

    if (!validatedFields.success) {
        return {
            error: "입력값이 올바르지 않습니다.",
        };
    }

    const { name, ticker } = validatedFields.data;

    try {
        const { error } = await supabase.from("HT_STOCK").insert({
            HT_PROFILE_ID: user.id,
            HT_NAME: name,
            HT_TICKER: ticker,
        });

        if (error) {
            console.error("Stock insert error:", error);
            return { error: "종목 등록 중 오류가 발생했습니다." };
        }
    } catch (error) {
        console.error("Unexpected error:", error);
        return { error: "서버 오류가 발생했습니다." };
    }

    revalidatePath("/");
    return { success: true };
}

export async function deleteStock(stockId: string) {
    const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        const { error } = await supabase
            .from("HT_STOCK")
            .delete()
            .eq("HT_STOCK_ID", stockId)
            .eq("HT_PROFILE_ID", user.id);

        if (error) {
            console.error("Stock delete error:", error);
            throw new Error("Failed to delete stock");
        }
    } catch (error) {
        console.error("Delete action error:", error);
        throw error;
    }

    revalidatePath("/");
}
