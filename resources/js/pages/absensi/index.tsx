import AppLayout from '@/layouts/app-layout';
import { absenMahasiswa } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Calendar,
    Check,
    Clock,
    Eye,
    FileText,
    Inbox,
    Trash2,
    User,
    X,
} from 'lucide-react';

type Status = 'hadir' | 'izin' | 'sakit' | 'terlambat';

type AbsensiData = {
    id: number;
    nama_peserta: string;
    tanggal: string;
    jam_masuk: string | null;
    jam_keluar: string | null;
    status: Status;
    status_label: string;
    keterangan: string | null;
    foto_masuk: string | null;
    foto_keluar: string | null;
    status_approval?: 'pending' | 'disetujui' | 'ditolak';
};

type Props = {
    absensiData: {
        data: AbsensiData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    schedule?: {
        jam_buka: string;
        jam_tutup: string;
        toleransi_menit: number;
        effective_start_date?: string | null;
        effective_end_date?: string | null;
    } | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Absensi Peserta', href: absenMahasiswa().url },
];

export default function AbsensiMahasiswa() {
    const { absensiData, schedule } = usePage<Props>().props;
    const [students] = useState<AbsensiData[]>(absensiData.data);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'Semua'>('Semua');
    const [showOnlyWithTime, setShowOnlyWithTime] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [form, setForm] = useState({
        jam_buka: schedule?.jam_buka ?? '08:00',
        jam_tutup: schedule?.jam_tutup ?? '17:00',
        toleransi_menit: schedule?.toleransi_menit ?? 0,
        effective_start_date: new Date().toISOString().slice(0, 10),
        effective_end_date: new Date().toISOString().slice(0, 10),
    });

    const Show = (id: number) => {
        router.get(`/absen-mahasiswa/${id}`);
    };

    const Approve = (id: number, nama: string) => {
        Swal.fire({
            title: `Approve absen ${nama}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Approve',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    `/absen-mahasiswa/${id}/approve`,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire(
                                'Berhasil!',
                                'Absen telah di-approve.',
                                'success',
                            );
                        },
                    },
                );
            }
        });
    };

    const Reject = (id: number, nama: string) => {
        Swal.fire({
            title: `Tolak absen ${nama}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    `/absen-mahasiswa/${id}/reject`,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire(
                                'Ditolak!',
                                'Absen telah ditolak.',
                                'success',
                            );
                        },
                    },
                );
            }
        });
    };

    const deleteAbsensi = (id: number) => {
        Swal.fire({
            title: `Hapus data absen ini?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/absensi/${id}/delete`, {
                    data: { id: id },
                    onSuccess: () => {
                        Swal.fire(
                            'Berhasil!',
                            'Data absensi berhasil dihapus.',
                            'success',
                        );
                    },
                });
            }
        });
    };

    const resetSchedule = () => {
        Swal.fire({
            title: 'Reset jadwal absensi?',
            text: 'Ini akan menghapus jadwal absensi yang ada.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Reset',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete('/absen-jadwal/reset', {
                    onSuccess: () => {
                        Swal.fire(
                            'Berhasil!',
                            'Jadwal absensi berhasil direset.',
                            'success',
                        );
                    },
                });
            }
        });
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return students.filter((s) => {
            if (statusFilter !== 'Semua' && s.status !== statusFilter)
                return false;
            if (showOnlyWithTime && !s.jam_masuk) return false;
            if (!q) return true;
            return (
                s.nama_peserta.toLowerCase().includes(q) ||
                (s.keterangan ?? '').toLowerCase().includes(q)
            );
        });
    }, [students, query, statusFilter, showOnlyWithTime]);

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('hadir')) return 'bg-green-500 text-white';
        if (s.includes('izin')) return 'bg-yellow-500 text-white';
        if (s.includes('sakit')) return 'bg-blue-500 text-white';
        if (s.includes('terlambat')) return 'bg-red-500 text-white';
        return 'bg-gray-500 text-white';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi Peserta" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Absensi Peserta
                    </h1>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="default"
                            onClick={() => resetSchedule()}
                        >
                            Reset Jadwal Absensi
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setOpenDialog(true)}
                        >
                            Atur Jadwal Absensi
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Waktu Buka
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xl font-semibold">
                            {schedule?.jam_buka ?? '-'}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Waktu Tutup
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xl font-semibold">
                            {schedule?.jam_tutup ?? '-'}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="grid grid-cols-3 items-center gap-6">
                            {/* Tanggal Aktif */}
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Aktif
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {schedule?.effective_start_date ?? '-'}
                                </p>
                            </div>

                            {/* Toleransi */}
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Toleransi
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {schedule?.toleransi_menit ?? 0} menit
                                </p>
                            </div>

                            {/* Tanggal Berakhir */}
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                    Berakhir
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {schedule?.effective_end_date ?? '-'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {openDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                            <h2 className="mb-4 text-lg font-semibold">
                                Atur Jadwal Absensi
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm">Jam Buka</label>
                                    <Input
                                        type="time"
                                        value={form.jam_buka}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                jam_buka: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm">Jam Tutup</label>
                                    <Input
                                        type="time"
                                        value={form.jam_tutup}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                jam_tutup: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm">
                                        Toleransi Telat (menit)
                                    </label>
                                    <Input
                                        type="number"
                                        value={form.toleransi_menit}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                toleransi_menit: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm">
                                        Mulai Berlaku
                                    </label>
                                    <Input
                                        type="date"
                                        value={form.effective_start_date}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                effective_start_date:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm">
                                        Berakhir (opsional)
                                    </label>
                                    <Input
                                        type="date"
                                        value={form.effective_end_date ?? ''}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                effective_end_date:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpenDialog(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => {
                                        router.post('/absen-jadwal', form, {
                                            onSuccess: () =>
                                                setOpenDialog(false),
                                        });
                                    }}
                                >
                                    Simpan Jadwal
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <Card>
                    <CardContent className="space-y-4 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Input
                                placeholder="Cari berdasarkan nama..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="col-span-2 flex flex-wrap items-center gap-2">
                                {[
                                    'Semua',
                                    'hadir',
                                    'izin',
                                    'sakit',
                                    'terlambat',
                                ].map((status) => (
                                    <Button
                                        key={status}
                                        variant={
                                            statusFilter === status
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setStatusFilter(
                                                status as Status | 'Semua',
                                            )
                                        }
                                    >
                                        {status === 'hadir'
                                            ? 'Hadir'
                                            : status === 'izin'
                                              ? 'Izin'
                                              : status === 'sakit'
                                                ? 'Sakit'
                                                : status === 'terlambat'
                                                  ? 'Terlambat'
                                                  : status}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div>
                                Menampilkan {filtered.length} data absensi
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="onlyWithTime">
                                    Hanya yang sudah absen
                                </label>
                                <Checkbox
                                    id="onlyWithTime"
                                    checked={showOnlyWithTime}
                                    onCheckedChange={(v) =>
                                        setShowOnlyWithTime(!!v)
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {/* --- LOGIC 1: JIKA DATA KOSONG --- */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 rounded-full bg-gray-50 p-4">
                                <Inbox className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Belum ada data absensi dari user
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Data kehadiran akan muncul di sini setelah user
                                melakukan absen.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* --- TAMPILAN DESKTOP (Table) --- */}
                            {/* Hidden di mobile, muncul di layar LG ke atas */}
                            <div className="hidden overflow-x-auto lg:block">
                                <Table className="w-full text-center text-sm">
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                Nama Peserta
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                Tanggal
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                Waktu Absen
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                Keterangan
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.map((s) => (
                                            <TableRow
                                                key={s.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell className="font-medium text-gray-900">
                                                    {s.nama_peserta}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {s.tanggal}
                                                </TableCell>
                                                <TableCell className="font-mono text-gray-600">
                                                    {s.jam_masuk ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`${getStatusColor(s.status)} border-0 px-2.5 py-0.5 shadow-none`}
                                                    >
                                                        {s.status_label ||
                                                            s.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-[200px] truncate text-gray-600"
                                                    title={s.keterangan}
                                                >
                                                    {s.keterangan ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                        onClick={() =>
                                                            Show(s.id)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {s.status_approval ===
                                                        'pending' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                                onClick={() =>
                                                                    Approve(
                                                                        s.id,
                                                                        s.nama_peserta,
                                                                    )
                                                                }
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() =>
                                                                    Reject(
                                                                        s.id,
                                                                        s.nama_peserta,
                                                                    )
                                                                }
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() =>
                                                            deleteAbsensi(s.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex flex-col divide-y divide-gray-100 lg:hidden">
                                {filtered.map((s, index) => (
                                    <div
                                        key={s.id}
                                        className="p-4 transition-colors hover:bg-gray-50"
                                    >
                                        {/* Header Card */}
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {s.nama_peserta}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{s.tanggal}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`${getStatusColor(s.status)} border-0 px-2 py-0.5 text-[10px] shadow-none`}
                                            >
                                                {s.status_label || s.status}
                                            </Badge>
                                        </div>

                                        {/* Body Card */}
                                        <div className="ml-13 grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="font-mono">
                                                    {s.jam_masuk ?? '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="truncate">
                                                    {s.keterangan || '-'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer Card */}
                                        <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-gray-200 text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                                onClick={() =>
                                                    window.alert(
                                                        `Detail ${s.nama_peserta}`,
                                                    )
                                                }
                                            >
                                                <Eye className="mr-2 h-3.5 w-3.5" />{' '}
                                                Lihat Detail
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {absensiData.total > 10 && (
                                <div className="border-t border-gray-200 bg-gray-50/50 p-4">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={
                                                        absensiData.prev_page_url ??
                                                        '#'
                                                    }
                                                    className={
                                                        !absensiData.prev_page_url
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                    onClick={(e) => {
                                                        if (
                                                            !absensiData.prev_page_url
                                                        )
                                                            e.preventDefault();
                                                        // Tambahkan logic router.get disini jika perlu
                                                    }}
                                                />
                                            </PaginationItem>

                                            {/* Logic loop pagination links */}
                                            {absensiData.links &&
                                                absensiData.links
                                                    .slice(1, -1)
                                                    .map((link, index) => (
                                                        <PaginationItem
                                                            key={index}
                                                            className="hidden sm:block"
                                                        >
                                                            <PaginationLink
                                                                href={
                                                                    link.url ??
                                                                    '#'
                                                                }
                                                                isActive={
                                                                    link.active
                                                                }
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        !link.url
                                                                    )
                                                                        e.preventDefault();
                                                                    // Tambahkan logic router.get disini jika perlu
                                                                }}
                                                            >
                                                                {link.label}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}

                                            {/* Mobile Info */}
                                            <span className="text-xs text-gray-500 sm:hidden">
                                                Hal {absensiData.current_page}
                                            </span>

                                            <PaginationItem>
                                                <PaginationNext
                                                    href={
                                                        absensiData.next_page_url ??
                                                        '#'
                                                    }
                                                    className={
                                                        !absensiData.next_page_url
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                    onClick={(e) => {
                                                        if (
                                                            !absensiData.next_page_url
                                                        )
                                                            e.preventDefault();
                                                        // Tambahkan logic router.get disini jika perlu
                                                    }}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
