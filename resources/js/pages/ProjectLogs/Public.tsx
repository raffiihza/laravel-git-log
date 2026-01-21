import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

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
    projectLogs: ProjectLog[];
}

export default function PublicProjectLogs({ projectLogs }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [selectedProject, setSelectedProject] = useState<ProjectLog | null>(null);
    const [logFiles, setLogFiles] = useState<LogFile[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [error, setError] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        if (projectLogs.length > 0 && !selectedProject) {
            selectProject(projectLogs[0]);
        }
    }, [projectLogs]);

    const selectProject = async (project: ProjectLog) => {
        setSelectedProject(project);
        setSearchQuery('');
        await fetchLogFiles(project.id);
    };

    const fetchLogFiles = async (projectId: number) => {
        setLoadingFiles(true);
        setError('');

        try {
            const response = await fetch(`/api/project-logs/${projectId}/files`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal memuat daftar file');
            }

            setLogFiles(data.logFiles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            setLogFiles([]);
        } finally {
            setLoadingFiles(false);
        }
    };

    const refreshFileList = () => {
        if (selectedProject) {
            fetchLogFiles(selectedProject.id);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const openLogFile = (file: LogFile) => {
        if (!selectedProject) return;
        const url = `/project-logs/${selectedProject.id}/view?file=${encodeURIComponent(file.name)}`;
        window.open(url, '_blank');
    };

    // Filter log files based on search query
    const filteredLogFiles = logFiles.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Head title="Project Logs" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Project Logs</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Lihat log dari berbagai project CI4
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/"
                                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    Git Log
                                </Link>
                                <Link
                                    href="/frontend"
                                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    Frontend
                                </Link>
                                {auth?.user && (
                                    <Link
                                        href="/project-logs/manage"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        Kelola
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {projectLogs.length === 0 ? (
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada project log</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Belum ada project log yang aktif.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {/* File Manager Container */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            {/* Toolbar */}
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <label htmlFor="project-select" className="text-sm font-medium text-gray-700">
                                            Project:
                                        </label>
                                        <select
                                            id="project-select"
                                            value={selectedProject?.id || ''}
                                            onChange={(e) => {
                                                const project = projectLogs.find(p => p.id === parseInt(e.target.value));
                                                if (project) selectProject(project);
                                            }}
                                            className="block w-56 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-900"
                                        >
                                            {projectLogs.map((project) => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={refreshFileList}
                                            disabled={loadingFiles}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            title="Refresh daftar file"
                                        >
                                            <svg className={`h-4 w-4 ${loadingFiles ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Cari file..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                            />
                                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                {selectedProject?.description && (
                                    <p className="mt-2 text-sm text-gray-500">{selectedProject.description}</p>
                                )}
                            </div>

                            {/* File List Header */}
                            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
                                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-6">Nama File</div>
                                    <div className="col-span-3 text-right">Ukuran</div>
                                    <div className="col-span-3 text-right">Terakhir Diubah</div>
                                </div>
                            </div>

                            {/* File List */}
                            <div className="divide-y divide-gray-100 max-h-[calc(100vh-300px)] overflow-y-auto">
                                {loadingFiles ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-500">Memuat...</span>
                                    </div>
                                ) : error ? (
                                    <div className="p-4">
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                            <div className="flex">
                                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <p className="ml-3 text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : filteredLogFiles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {searchQuery ? 'Tidak ada file yang cocok.' : 'Tidak ada file log ditemukan.'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredLogFiles.map((file, index) => (
                                        <button
                                            key={file.name}
                                            onClick={() => openLogFile(file)}
                                            className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left focus:outline-none focus:bg-blue-50"
                                        >
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-6 flex items-center min-w-0">
                                                    <svg className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div className="flex items-center min-w-0">
                                                        {index === 0 && !searchQuery && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2 flex-shrink-0">
                                                                Terbaru
                                                            </span>
                                                        )}
                                                        <span className="text-sm font-medium text-gray-900 truncate">
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-span-3 text-right">
                                                    <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                                                </div>
                                                <div className="col-span-3 text-right">
                                                    <span className="text-sm text-gray-500">{file.modified_formatted}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>
                                        {filteredLogFiles.length} file{filteredLogFiles.length !== 1 ? '' : ''} 
                                        {searchQuery && logFiles.length !== filteredLogFiles.length && ` (dari ${logFiles.length} total)`}
                                    </span>
                                    <span className="text-xs">Klik file untuk membuka di tab baru</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
