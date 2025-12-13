import AppLayout from '@/layouts/app-layout';
import { absenMahasiswa } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
    { title: 'Absensi Mahasiswa', href: absenMahasiswa().url },
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
        effective_end_date: '' as string | null,
    });

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

    const badgeVariant = (status: Status) => {
        switch (status) {
            case 'hadir':
                return 'bg-green-500 text-white';
            case 'izin':
                return 'bg-blue-500 text-white';
            case 'sakit':
                return 'bg-yellow-400 text-black';
            case 'terlambat':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-300 text-black';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi Mahasiswa" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Absensi Mahasiswa
                    </h1>
                    <div className="flex items-center gap-3">
                        {/* <Input
                            className="w-72"
                            placeholder="Cari data..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        /> */}
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
                            {schedule?.jam_buka ?? '08:00'}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Waktu Tutup
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xl font-semibold">
                            {schedule?.jam_tutup ?? '17:00'}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Tanggal Aktif
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xl font-semibold">
                            {schedule?.effective_start_date ??
                                new Date().toLocaleDateString('id-ID')}
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
                                                    e.target.value || null,
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

                <div className="overflow-hidden rounded-lg border shadow-sm">
                    <Table className="align-item-center text-center">
                        <TableHeader className="text-center align-middle">
                            <TableRow className="bg-gray-100">
                                <TableHead className="text-center align-middle">
                                    Nama Mahasiswa
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Tanggal
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Waktu Absen
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Status
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Keterangan
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length > 0 ? (
                                filtered.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.nama_peserta}</TableCell>

                                        <TableCell>{s.tanggal}</TableCell>
                                        <TableCell>
                                            {s.jam_masuk ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={badgeVariant(
                                                    s.status,
                                                )}
                                            >
                                                {s.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {s.keterangan ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    window.alert(
                                                        `Detail ${s.nama_peserta}`,
                                                    )
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-6 text-center text-muted-foreground"
                                    >
                                        Tidak ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
