'use client';

import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';
import Link from 'next/link';

// Global Error components must include html and body tags
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
                    <div className="flex max-w-md flex-col items-center justify-center space-y-6">
                        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                            <AlertOctagon className="h-12 w-12 text-red-600 dark:text-red-400" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                심각한 오류가 발생했습니다
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                애플리케이션을 불러오는 데 문제가 생겼습니다. 새로고침하거나 나중에 다시 시도해주세요.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => reset()}
                                className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700"
                            >
                                새로고침
                            </button>

                            {/* Note: In a global-error state, Next.js generic Link might not work if routing is broken, 
                  but we can try a full reload or simple anchor tag if needed. 
                  However, standard Link usually attempts client-side nav. 
                  For critical failure, a hard navigation via window.location.href might be safer in button, 
                  but here we stick to UI patterns. */}
                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                            >
                                메인으로 이동
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
