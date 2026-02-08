"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createStock, State } from "@/actions/stocks";

const initialState: State = { error: null };

export function StockCreateFormPage() {
    const router = useRouter();

    const [state, formAction, isPending] = useActionState(createStock, initialState);

    // Manage input state for validation enablement
    const [name, setName] = useState("");
    const [ticker, setTicker] = useState("");

    useEffect(() => {
        if (state.success) {
            toast.success("종목이 추가되었습니다.");
            router.push("/");
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state, router]);

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    돌아가기
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">종목 추가</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                종목명 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="예: 삼성전자"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-12"
                            />
                            <p className="text-xs text-muted-foreground">
                                관심 있는 주식의 회사명을 입력하세요.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ticker">
                                티커 <span className="text-muted-foreground">(선택)</span>
                            </Label>
                            <Input
                                id="ticker"
                                name="ticker"
                                type="text"
                                placeholder="예: 005930"
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                                className="h-12"
                            />
                            <p className="text-xs text-muted-foreground">
                                종목 코드가 있다면 입력하세요.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/")}
                                className="flex-1"
                            >
                                취소
                            </Button>
                            <Button
                                type="submit"
                                disabled={!name.trim() || isPending}
                                className="flex-1"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isPending ? "저장 중..." : "저장"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
