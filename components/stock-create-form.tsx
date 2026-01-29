"use client";

import { createStock } from "@/actions/stocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTransition } from "react";

export function StockCreateForm() {
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await createStock(formData);
            if (result?.error) {
                alert(result.error);
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">새 종목 추가</h3>
            <div className="grid gap-2">
                <Label htmlFor="name">종목명</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="예: 삼성전자, 테슬라"
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="ticker">티커 (선택)</Label>
                <Input id="ticker" name="ticker" placeholder="예: 005930, TSLA" />
            </div>
            <Button type="submit" disabled={isPending}>
                {isPending ? "추가 중..." : "추가하기"}
            </Button>
        </form>
    );
}
