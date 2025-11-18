import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Award,
    BookOpen,
    CheckCircle2,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';

type User = {
    name: string;
};

type PageProps = {
    auth?: {
        user: User;
    };
    jesonResponse: any;
    statistik: {
        totalPendaftar: number;
        pesertaAktif: number;
        logbookHariIni: number;
        sertifikatTerbit: number;
    };
    absensiMingguIni: Array<{
        day: string;
        hadir: number;
        izin: number;
        sakit: number;
        terlambat: number;
    }>;
    logbookMingguan: Array<{
        week: string;
        submitted: number;
        validated: number;
        revision: number;
    }>;
    absensiHariIni: {
        hadir: number;
        izin: number;
        sakit: number;
        terlambat: number;
        belumAbsen: number;
    };
    notifikasi: {
        pendaftarBaru: number;
        logbookPending: number;
    };
};

function BarChart({
    data,
}: {
    data: Array<{
        day: string;
        hadir: number;
        izin: number;
        sakit: number;
        terlambat: number;
    }>;
}) {
    const [hoveredDay, setHoveredDay] = useState<string | null>(null);
    const maxValue = Math.max(...data.map(item => item.hadir + item.izin + item.sakit + item.terlambat), 60);
    const colors = {
        hadir: '#10b981',
        izin: '#3b82f6',
        sakit: '#f59e0b',
        terlambat: '#ef4444',
    };

    const handleBarHover = (day: string, e: React.MouseEvent) => {
        setHoveredDay(day);
    };

    return (
        <div className="flex h-80 w-full flex-col">
            <div className="relative flex flex-1 items-end justify-around gap-2 pb-8">
                {data.map((item, idx) => {
                    const total = item.hadir + item.izin + item.sakit + item.terlambat;
                    const isHovered = hoveredDay === item.day;

                    return (
                        <div
                            key={idx}
                            className="group flex flex-1 cursor-pointer flex-col items-center gap-2"
                            onMouseEnter={(e) => handleBarHover(item.day, e)}
                            onMouseLeave={() => setHoveredDay(null)}
                        >
                            <div className="relative flex h-48 w-full items-end justify-center gap-0.5">
                                <div
                                    style={{
                                        height: `${(item.hadir / maxValue) * 100}%`,
                                        backgroundColor: colors.hadir,
                                        opacity: isHovered ? 1 : 0.7,
                                    }}
                                    className="flex-1 rounded-t-sm transition-opacity duration-200"
                                    title={`Hadir: ${item.hadir}`}
                                ></div>
                                <div
                                    style={{
                                        height: `${(item.izin / maxValue) * 100}%`,
                                        backgroundColor: colors.izin,
                                        opacity: isHovered ? 1 : 0.7,
                                    }}
                                    className="flex-1 rounded-t-sm transition-opacity duration-200"
                                    title={`Izin: ${item.izin}`}
                                ></div>
                                <div
                                    style={{
                                        height: `${(item.sakit / maxValue) * 100}%`,
                                        backgroundColor: colors.sakit,
                                        opacity: isHovered ? 1 : 0.7,
                                    }}
                                    className="flex-1 rounded-t-sm transition-opacity duration-200"
                                    title={`Sakit: ${item.sakit}`}
                                ></div>
                                <div
                                    style={{
                                        height: `${(item.terlambat / maxValue) * 100}%`,
                                        backgroundColor: colors.terlambat,
                                        opacity: isHovered ? 1 : 0.7,
                                    }}
                                    className="flex-1 rounded-t-sm transition-opacity duration-200"
                                    title={`Terlambat: ${item.terlambat}`}
                                ></div>
                            </div>
                            <span
                                className={`text-xs font-medium transition-colors duration-200 ${
                                    isHovered ? 'font-semibold text-gray-900' : 'text-gray-600'
                                }`}
                            >
                                {item.day}
                            </span>
                            {isHovered && (
                                <div className="pointer-events-none absolute bottom-full z-10 mb-2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white">
                                    Total: {total}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex items-center gap-6 border-t border-gray-200 pt-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.hadir }}></div>
                    <span className="text-gray-600">Hadir</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.izin }}></div>
                    <span className="text-gray-600">Izin</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.sakit }}></div>
                    <span className="text-gray-600">Sakit</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.terlambat }}></div>
                    <span className="text-gray-600">Terlambat</span>
                </div>
            </div>
        </div>
    );
}

function LineChart({
    data,
}: {
    data: Array<{
        week: string;
        submitted: number;
        validated: number;
        revision: number;
    }>;
}) {
    const [hoveredPoint, setHoveredPoint] = useState<{ week: string; type: string } | null>(null);
    const maxValue = Math.max(...data.flatMap(item => [item.submitted, item.validated, item.revision]), 52);
    const colors = {
        submitted: '#d32f2f',
        validated: '#10b981',
        revision: '#f59e0b',
    };

    const getPoints = (key: keyof typeof colors) => {
        const width = 300;
        const height = 150;
        const points = data.map((item, idx) => {
            const x = (idx / (data.length - 1)) * width;
            const y = height - (item[key] / maxValue) * height;
            return `${x},${y}`;
        });
        return points.join(' ');
    };

    const getPointCoords = (key: keyof typeof colors, idx: number) => {
        const width = 300;
        const height = 150;
        const x = (idx / (data.length - 1)) * width;
        const y = height - (data[idx][key] / maxValue) * height;
        return { x, y };
    };

    return (
        <div className="flex h-80 w-full flex-col">
            <svg viewBox="0 0 300 200" className="w-full flex-1" preserveAspectRatio="xMidYMid meet">
                <line x1="0" y1="150" x2="300" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="100" x2="300" y2="100" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />

                <polyline
                    points={getPoints('submitted')}
                    fill="none"
                    stroke={colors.submitted}
                    strokeWidth="2"
                    opacity={hoveredPoint?.type && hoveredPoint.type !== 'submitted' ? 0.3 : 1}
                    className="transition-opacity duration-200"
                />
                <polyline
                    points={getPoints('validated')}
                    fill="none"
                    stroke={colors.validated}
                    strokeWidth="2"
                    opacity={hoveredPoint?.type && hoveredPoint.type !== 'validated' ? 0.3 : 1}
                    className="transition-opacity duration-200"
                />
                <polyline
                    points={getPoints('revision')}
                    fill="none"
                    stroke={colors.revision}
                    strokeWidth="2"
                    opacity={hoveredPoint?.type && hoveredPoint.type !== 'revision' ? 0.3 : 1}
                    className="transition-opacity duration-200"
                />

                {data.map((item, idx) => {
                    const coords = getPointCoords('submitted', idx);
                    const isHovered = hoveredPoint?.week === item.week && hoveredPoint?.type === 'submitted';
                    return (
                        <circle
                            key={`submitted-${idx}`}
                            cx={coords.x}
                            cy={coords.y}
                            r={isHovered ? 5 : 3}
                            fill={colors.submitted}
                            className="cursor-pointer transition-all duration-200"
                            onMouseEnter={() => setHoveredPoint({ week: item.week, type: 'submitted' })}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{ filter: isHovered ? 'drop-shadow(0 0 3px rgba(0,0,0,0.3))' : '' }}
                        >
                            <title>{`${item.week} - Terkirim: ${item.submitted}`}</title>
                        </circle>
                    );
                })}
                {data.map((item, idx) => {
                    const coords = getPointCoords('validated', idx);
                    const isHovered = hoveredPoint?.week === item.week && hoveredPoint?.type === 'validated';
                    return (
                        <circle
                            key={`validated-${idx}`}
                            cx={coords.x}
                            cy={coords.y}
                            r={isHovered ? 5 : 3}
                            fill={colors.validated}
                            className="cursor-pointer transition-all duration-200"
                            onMouseEnter={() => setHoveredPoint({ week: item.week, type: 'validated' })}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{ filter: isHovered ? 'drop-shadow(0 0 3px rgba(0,0,0,0.3))' : '' }}
                        >
                            <title>{`${item.week} - Tervalidasi: ${item.validated}`}</title>
                        </circle>
                    );
                })}
                {data.map((item, idx) => {
                    const coords = getPointCoords('revision', idx);
                    const isHovered = hoveredPoint?.week === item.week && hoveredPoint?.type === 'revision';
                    return (
                        <circle
                            key={`revision-${idx}`}
                            cx={coords.x}
                            cy={coords.y}
                            r={isHovered ? 5 : 3}
                            fill={colors.revision}
                            className="cursor-pointer transition-all duration-200"
                            onMouseEnter={() => setHoveredPoint({ week: item.week, type: 'revision' })}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{ filter: isHovered ? 'drop-shadow(0 0 3px rgba(0,0,0,0.3))' : '' }}
                        >
                            <title>{`${item.week} - Revisi: ${item.revision}`}</title>
                        </circle>
                    );
                })}
            </svg>

            <div className="mt-4 flex items-center gap-6 border-t border-gray-200 pt-4 text-xs">
                <div
                    className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-70"
                    onMouseEnter={() => setHoveredPoint({ week: '', type: 'submitted' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                >
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.submitted }}></div>
                    <span className="text-gray-600">Terkirim</span>
                </div>
                <div
                    className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-70"
                    onMouseEnter={() => setHoveredPoint({ week: '', type: 'validated' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                >
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.validated }}></div>
                    <span className="text-gray-600">Tervalidasi</span>
                </div>
                <div
                    className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-70"
                    onMouseEnter={() => setHoveredPoint({ week: '', type: 'revision' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                >
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: colors.revision }}></div>
                    <span className="text-gray-600">Revisi</span>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { auth, statistik, absensiMingguIni, logbookMingguan, absensiHariIni, notifikasi } = usePage<PageProps>().props;

    const statsCards = [
        {
            label: 'Total Mahasiswa Terdaftar',
            value: (statistik?.totalPendaftar ?? 0).toString(),
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            label: 'Mahasiswa Aktif',
            value: (statistik?.pesertaAktif ?? 0).toString(),
            icon: UserCheck,
            color: 'bg-green-100 text-green-600',
        },
        {
            label: 'Logbook Hari Ini',
            value: (statistik?.logbookHariIni ?? 0).toString(),
            icon: BookOpen,
            color: 'bg-purple-100 text-purple-600',
        },
        {
            label: 'Sertifikat Terbit',
            value: (statistik?.sertifikatTerbit ?? 0).toString(),
            icon: Award,
            color: 'bg-yellow-100 text-yellow-600',
        },
    ];

    const notifications = [
        {
            type: 'warning',
            title: 'Pendaftar Baru',
            description: `Ada ${notifikasi.pendaftarBaru} pendaftar baru yang menunggu verifikasi`,
            icon: AlertCircle,
        },
        {
            type: 'info',
            title: 'Logbook Belum Divalidasi',
            description: `${notifikasi.logbookPending} logbook menunggu validasi dari admin`,
            icon: BookOpen,
        },
        {
            type: 'success',
            title: 'Absensi Selesai',
            description: 'Absensi hari ini telah ditutup pada pukul 07:30',
            icon: CheckCircle2,
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="space-y-6 px-6 py-6">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard Utama</h1>
                    <p className="mt-2 text-gray-600">
                        Selamat datang{' '}
                        <span className="font-medium">{auth?.user?.name ?? 'Pengguna'}</span>
                        {', '}Berikut ringkasan aktivitas magang hari ini.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label} className="border-0 p-6 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`rounded-lg p-3 ${stat.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="border-0 p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Statistik Kehadiran Mingguan</h2>
                        <BarChart data={absensiMingguIni} />
                    </Card>

                    <Card className="border-0 p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Status Logbook Mingguan</h2>
                        <LineChart data={logbookMingguan} />
                    </Card>
                </div>

                <Card className="border-0 p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Notifikasi Penting</h2>
                    <div className="space-y-3">
                        {notifications.map((notif, idx) => {
                            const Icon = notif.icon;
                            const bgColor =
                                notif.type === 'warning'
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : notif.type === 'success'
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-blue-50 border-blue-200';

                            const iconColor =
                                notif.type === 'warning'
                                    ? 'text-yellow-600'
                                    : notif.type === 'success'
                                      ? 'text-green-600'
                                      : 'text-blue-600';

                            return (
                                <div key={idx} className={`flex gap-4 rounded-lg border p-4 ${bgColor}`}>
                                    <Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                                        <p className="mt-1 text-sm text-gray-600">{notif.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card className="border-0 p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Status Absensi Hari Ini</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div className="rounded-lg bg-green-50 p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{absensiHariIni.hadir}</p>
                            <p className="mt-1 text-sm text-gray-600">Hadir</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{absensiHariIni.izin}</p>
                            <p className="mt-1 text-sm text-gray-600">Izin</p>
                        </div>
                        <div className="rounded-lg bg-yellow-50 p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{absensiHariIni.sakit}</p>
                            <p className="mt-1 text-sm text-gray-600">Sakit</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{absensiHariIni.terlambat}</p>
                            <p className="mt-1 text-sm text-gray-600">Terlambat</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <p className="text-2xl font-bold text-gray-600">{absensiHariIni.belumAbsen}</p>
                            <p className="mt-1 text-sm text-gray-600">Belum Absen</p>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
