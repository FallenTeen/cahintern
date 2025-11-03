import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { Award, ChartLine, GraduationCap, Users } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-900">
            {/* === Left Section === */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex">
                {/* Background gradient & texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-400" />
                <div className="absolute inset-0 bg-black/30" />

                {/* Header logo */}
                <div className="relative z-10 flex items-center gap-3 p-10">
                    <Link
                        href={home()}
                        className="rounded-full bg-white/20 p-3 shadow-md"
                        aria-label="Home"
                    >
                        <GraduationCap className="h-10 w-10 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-wide text-white">
                            Dinas Pendidikan
                        </h1>
                        <p className="text-sm text-gray-200 opacity-90">
                            Kabupaten Banyumas
                        </p>
                    </div>
                </div>

                {/* Welcome Section */}
                <div className="relative z-10 mt-8 px-10">
                    <h2 className="text-4xl leading-snug font-extrabold text-white drop-shadow-sm">
                        Selamat Datang di{' '}
                        <span className="block text-yellow-200">
                            Portal Magang
                        </span>
                    </h2>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-100">
                        Sistem digital untuk pengelolaan kegiatan magang,
                        laporan harian, dan presensi peserta di lingkungan Dinas
                        Pendidikan Banyumas.
                    </p>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            aria-label="Manajemen Mahasiswa"
                            className="flex w-full items-center justify-center gap-4 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow"
                        >
                            <Users className="h-5 w-5" aria-hidden="true" />
                            <span>Manajemen Mahasiswa</span>
                        </button>

                        <button
                            type="button"
                            aria-label="Pemantauan Kemajuan"
                            className="flex w-full items-center justify-center gap-4 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow"
                        >
                            <ChartLine className="h-5 w-5" aria-hidden="true" />
                            <span>Pemantauan Kemajuan</span>
                        </button>

                        <div className="col-span-2">
                            <button
                                type="button"
                                aria-label="Sertifikasi"
                                className="flex w-55 items-center justify-start gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow"
                            >
                                <Award className="h-5 w-5" aria-hidden="true" />
                                <span>Sertifikasi</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-grow" />
            </div>

            {/* === Right Section (Form) === */}
            <div className="flex w-full items-center justify-center px-6 backdrop-blur-sm lg:w-1/2 lg:px-12">
                <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/80 p-8 shadow-xl dark:bg-zinc-800/80">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"></p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
