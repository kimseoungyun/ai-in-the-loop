"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createStock, State } from "@/actions/stocks";
import { useActionState } from "react";
import { toast } from "sonner";

const initialState: State = { error: null };

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? "등록 중..." : "등록하기"}
        </Button>
    );
}

export function StockCreateDialog() {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(createStock, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success("종목이 추가되었습니다.");
            setOpen(false);
        } else if (state.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    종목 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>관심 종목 추가</DialogTitle>
                    <DialogDescription>
                        투자를 기록하고 싶은 종목 정보를 입력하세요.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">종목명</Label>
                        <Input id="name" name="name" placeholder="예: 삼성전자" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ticker">티커 / 종목코드 (선택)</Label>
                        <Input id="ticker" name="ticker" placeholder="예: 005930" />
                    </div>
                    <DialogFooter className="mt-2">
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
