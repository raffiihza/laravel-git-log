import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';

interface LogFile {
    name: string;
    path: string;
    size: number;
    modified: number;
    modified_formatted: string;
}

interface ProjectLog {
    id: number;
    name: string;
    log_path: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    projectLog: ProjectLog;
    logFiles: LogFile[];
}

interface LogContent {
    content: string;
    filename: string;
    size: number;
    modified: string;
}

export default function ShowProjectLog({ projectLog, logFiles }: Props) {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [logContent, setLogContent] = useState<LogContent | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchLogContent = async (filename: string) => {
        setLoading(true);
        setError('');
        setSelectedFile(filename);

        try {
            const response = await fetch(`/api/project-logs/${projectLog.id}/content?file=${encodeURIComponent(filename)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal membaca file log');
            }

            setLogContent(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const refreshLogContent = () => {
        if (selectedFile) {
            fetchLogContent(selectedFile);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDelete = () => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus "${projectLog.name}"?`)) {
            router.delete(`/project-logs/manage/${projectLog.id}`);
        }
    };

    // Filter log files based on search query
    const filteredLogFiles = logFiles.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Head title={projectLog.name} />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <div className="flex items-center">
                                    <h1 className="text-3xl font-bold text-gray-900">{projectLog.name}</h1>
                                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${projectLog.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {projectLog.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>
                                {projectLog.description && (
                                    <p className="mt-1 text-sm text-gray-500">{projectLog.description}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/project-logs/manage"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    Kembali ke Daftar
                                </Link>
                                <Link
                                    href={`/project-logs/manage/${projectLog.id}/edit`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Project Log Details & File List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow rounded-lg mb-6">
                                <div className="px-4 py-5 sm:p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Detail Project Log</h2>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Nama</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{projectLog.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Path</dt>
                                            <dd className="mt-1 text-sm text-gray-900 break-all">{projectLog.log_path}</dd>
                                        </div>
                                        {projectLog.description && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Deskripsi</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{projectLog.description}</dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                                            <dd className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${projectLog.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {projectLog.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Dibuat</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Date(projectLog.created_at).toLocaleString('id-ID')}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* File List */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            File Log
                                            {logFiles.length > 0 && (
                                                <span className="ml-2 text-sm font-normal text-gray-500">
                                                    ({filteredLogFiles.length}/{logFiles.length})
                                                </span>
                                            )}
                                        </h2>
                                    </div>
                                    {/* Search input */}
                                    <input
                                        type="text"
                                        placeholder="Cari file log..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                    />
                                </div>
                                <div className="p-2">
                                    {filteredLogFiles.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            {searchQuery ? 'Tidak ada file yang cocok.' : 'Tidak ada file log ditemukan.'}
                                        </p>
                                    ) : (
                                        <ul className="divide-y divide-gray-100 max-h-[calc(100vh-500px)] overflow-y-auto">
                                            {filteredLogFiles.map((file, index) => (
                                                <li key={file.name}>
                                                    <button
                                                        onClick={() => fetchLogContent(file.name)}
                                                        className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-md transition-colors ${selectedFile === file.name ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center">
                                                                    {index === 0 && !searchQuery && (
                                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
                                                                            Terbaru
                                                                        </span>
                                                                    )}
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {file.name}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {formatFileSize(file.size)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Log Content */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Isi Log
                                            {logContent && (
                                                <span className="ml-2 text-sm font-normal text-gray-500">
                                                    - {logContent.filename}
                                                </span>
                                            )}
                                        </h2>
                                        {selectedFile && (
                                            <button
                                                onClick={refreshLogContent}
                                                disabled={loading}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                <svg className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Refresh
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    
                                    {loading && (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-500">Memuat...</span>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                            <div className="flex">
                                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <p className="ml-3 text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    )}

                                    {!loading && !error && !logContent && (
                                        <div className="text-center py-12">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Pilih file log dari daftar untuk melihat isinya
                                            </p>
                                        </div>
                                    )}

                                    {!loading && !error && logContent && (
                                        <div>
                                            <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                                                <span>Ukuran: {formatFileSize(logContent.size)}</span>
                                                <span>Terakhir diubah: {logContent.modified}</span>
                                            </div>
                                            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[calc(100vh-300px)]">
                                                <pre className="text-sm text-green-400 whitespace-pre-wrap break-words font-mono">
                                                    {logContent.content || '(File kosong)'}
                                                </pre>
                                            </div>
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
