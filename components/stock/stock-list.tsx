import { StockCard } from "./stock-card";

interface Stock {
    HT_STOCK_ID: string;
    HT_NAME: string;
    HT_TICKER: string;
}

interface StockListProps {
    stocks: Stock[];
}

export function StockList({ stocks }: StockListProps) {
    if (stocks.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-card/50">
                <h3 className="text-lg font-semibold text-muted-foreground">
                    등록된 종목이 없습니다.
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    우측 상단의 버튼을 눌러 첫 종목을 추가해보세요!
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stocks.map((stock) => (
                <StockCard
                    key={stock.HT_STOCK_ID}
                    id={stock.HT_STOCK_ID}
                    name={stock.HT_NAME}
                    ticker={stock.HT_TICKER}
                />
            ))}
        </div>
    );
}
