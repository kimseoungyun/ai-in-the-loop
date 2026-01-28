import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-balance text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        매일 아침,
        <br />
        투자 인사이트를 받아보세요
      </h1>
      <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">
        관심 종목의 투자 리포트를
        <br />
        이메일 또는 카카오톡으로 받아보세요
      </p>
      <div className="mt-8">
        <Link href="/login">
          <Button size="lg" className="px-8">
            시작하기
          </Button>
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">
          Google 계정으로 간편하게 시작하세요
        </p>
      </div>
    </section>
  );
}
