import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex-1 p-8 pt-6 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-[150px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-10 w-[100px]" />
            </div>

            <div className="space-y-4">
                {/* Notification Schedule Placeholder */}
                <Skeleton className="h-[80px] w-full rounded-lg" />

                <Skeleton className="h-7 w-[120px]" />

                {/* Stock List Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[150px] w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
