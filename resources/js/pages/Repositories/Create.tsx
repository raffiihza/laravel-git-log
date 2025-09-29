import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface FormData {
    name: string;
    git_log_path: string;
    description: string;
}

export default function CreateRepository() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        git_log_path: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/repositories');
    };

    return (
        <>
            <Head title="Add Repository" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Add Repository</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add a new git repository to the dashboard
                                </p>
                            </div>
                            <Link
                                href="/repositories"
                                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                            >
                                Back to Repositories
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Repository Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="My Awesome Project"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="git_log_path" className="block text-sm font-medium text-gray-700">
                                        Git Repository Path *
                                    </label>
                                    <input
                                        type="text"
                                        id="git_log_path"
                                        value={data.git_log_path}
                                        onChange={(e) => setData('git_log_path', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="/path/to/your/git/repository"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Full path to the git repository directory (must contain .git folder)
                                    </p>
                                    {errors.git_log_path && (
                                        <p className="mt-1 text-sm text-red-600">{errors.git_log_path}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Brief description of this repository..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href="/repositories"
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Adding...' : 'Add Repository'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}