"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">하루투자</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-2">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium leading-none">{user.user_metadata.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              </div>
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border shadow-sm">
                {user.user_metadata.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-xs font-medium">{user.email?.[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-4 w-[1px] bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="group flex items-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">로그아웃</span>
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" className="font-medium px-6">
              로그인
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
