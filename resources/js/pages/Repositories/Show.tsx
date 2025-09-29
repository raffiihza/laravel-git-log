import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';

interface Repository {
    id: number;
    name: string;
    git_log_path: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    repository: Repository;
}

export default function ShowRepository({ repository }: Props) {
    const [gitLogData, setGitLogData] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const fetchGitLog = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`/api/git-log/${repository.id}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch git log');
            }
            
            setGitLogData(data.git_log);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGitLog();
    }, []);

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${repository.name}"?`)) {
            router.delete(`/repositories/${repository.id}`);
        }
    };

    return (
        <>
            <Head title={repository.name} />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{repository.name}</h1>
                                {repository.description && (
                                    <p className="mt-1 text-sm text-gray-500">{repository.description}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/repositories"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    Back to List
                                </Link>
                                <Link
                                    href={`/repositories/${repository.id}/edit`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Repository Details */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Repository Details</h2>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{repository.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Path</dt>
                                            <dd className="mt-1 text-sm text-gray-900 break-all">{repository.git_log_path}</dd>
                                        </div>
                                        {repository.description && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{repository.description}</dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Created</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Date(repository.created_at).toLocaleDateString()}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Date(repository.updated_at).toLocaleDateString()}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        {/* Git Log Preview */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-medium text-gray-900">Git Log Preview</h2>
                                        <button
                                            onClick={fetchGitLog}
                                            disabled={loading}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                            {error}
                                        </div>
                                    )}

                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                                            <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                                                {gitLogData || 'No git log data available'}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}