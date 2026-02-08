"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp } from "lucide-react";
import { deleteStock } from "@/actions/stocks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface StockCardProps {
    id: string;
    name: string;
    ticker: string;
}

export function StockCard({ id, name, ticker }: StockCardProps) {
    const router = useRouter();

    const onDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // 중요: AlertDialogAction 클릭 시에도 이벤트 전파 막아야 함
        try {
            await deleteStock(id);
            toast.success("종목이 삭제되었습니다.");
        } catch (error) {
            toast.error("삭제에 실패했습니다.");
        }
    };

    return (
        <Link href={`/stocks/${id}`} className="block group">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-border relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">{name}</CardTitle>
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <TrendingUp size={16} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">{ticker}</div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => e.stopPropagation()} // 카드 클릭 방지
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    이 작업은 되돌릴 수 없습니다. '{name}' 종목과 관련된 모든 리포트도 함께 삭제될 수 있습니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    삭제
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </Link>
    );
}
