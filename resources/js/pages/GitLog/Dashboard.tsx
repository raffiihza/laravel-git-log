import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';

interface Repository {
    id: number;
    name: string;
    git_log_path: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface GitLogData {
    repository: Repository;
    git_log: string;
}

interface Props {
    repositories: Repository[];
}

export default function GitLogDashboard({ repositories }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
    const [gitLogData, setGitLogData] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [pulling, setPulling] = useState(false);
    const [error, setError] = useState<string>('');
    const [pullMessage, setPullMessage] = useState<string>('');
    const [viewMode, setViewMode] = useState<'simple' | 'detailed' | 'complete'>('simple');
    const [showAllBranches, setShowAllBranches] = useState(false);

    const fetchGitLog = async (repository: Repository, mode: 'simple' | 'detailed' | 'complete' = 'simple', allBranches: boolean = false) => {
        setLoading(true);
        setError('');
        setPullMessage('');
        
        try {
            let endpoint = `/api/git-log/${repository.id}`;
            if (mode === 'detailed') {
                endpoint = `/api/git-log/${repository.id}/detailed`;
            } else if (mode === 'complete') {
                endpoint = `/api/git-log/${repository.id}/complete`;
            }
            
            // Add all_branches parameter if enabled
            if (allBranches) {
                endpoint += '?all_branches=true';
            }
            
            // Add timeout to fetch request (15 seconds)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(endpoint, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment before refreshing.');
                } else if (response.status === 504) {
                    throw new Error('Request timed out. The repository might be too large or busy.');
                }
                throw new Error(data.error || 'Failed to fetch git log');
            }
            
            setGitLogData(data.git_log);
            setSelectedRepo(repository);
        } catch (err) {
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    setError('Request timed out. Please try again or select a different view mode.');
                } else {
                    setError(err.message);
                }
            } else {
                setError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGitPull = async () => {
        if (!selectedRepo) return;
        
        setPulling(true);
        setError('');
        setPullMessage('');
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 70000); // 70 seconds for git pull
            
            const response = await fetch(`/api/git-pull/${selectedRepo.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please login to perform git pull.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait before trying again.');
                } else if (response.status === 504) {
                    throw new Error('Git pull timed out. The repository might be large or the network is slow.');
                }
                throw new Error(data.error || 'Failed to perform git pull');
            }
            
            setPullMessage(data.message || 'Git pull completed successfully');
            
            // Refresh the git log after successful pull
            await fetchGitLog(selectedRepo, viewMode, showAllBranches);
        } catch (err) {
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    setError('Git pull request timed out. Please try again.');
                } else {
                    setError(err.message);
                }
            } else {
                setError('An error occurred during git pull');
            }
        } finally {
            setPulling(false);
        }
    };

    const refreshGitLog = () => {
        if (selectedRepo) {
            fetchGitLog(selectedRepo, viewMode, showAllBranches);
        }
    };

    return (
        <>
            <Head title="Git Log Dashboard" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Git Log Dashboard</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    View git logs from your repositories
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/frontend"
                                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
                                >
                                    Frontend Projects
                                </Link>
                                <Link
                                    href="/project-logs"
                                    className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700"
                                >
                                    Project Logs
                                </Link>
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={dashboard()}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                        >
                                            Admin Dashboard
                                        </Link>
                                        <Link
                                            href="/repositories"
                                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                                        >
                                            Manage Repositories
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        Admin Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Repository List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Repositories</h2>
                                    {repositories.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No repositories configured yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {repositories.map((repo) => (
                                                <div
                                                    key={repo.id}
                                                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                                        selectedRepo?.id === repo.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    onClick={() => fetchGitLog(repo, viewMode, showAllBranches)}
                                                >
                                                    <h3 className="font-medium text-gray-900">{repo.name}</h3>
                                                    {repo.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{repo.description}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">{repo.git_log_path}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Git Log Display */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            {selectedRepo ? `Git Log - ${selectedRepo.name}` : 'Select a Repository'}
                                        </h2>
                                        {selectedRepo && (
                                            <div className="flex items-center space-x-3">
                                                <select
                                                    value={viewMode}
                                                    onChange={(e) => {
                                                        const newMode = e.target.value as 'simple' | 'detailed' | 'complete';
                                                        setViewMode(newMode);
                                                        fetchGitLog(selectedRepo, newMode, showAllBranches);
                                                    }}
                                                    className="text-sm border-gray-300 rounded-md bg-white text-gray-900 px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="simple">Graph View</option>
                                                    <option value="detailed">Detailed View</option>
                                                    <option value="complete">Complete View (All Commits)</option>
                                                </select>
                                                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={showAllBranches}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setShowAllBranches(checked);
                                                            fetchGitLog(selectedRepo, viewMode, checked);
                                                        }}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span>All Branches</span>
                                                </label>
                                                <button
                                                    onClick={refreshGitLog}
                                                    disabled={loading}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {loading ? 'Refreshing...' : 'Refresh'}
                                                </button>
                                                {auth.user && (
                                                    <button
                                                        onClick={handleGitPull}
                                                        disabled={pulling || loading}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                                        title="Pull latest changes from remote repository"
                                                    >
                                                        {pulling ? 'Pulling...' : 'Git Pull'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {pullMessage && (
                                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                                            {pullMessage}
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                            {error}
                                        </div>
                                    )}

                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : selectedRepo ? (
                                        <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                                            <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                                                {gitLogData || 'No git log data available'}
                                            </pre>
                                        </div>
                                    ) : (
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
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No repository selected</h3>
                                            <p className="mt-1 text-sm text-gray-500">Choose a repository to view its git log</p>
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