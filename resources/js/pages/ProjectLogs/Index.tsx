import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';

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

export default function ProjectLogIndex({ projectLogs }: Props) {
    const { auth } = usePage<SharedData>().props;

    const handleDelete = (projectLog: ProjectLog) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus "${projectLog.name}"?`)) {
            router.delete(`/project-logs/manage/${projectLog.id}`);
        }
    };

    return (
        <>
            <Head title="Kelola Project Logs" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Kelola Project Logs</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Tambah, edit, atau hapus folder log project
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/project-logs"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    Lihat Dashboard
                                </Link>
                                <Link
                                    href="/project-logs/manage/create"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Tambah Project Log
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        {projectLogs.length === 0 ? (
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
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada project log</h3>
                                <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan project log baru.</p>
                                <div className="mt-6">
                                    <Link
                                        href="/project-logs/manage/create"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Tambah Project Log
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {projectLogs.map((projectLog) => (
                                    <li key={projectLog.id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {projectLog.name}
                                                        </h3>
                                                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${projectLog.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {projectLog.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                        </span>
                                                    </div>
                                                    {projectLog.description && (
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {projectLog.description}
                                                        </p>
                                                    )}
                                                    <div className="mt-2">
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Path:</span> {projectLog.log_path}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Dibuat: {new Date(projectLog.created_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={`/project-logs/manage/${projectLog.id}`}
                                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                    >
                                                        Lihat
                                                    </Link>
                                                    <Link
                                                        href={`/project-logs/manage/${projectLog.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(projectLog)}
                                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                    >
                                                        Hapus
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
