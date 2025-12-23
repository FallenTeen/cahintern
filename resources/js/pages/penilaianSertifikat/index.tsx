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
import AppLayout from '@/layouts/app-layout';
import { penilaianDanSertifikat } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Status = 'belum' | 'proses' | 'terbit';

type PenilaianData = {
    id: number;
    nama_peserta: string;
    tanggal_penilaian: string;
    nilai_disiplin: number;
    nilai_kerjasama: number;
    nilai_inisiatif: number;
    nilai_komunikasi: number;
    nilai_teknis: number;
    nilai_kreativitas: number;
    nilai_tanggung_jawab: number;
    nilai_kehadiran: number;
    nilai_total: number;
    predikat: string;
    komentar: string | null;
    status: Status;
};

type Props = {
    penilaianData: {
        data: PenilaianData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    sertifikatData?: {
        data: Array<{
            id: number;
            nama_peserta: string;
            tanggal_terbit: string;
            nomor_sertifikat: string | null;
            file_path: string | null;
            status: Status;
        }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penilaian & Sertifikat', href: penilaianDanSertifikat().url },
];

export default function PenilaianSertifikat() {
    const props = usePage<Props>().props;
    const isCertificateView = Boolean(props.sertifikatData);
    const [selected, setSelected] = useState<number[]>([]);
    const prefix =
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/pic')
            ? '/pic'
            : '/admin';

    const rows = useMemo(() => {
        if (isCertificateView) {
            return props.sertifikatData!.data.map((s) => ({
                id: s.id,
                nama_peserta: s.nama_peserta,
                tanggal: s.tanggal_terbit,
                status: s.status,
                file_path: s.file_path,
            }));
        }
        return props.penilaianData.data.map((d) => ({
            id: d.id,
            nama_peserta: d.nama_peserta,
            tanggal: d.tanggal_penilaian,
            status: d.status,
            file_path: null as string | null,
        }));
    }, [props, isCertificateView]);

    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'Semua'>('Semua');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rows.filter((d) => {
            if (statusFilter !== 'Semua' && d.status !== statusFilter)
                return false;
            if (!q) return true;
            return d.nama_peserta.toLowerCase().includes(q) || false;
        });
    }, [rows, query, statusFilter]);

    const badgeColor = (status: Status) => {
        switch (status) {
            case 'terbit':
                return 'bg-green-500 text-white';
            case 'proses':
                return 'bg-blue-400 text-white';
            case 'belum':
                return 'bg-gray-300 text-black';
            default:
                return 'bg-gray-300 text-black';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penilaian & Sertifikat" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Penilaian & Sertifikat
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola penilaian mahasiswa dan penerbitan sertifikat
                        </p>
                    </div>
                    {isCertificateView ? (
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                disabled={selected.length === 0}
                                onClick={() => {
                                    selected.forEach((id) =>
                                        router.post(
                                            `${prefix}/sertifikat/${id}/regenerate`,
                                        ),
                                    );
                                }}
                            >
                                Regenerate Batch
                            </Button>
                            <Button
                                variant="default"
                                className="bg-green-600 text-white hover:bg-green-700"
                                disabled={selected.length === 0}
                                onClick={() => {
                                    selected.forEach((id) =>
                                        router.post(
                                            `${prefix}/sertifikat/${id}/validate`,
                                        ),
                                    );
                                }}
                            >
                                Publish Batch
                            </Button>
                            <Button
                                variant="default"
                                className="bg-gray-700 text-white hover:bg-gray-800"
                                disabled={selected.length === 0}
                                onClick={() => {
                                    selected.forEach((id) =>
                                        window.open(
                                            `${prefix}/sertifikat/${id}/download`,
                                            '_blank',
                                        ),
                                    );
                                }}
                            >
                                Download Batch
                            </Button>
                        </div>
                    ) : (
                        <Button className="bg-red-600 text-white hover:bg-red-700">
                            + Generate Sertifikat
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Mahasiswa Selesai</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-gray-700">
                            5
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sertifikat Terbit</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-green-500">
                            3
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Rata-Rata Nilai</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-blue-600">
                            85
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardContent className="space-y-4 p-4">
                        <Input
                            placeholder="Cari berdasarkan nama..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />

                        <div className="flex flex-wrap gap-2">
                            {['Semua', 'belum', 'proses', 'terbit'].map(
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
                                        {status === 'belum'
                                            ? 'Belum'
                                            : status === 'proses'
                                              ? 'Proses'
                                              : status === 'terbit'
                                                ? 'Terbit'
                                                : status}
                                    </Button>
                                ),
                            )}
                        </div>

                        <Separator />

                        <p className="text-sm text-muted-foreground">
                            Menampilkan {filtered.length} mahasiswa
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {isCertificateView && (
                                        <TableHead>
                                            <Checkbox
                                                checked={
                                                    selected.length ===
                                                        filtered.length &&
                                                    filtered.length > 0
                                                }
                                                onCheckedChange={(checked) => {
                                                    if (checked)
                                                        setSelected(
                                                            filtered.map(
                                                                (d) => d.id,
                                                            ),
                                                        );
                                                    else setSelected([]);
                                                }}
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead>Nama Mahasiswa</TableHead>

                                    <TableHead>
                                        {isCertificateView
                                            ? 'Tanggal Terbit'
                                            : 'Tanggal Penilaian'}
                                    </TableHead>
                                    <TableHead>Nilai Akhir</TableHead>
                                    <TableHead>Status Sertifikat</TableHead>
                                    <TableHead className="text-center">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((d) => (
                                    <TableRow key={d.id}>
                                        {isCertificateView && (
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.includes(
                                                        d.id,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        setSelected((prev) =>
                                                            checked
                                                                ? [
                                                                      ...prev,
                                                                      d.id,
                                                                  ]
                                                                : prev.filter(
                                                                      (x) =>
                                                                          x !==
                                                                          d.id,
                                                                  ),
                                                        );
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>{d.nama_peserta}</TableCell>

                                        <TableCell>{d.tanggal}</TableCell>
                                        <TableCell>
                                            {'nilai_total' in d
                                                ? (d as any).nilai_total
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={badgeColor(d.status)}
                                            >
                                                {d.status === 'belum'
                                                    ? 'Belum'
                                                    : d.status === 'proses'
                                                      ? 'Proses'
                                                      : d.status === 'terbit'
                                                        ? 'Terbit'
                                                        : d.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex justify-center gap-2">
                                            {isCertificateView ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            router.post(
                                                                `${prefix}/sertifikat/${d.id}/regenerate`,
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 text-orange-500"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M16.862 4.487l1.651 1.651a1.5 1.5 0 010 2.122l-9.193 9.193-3.764.418a.375.375 0 01-.414-.414l.418-3.764 9.193-9.193a1.5 1.5 0 012.122 0z"
                                                            />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            window.open(
                                                                `${prefix}/sertifikat/${d.id}/download`,
                                                                '_blank',
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 text-blue-600"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                                            />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            router.post(
                                                                `${prefix}/sertifikat/${d.id}/validate`,
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 text-green-600"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M9 12l2 2 4-4"
                                                            />
                                                        </svg>
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="h-5 w-5 text-orange-500"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M16.862 4.487l1.651 1.651a1.5 1.5 0 010 2.122l-9.193 9.193-3.764.418a.375.375 0 01-.414-.414l.418-3.764 9.193-9.193a1.5 1.5 0 012.122 0z"
                                                        />
                                                    </svg>
                                                </Button>
                                            )}
                                            {!isCertificateView && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="h-5 w-5 text-blue-600"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                                        />
                                                    </svg>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
