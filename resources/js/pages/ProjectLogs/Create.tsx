import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface FormData {
    name: string;
    log_path: string;
    description: string;
    is_active: boolean;
}

export default function CreateProjectLog() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        log_path: '',
        description: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/project-logs/manage');
    };

    return (
        <>
            <Head title="Tambah Project Log" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Tambah Project Log</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Tambahkan folder log project baru ke dashboard
                                </p>
                            </div>
                            <Link
                                href="/project-logs/manage"
                                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                            >
                                Kembali ke Daftar
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
                                        Nama Project *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 px-3 py-2"
                                        placeholder="CI4 Project"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="log_path" className="block text-sm font-medium text-gray-700">
                                        Path Folder Log *
                                    </label>
                                    <input
                                        type="text"
                                        id="log_path"
                                        value={data.log_path}
                                        onChange={(e) => setData('log_path', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 px-3 py-2"
                                        placeholder="/path/to/project/writable/logs"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Path lengkap ke folder log project (contoh: /var/www/ci4-project/writable/logs)
                                    </p>
                                    {errors.log_path && (
                                        <p className="mt-1 text-sm text-red-600">{errors.log_path}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 px-3 py-2"
                                        placeholder="Deskripsi singkat tentang project ini..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                        Aktif (tampilkan di dashboard publik)
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href="/project-logs/manage"
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Project Log'}
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
