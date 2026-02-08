'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-4">
            <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">문제가 발생했습니다</h2>
            <p className="text-muted-foreground max-w-md">
                페이지를 불러오는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
                <br />
                <span className="text-xs opacity-70">({error.message})</span>
            </p>
            <div className="flex gap-2">
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    홈으로
                </Button>
                <Button onClick={() => reset()}>
                    다시 시도
                </Button>
            </div>
        </div>
    );
}
