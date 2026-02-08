"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/types/supabase";
import Link from "next/link";

type Stock = Database["public"]["Tables"]["HT_STOCK"]["Row"];

interface StockListProps {
    stocks: Stock[];
}

export function StockList({ stocks }: StockListProps) {
    if (stocks.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                등록된 종목이 없습니다.
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stocks.map((stock) => (
                <Link
                    key={stock.HT_STOCK_ID}
                    href={`/stocks/${stock.HT_STOCK_ID}`}
                    className="block transition-transform hover:scale-105"
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stock.HT_TICKER || "N/A"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stock.HT_NAME}</div>
                            <p className="text-xs text-muted-foreground">
                                등록일: {new Date(stock.created_at).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
