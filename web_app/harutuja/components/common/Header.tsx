"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function Header({
  isLoggedIn = false,
  userName = "사용자",
  onLogout,
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              className="h-4 w-4 text-primary-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
          </div>
          <span className="font-semibold text-foreground">하루투자</span>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{userName}</span>
            </div>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
