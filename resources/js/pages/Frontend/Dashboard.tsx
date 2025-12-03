import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface FolderItem {
    name: string;
    path: string;
    modified_at: number;
    modified_at_formatted: string;
    modified_at_human: string;
}

interface Props {
    folders: FolderItem[];
    frontendPath: string;
    error: string | null;
}

export default function FrontendDashboard({ folders, frontendPath, error }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [folderList, setFolderList] = useState<FolderItem[]>(folders);
    const [loading, setLoading] = useState(false);
    const [refreshError, setRefreshError] = useState<string>('');

    const refreshFolders = async () => {
        setLoading(true);
        setRefreshError('');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch('/api/frontend/folders', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Failed to fetch folders');
            }
            
            setFolderList(data.folders);
        } catch (err) {
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    setRefreshError('Request timed out. Please try again.');
                } else {
                    setRefreshError(err.message);
                }
            } else {
                setRefreshError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Frontend Projects" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Frontend Projects</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    View deployed frontend project folders
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    Git Log Dashboard
                                </Link>
                                {auth.user && (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                        >
                                            Admin Dashboard
                                        </Link>
                                        <Link
                                            href="/frontend/settings"
                                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                                        >
                                            Configure Path
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Error Display */}
                    {(error || refreshError) && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            {error || refreshError}
                        </div>
                    )}

                    {/* No Path Configured */}
                    {!frontendPath && (
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No frontend folder configured</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {auth.user 
                                    ? 'Please configure the frontend folder path in settings.'
                                    : 'Contact the administrator to configure the frontend folder path.'}
                            </p>
                            {auth.user && (
                                <div className="mt-4">
                                    <Link
                                        href="/frontend/settings"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Configure Path
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Folder List */}
                    {frontendPath && !error && (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">Project Folders</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Path: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{frontendPath}</code>
                                        </p>
                                    </div>
                                    <button
                                        onClick={refreshFolders}
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>

                                {folderList.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                            />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No folders found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            The configured folder is empty or contains no subdirectories.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Folder Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Last Modified
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Relative Time
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {folderList.map((folder, index) => (
                                                    <tr key={folder.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <svg
                                                                    className="h-5 w-5 text-yellow-500 mr-3"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                    <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                                                                </svg>
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {folder.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm text-gray-600 font-mono">
                                                                {folder.modified_at_formatted}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm text-gray-500">
                                                                {folder.modified_at_human}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
