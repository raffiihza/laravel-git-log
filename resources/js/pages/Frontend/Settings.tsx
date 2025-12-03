import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    frontendPath: string;
}

export default function FrontendSettings({ frontendPath }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        frontend_folder_path: frontendPath || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/frontend/settings');
    };

    return (
        <>
            <Head title="Frontend Settings" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Frontend Settings</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Configure the path to your frontend projects folder
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/frontend"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    View Frontend Projects
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Admin Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="frontend_folder_path" className="block text-sm font-medium text-gray-700">
                                        Frontend Folder Path *
                                    </label>
                                    <input
                                        type="text"
                                        id="frontend_folder_path"
                                        value={data.frontend_folder_path}
                                        onChange={(e) => setData('frontend_folder_path', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 px-3 py-2"
                                        placeholder="/var/www/frontend"
                                    />
                                    {errors.frontend_folder_path && (
                                        <p className="mt-1 text-sm text-red-600">{errors.frontend_folder_path}</p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500">
                                        Enter the absolute path to the folder containing your frontend project directories.
                                        This should be a folder that contains multiple frontend project subdirectories
                                        (e.g., <code className="bg-gray-100 px-1 rounded">/var/www/frontend</code> containing
                                        <code className="bg-gray-100 px-1 rounded">project-a/</code>,
                                        <code className="bg-gray-100 px-1 rounded">project-b/</code>, etc.)
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                About Frontend Monitoring
                                            </h3>
                                            <p className="mt-2 text-sm text-blue-700">
                                                This feature displays the last modification date of folders within the configured path.
                                                It's useful for monitoring frontend projects that are deployed via CD pipelines
                                                without git tracking. The modification date reflects when the folder contents
                                                were last updated (e.g., after a deployment).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href="/frontend"
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Settings'}
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
