import { Card, CardContent } from "@/components/ui/card";
import { Bell, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "매일 알림",
    description: "원하는 시간에 투자 리포트를 받아보세요",
  },
  {
    icon: BarChart3,
    title: "맞춤 분석",
    description: "관심 종목에 대한 상세 분석을 제공합니다",
  },
  {
    icon: Zap,
    title: "빠른 인사이트",
    description: "핵심 정보만 간결하게 정리해 드립니다",
  },
];

export function FeaturesSection() {
  return (
    <section className="space-y-3 pb-16">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.title} className="border-border">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{feature.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
