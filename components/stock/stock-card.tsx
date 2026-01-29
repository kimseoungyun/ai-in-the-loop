"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp } from "lucide-react";
import { deleteStock } from "@/actions/stocks";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StockCardProps {
    id: string;
    name: string;
    ticker: string;
}

export function StockCard({ id, name, ticker }: StockCardProps) {
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        if (confirm("정말로 이 종목을 삭제하시겠습니까?")) {
            await deleteStock(id);
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

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </Link>
    );
}
