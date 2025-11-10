import AppLayout from '@/layouts/app-layout';
import { absenMahasiswa, dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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

type Status = 'Hadir' | 'Izin' | 'Sakit' | 'Terlambat';

type Student = {
    id: number;
    nama: string;
    bidang: string;
    tanggal: string;
    waktuAbsen?: string;
    status: Status;
    keterangan?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Absensi Mahasiswa', href: absenMahasiswa().url },
];

const sampleData: Student[] = [
    {
        id: 1,
        nama: 'Budi Santoso',
        bidang: 'Sapras',
        tanggal: '16/01/2025',
        waktuAbsen: '07:15',
        status: 'Hadir',
    },
    {
        id: 2,
        nama: 'Siti Nurhaliza',
        bidang: 'PGTK',
        tanggal: '16/01/2025',
        waktuAbsen: '07:05',
        status: 'Hadir',
    },
    {
        id: 3,
        nama: 'Ahmad Hidayat',
        bidang: 'Umum',
        tanggal: '16/01/2025',
        waktuAbsen: '07:32',
        status: 'Terlambat',
        keterangan: 'Kemacetan di jalan',
    },
    {
        id: 4,
        nama: 'Rina Putri',
        bidang: 'Kurikulum',
        tanggal: '16/01/2025',
        status: 'Sakit',
        keterangan: 'Sakit demam (sudah upload surat keterangan)',
    },
    {
        id: 5,
        nama: 'Yudi Hermawan',
        bidang: 'GTK',
        tanggal: '16/01/2025',
        status: 'Izin',
        keterangan: 'Perlu ke universitas untuk urusan akademik',
    },
];

export default function AbsensiMahasiswa() {
    const [students] = useState<Student[]>(sampleData);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'Semua'>('Semua');
    const [showOnlyWithTime, setShowOnlyWithTime] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return students.filter((s) => {
            if (statusFilter !== 'Semua' && s.status !== statusFilter)
                return false;
            if (showOnlyWithTime && !s.waktuAbsen) return false;
            if (!q) return true;
            return (
                s.nama.toLowerCase().includes(q) ||
                s.bidang.toLowerCase().includes(q) ||
                (s.keterangan ?? '').toLowerCase().includes(q)
            );
        });
    }, [students, query, statusFilter, showOnlyWithTime]);

    // 🔹 Gunakan Tailwind class untuk warna Badge
    const badgeVariant = (status: Status) => {
        switch (status) {
            case 'Hadir':
                return 'bg-green-500 text-white';
            case 'Izin':
                return 'bg-blue-500 text-white';
            case 'Sakit':
                return 'bg-yellow-400 text-black';
            case 'Terlambat':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-300 text-black';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi Mahasiswa" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Absensi Mahasiswa
                    </h1>
                    <div className="flex items-center gap-3">
                        <Input
                            className="w-72"
                            placeholder="Cari data..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Button
                            variant="destructive"
                            onClick={() =>
                                window.alert(
                                    'Buka modal/halaman atur jadwal (implementasi backend).',
                                )
                            }
                        >
                            Atur Jadwal Absensi
                        </Button>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Waktu Buka
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xl font-semibold">
                            07:00
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Waktu Tutup
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xl font-semibold">
                            07:30
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">
                                Tanggal Aktif
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xl font-semibold">
                            16/01/2025
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Section */}
                <Card>
                    <CardContent className="space-y-4 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Input
                                placeholder="Cari berdasarkan nama atau bidang..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="col-span-2 flex flex-wrap items-center gap-2">
                                {['Semua', 'Hadir', 'Izin', 'Sakit', 'Terlambat'].map(
                                    (status) => (
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
                                            {status}
                                        </Button>
                                    ),
                                )}
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

                {/* Table Section */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Mahasiswa</TableHead>
                                    <TableHead>Bidang</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Waktu Absen</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-center">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length > 0 ? (
                                    filtered.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.nama}</TableCell>
                                            <TableCell>{s.bidang}</TableCell>
                                            <TableCell>{s.tanggal}</TableCell>
                                            <TableCell>
                                                {s.waktuAbsen ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={badgeVariant(
                                                        s.status,
                                                    )}
                                                >
                                                    {s.status}
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
                                                            `Detail ${s.nama}`,
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
