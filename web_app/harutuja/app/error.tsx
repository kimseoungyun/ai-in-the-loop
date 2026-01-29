'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

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
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
            <div className="flex max-w-md flex-col items-center justify-center space-y-6">
                <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                    <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        오류가 발생했습니다
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        문제를 해결하기 위해 노력 중입니다. 잠시 후 다시 시도해주세요.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <p className="rounded bg-gray-200 p-2 text-xs font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {error.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={reset}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50"
                    >
                        다시 시도하기
                    </button>

                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 disabled:pointer-events-none disabled:opacity-50"
                    >
                        메인으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
