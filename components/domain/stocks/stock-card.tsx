"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight, FileText } from "lucide-react";

interface StockCardProps {
  id: string;
  name: string;
  ticker?: string;
  hasReport?: boolean;
}

export function StockCard({ id, name, ticker, hasReport = false }: StockCardProps) {
  return (
    <Link href={`/stocks/${id}`}>
      <Card className="group flex items-center justify-between p-4 transition-all hover:border-primary/30 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <span className="text-sm font-semibold">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-foreground">{name}</h3>
            {ticker && (
              <p className="text-sm text-muted-foreground">{ticker}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasReport && (
            <div className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">
              <FileText className="h-3 w-3" />
              <span>리포트</span>
            </div>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
