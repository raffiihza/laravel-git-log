import React from 'react';
import { Head, Link } from '@inertiajs/react';

interface ProjectLog {
    id: number;
    name: string;
    log_path: string;
    description?: string;
    is_active: boolean;
}

interface Props {
    projectLog: ProjectLog;
    filename: string;
    content: string;
    size: number;
    modified: string;
}

export default function ViewLog({ projectLog, filename, content, size, modified }: Props) {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title={`${filename} - ${projectLog.name}`} />
            <div className="min-h-screen bg-gray-900">
                {/* Header */}
                <header className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/project-logs"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <div>
                                    <h1 className="text-lg font-semibold text-white">{filename}</h1>
                                    <p className="text-sm text-gray-400">
                                        {projectLog.name} • {formatFileSize(size)} • {modified}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleRefresh}
                                    className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                                >
                                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                                >
                                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Log Content */}
                <div className="p-4">
                    <div className="max-w-7xl mx-auto">
                        <pre className="text-sm text-green-400 whitespace-pre-wrap break-words font-mono leading-relaxed">
                            {content || '(File kosong)'}
                        </pre>
                    </div>
                </div>
            </div>
        </>
    );
}
