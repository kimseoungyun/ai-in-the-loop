"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function GenerateButton() {
    const { pending } = useFormStatus();

    return (
        <Button size="sm" type="submit" disabled={pending} className="gap-2">
            {pending ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    분석 중...
                </>
            ) : (
                <>
                    <Sparkles className="h-4 w-4" />
                    AI 리포트 생성
                </>
            )}
        </Button>
    );
}
