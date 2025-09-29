import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface Repository {
    id: number;
    name: string;
    git_log_path: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    repositories: Repository[];
}

export default function RepositoryIndex({ repositories }: Props) {
    const { auth } = usePage<SharedData>().props;

    const handleDelete = (repository: Repository) => {
        if (window.confirm(`Are you sure you want to delete "${repository.name}"?`)) {
            router.delete(`/repositories/${repository.id}`);
        }
    };

    return (
        <>
            <Head title="Manage Repositories" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Manage Repositories</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add, edit, or remove git repositories
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    View Dashboard
                                </Link>
                                <Link
                                    href="/repositories/create"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Add Repository
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        {repositories.length === 0 ? (
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
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by adding a new repository.</p>
                                <div className="mt-6">
                                    <Link
                                        href="/repositories/create"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Add Repository
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {repositories.map((repository) => (
                                    <li key={repository.id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {repository.name}
                                                    </h3>
                                                    {repository.description && (
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {repository.description}
                                                        </p>
                                                    )}
                                                    <div className="mt-2">
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Path:</span> {repository.git_log_path}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Created: {new Date(repository.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={`/repositories/${repository.id}`}
                                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/repositories/${repository.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(repository)}
                                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}