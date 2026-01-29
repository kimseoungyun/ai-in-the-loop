import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
            <div className="flex max-w-md flex-col items-center justify-center space-y-6">
                <div className="rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/30">
                    <FileQuestion className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        페이지를 찾을 수 없습니다
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700"
                >
                    메인으로 돌아가기
                </Link>
            </div>
        </div>
    );
}
