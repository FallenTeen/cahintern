import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, Link } from '@inertiajs/react';
import { dashboard, logBook, absensi, sertifikat } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import {
    AlertCircle,
    Award,
    BookOpen,
    CheckCircle2,
    UserCheck,
    Users,
    NotebookText,
    CalendarCheck,
    Medal,
} from 'lucide-react';
import { useState } from 'react';
import { statusAbsensi } from './statusAbsensi';
import { randomFill } from 'node:crypto';
import { statusVariant } from './statusVariant';

type User = {
    name: string;
};

type PageProps = {
    auth?: {
        user: User;
    };
    mode?: 'admin' | 'peserta';
    jesonResponse?: unknown;
    statistik?: {
        totalPendaftar: number;
        pesertaAktif: number;
        logbookHariIni: number;
        sertifikatTerbit: number;
    };
    absensiMingguIni?: Array<{
        day: string;
        hadir: number;
        izin: number;
        sakit: number;
        terlambat: number;
    }>;
    logbookMingguan?: Array<{
        week: string;
        submitted: number;
        validated: number;
        revision: number;
    }>;
    absensiHariIni?: {
        hadir: number;
        izin: number;
        sakit: number;
        terlambat: number;
        belumAbsen: number;
    };
    notifikasi?: {
        pendaftarBaru?: number;
        logbookPending?: number;
        unread?: number;
        list?: Array<{ judul: string; pesan: string; tipe: string; dibaca: boolean; waktu: string }>;
    };
    peserta?: {
        nama: string;
        asal_instansi: string;
        nim_nisn: string;
        tanggal_mulai?: string | null;
        tanggal_selesai?: string | null;
    } | null;
    schedule?: { jam_buka: string; jam_tutup: string } | null;
    absensiStats?: { hadir: number; izin: number; sakit: number; terlambat: number };
    recentAbsensi?: Array<{ tanggal: string; jam_masuk: string; jam_keluar: string; status: string }>;
    notifikasiUser?: { unread: number; list: Array<{ judul: string; pesan: string; tipe: string; dibaca: boolean; waktu: string }> };
    absensiChart?: {
        daily: Array<{ day: string; hadir: number; izin: number; sakit: number; terlambat: number }>;
        weekly: Array<{ week: string; hadir: number; izin: number; sakit: number; terlambat: number }>;
        monthly: Array<{ month: string; hadir: number; izin: number; sakit: number; terlambat: number }>;
    };
    logbookCompletionPercent?: number;
    logbookProgress?: number;
    recentLogbooks?: Array<{ tanggal: string; judul: string; status: string }>;
    tasks?: string[];
    quickActions?: Array<{ label: string; href: string }>;
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

    const handleBarHover = (day: string) => {
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
                            onMouseEnter={() => handleBarHover(item.day)}
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
    const props = usePage<PageProps>().props;
    const { auth, mode } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: mode === 'peserta' ? 'Dashboard Peserta' : 'Dashboard',
            href: dashboard().url,
        },
    ];

    const [absensiPeriod, setAbsensiPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    type AbsensiItem = { day?: string; week?: string; month?: string; hadir: number; izin: number; sakit: number; terlambat: number };

    const statsCards = [
        {
            label: 'Total Mahasiswa Terdaftar',
            value: (props.statistik?.totalPendaftar ?? 0).toString(),
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            label: 'Mahasiswa Aktif',
            value: (props.statistik?.pesertaAktif ?? 0).toString(),
            icon: UserCheck,
            color: 'bg-green-100 text-green-600',
        },
        {
            label: 'Logbook Hari Ini',
            value: (props.statistik?.logbookHariIni ?? 0).toString(),
            icon: BookOpen,
            color: 'bg-purple-100 text-purple-600',
        },
        {
            label: 'Sertifikat Terbit',
            value: (props.statistik?.sertifikatTerbit ?? 0).toString(),
            icon: Award,
            color: 'bg-yellow-100 text-yellow-600',
        },
    ];

    const notifications = [
        {
            type: 'warning',
            title: 'Pendaftar Baru',
            description: `Ada ${props.notifikasi?.pendaftarBaru ?? 0} pendaftar baru yang menunggu verifikasi`,
            icon: AlertCircle,
        },
        {
            type: 'info',
            title: 'Logbook Belum Divalidasi',
            description: `${props.notifikasi?.logbookPending ?? 0} logbook menunggu validasi dari admin`,
            icon: BookOpen,
        },
        {
            type: 'success',
            title: 'Absensi Selesai',
            description: 'Absensi hari ini telah ditutup pada pukul 07:30',
            icon: CheckCircle2,
        },
    ];

    if (mode === 'peserta') {
        const unreadBadge = props.notifikasi?.unread ?? props.notifikasiUser?.unread ?? 0;
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard Peserta" />
                <div className="space-y-6 px-6 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Dashboard Peserta</h1>
                            <p className="mt-2 text-gray-600">Selamat datang <span className="font-medium">{auth?.user?.name ?? 'Peserta'}</span></p>
                        </div>
                        <div className="relative">
                            <span className="text-sm text-gray-600">Notifikasi</span>
                            {unreadBadge > 0 && <span className="ml-2 inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{unreadBadge}</span>}
                        </div>
                    </div>

                    <Card className="border-0 p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Akses Cepat</h2>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" asChild>
                                <Link href={logBook().url}>
                                    <NotebookText className="mr-2 h-4 w-4" />
                                    LogBook
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={absensi().url}>
                                    <CalendarCheck className="mr-2 h-4 w-4" />
                                    Absensi
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={sertifikat().url}>
                                    <Medal className="mr-2 h-4 w-4" />
                                    Sertifikat
                                </Link>
                            </Button>
                        </div>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-0 p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Magang</h2>
                            <div className="grid gap-3">
                                <div className="flex justify-between"><span className="text-sm text-gray-600">Tanggal Masuk</span><span className="font-medium">{props.peserta?.tanggal_mulai ?? '-'}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-gray-600">Tanggal Selesai</span><span className="font-medium">{props.peserta?.tanggal_selesai ?? '-'}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-gray-600">Jadwal Absensi Hari Ini</span><span className="font-medium">{props.schedule ? `${props.schedule.jam_buka}–${props.schedule.jam_tutup}` : '-'}</span></div>
                            </div>
                        </Card>
                        <Card className="border-0 p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi & Pengumuman</h2>
                            <div className="space-y-3">
                                {(props.notifikasi?.list ?? props.notifikasiUser?.list ?? []).map((n, idx) => (
                                    <div key={idx} className="rounded-lg border bg-blue-50 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{n.judul}</p>
                                                <p className="mt-1 text-sm text-gray-700">{n.pesan}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">{n.waktu}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-0 p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Progress Logbook</h2>
                            <div className="flex items-center gap-4">
                                <Progress value={props.logbookProgress ?? 0} />
                                <span className="text-sm font-medium text-gray-700">{(props.logbookProgress ?? 0)}%</span>
                            </div>
                        </Card>
                        <Card className="border-0 p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Tugas Hari Ini</h2>
                            <div className="space-y-2">
                                {((props.tasks ?? []).length === 0) ? (
                                    <p className="text-sm text-gray-600">Tidak ada tugas</p>
                                ) : (
                                    (props.tasks ?? []).map((t, idx) => (
                                        <div key={idx} className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">{t}</div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    <Card className="border-0 p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Aktivitas Logbook Terbaru</h2>
                        <div className="space-y-3">
                            {(props.recentLogbooks ?? []).map((l, idx) => (
                                <div key={idx} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{l.judul}</p>
                                        <p className="text-xs text-gray-600">{l.tanggal}</p>
                                    </div>
                                    {statusVariant(l.status)}
                                </div>
                            ))}
                            {(props.recentLogbooks ?? []).length === 0 && <p className="text-sm text-gray-600">Belum ada aktivitas</p>}
                        </div>
                    </Card>

                    <Card className="border-0 p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Jumlah Absensi</h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-lg bg-green-300 p-4 text-center"><p className="text-2xl font-bold text-white">{props.absensiStats?.hadir ?? 0}</p><p className="mt-1 text-sm font-bold text-gray-900">Hadir</p></div>
                            <div className="rounded-lg bg-blue-300 p-4 text-center"><p className="text-2xl font-bold text-white">{props.absensiStats?.izin ?? 0}</p><p className="mt-1 text-sm font-bold text-gray-900">Izin</p></div>
                            <div className="rounded-lg bg-yellow-300 p-4 text-center"><p className="text-2xl font-bold text-white">{props.absensiStats?.sakit ?? 0}</p><p className="mt-1 text-sm font-bold text-gray-900">Sakit</p></div>
                            <div className="rounded-lg bg-red-300 p-4 text-center"><p className="text-2xl font-bold text-white">{props.absensiStats?.terlambat ?? 0}</p><p className="mt-1 text-sm font-bold text-gray-900">Terlambat</p></div>
                        </div>
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-600">
                                        <th className="py-2 pr-4">Tanggal</th>
                                        <th className="py-2 pr-4">Masuk</th>
                                        <th className="py-2 pr-4">Pulang</th>
                                        <th className="py-2 pr-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(props.recentAbsensi ?? []).map((r, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="py-2 pr-4">{r.tanggal}</td>
                                            <td className="py-2 pr-4">{r.jam_masuk}</td>
                                            <td className="py-2 pr-4">{r.jam_keluar}</td>
                                            {statusAbsensi(r.status)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const absensiChartData = (() => {
        const chart = props.absensiChart;
        if (!chart) {
            return props.absensiMingguIni ?? [];
        }
        const arr = absensiPeriod === 'daily' ? chart.daily : absensiPeriod === 'weekly' ? chart.weekly : chart.monthly;
        return arr.map((item: AbsensiItem) => ({
            day: (item.day ?? item.week ?? item.month ?? ''),
            hadir: item.hadir,
            izin: item.izin,
            sakit: item.sakit,
            terlambat: item.terlambat,
        }));
    })();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Grafik Kehadiran</h2>
                            <Tabs value={absensiPeriod} onValueChange={(v) => setAbsensiPeriod(v as 'daily' | 'weekly' | 'monthly')}>
                                <TabsList>
                                    <TabsTrigger value="daily">Harian</TabsTrigger>
                                    <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                                    <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="mt-4">
                            <BarChart data={absensiChartData} />
                        </div>
                    </Card>

                    <Card className="border-0 p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Status Logbook Mingguan</h2>
                        <LineChart data={props.logbookMingguan ?? []} />
                    </Card>
                </div>

                <Card className="border-0 p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Penyelesaian Logbook Bulan Ini</h2>
                    <div className="flex items-center gap-4">
                        <Progress value={props.logbookCompletionPercent ?? 0} />
                        <span className="text-sm font-medium text-gray-700">{(props.logbookCompletionPercent ?? 0)}%</span>
                    </div>
                </Card>

                <Card className="border-0 p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        {(props.quickActions ?? []).map((a, idx) => (
                            <Button key={idx} variant="outline" asChild>
                                <Link href={a.href}>{a.label}</Link>
                            </Button>
                        ))}
                    </div>
                </Card>

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
                            <p className="text-2xl font-bold text-green-600">{props.absensiHariIni?.hadir ?? 0}</p>
                            <p className="mt-1 text-sm text-gray-600">Hadir</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{props.absensiHariIni?.izin ?? 0}</p>
                            <p className="mt-1 text-sm text-gray-600">Izin</p>
                        </div>
                        <div className="rounded-lg bg-yellow-50 p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{props.absensiHariIni?.sakit ?? 0}</p>
                            <p className="mt-1 text-sm text-gray-600">Sakit</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{props.absensiHariIni?.terlambat ?? 0}</p>
                            <p className="mt-1 text-sm text-gray-600">Terlambat</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <p className="text-2xl font-bold text-gray-600">{props.absensiHariIni?.belumAbsen ?? 0}</p>
                            <p className="mt-1 text-sm text-gray-600">Belum Absen</p>
                        </div>
                    </div>
                </Card>

            </div>
        </AppLayout>
    );
}
