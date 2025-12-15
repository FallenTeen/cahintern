import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { logbookMahasiswa } from '@/routes';
import detail from '@/routes/logbook';
import { show as showLogbookMahasiswa } from '@/routes/logbook/mahasiswa';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { statusVariant } from '../statusVariant';

type Status = 'pending' | 'disetujui' | 'ditolak' | 'revision';

type LogbookData = {
    id: number;
    nama_peserta: string;
    peserta_profile_id: number;
    tanggal: string;
    kegiatan: string;
    deskripsi: string | null;
    jam_mulai: string | null;
    jam_selesai: string | null;
    durasi: string;
    status: Status;
    status_label: string;
    catatan_pembimbing: string | null;
    dokumentasi: string | null;
};

type GroupedLogbook = {
    nama_peserta: string;
    peserta_profile_id: number;
    logbooks: LogbookData[];
    total_logbook: number;
    pending: number;
    disetujui: number;
    revision: number;
    ditolak: number;
};

type Props = {
    logbookData: {
        data: LogbookData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Logbook Mahasiswa', href: logbookMahasiswa().url },
];

export default function LogbookMahasiswa() {
    const { logbookData } = usePage<Props>().props;
    const [data] = useState<LogbookData[]>(logbookData.data);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'Semua'>('Semua');
    const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
    const [sortBy, setSortBy] = useState<'tanggal' | 'nama' | 'status'>(
        'tanggal',
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return data.filter((d) => {
            if (statusFilter !== 'Semua' && d.status !== statusFilter)
                return false;
            if (!q) return true;
            return (
                d.nama_peserta.toLowerCase().includes(q) ||
                d.kegiatan.toLowerCase().includes(q)
            );
        });
    }, [data, query, statusFilter]);

    const sorted = useMemo(() => {
        const sorted = [...filtered];
        sorted.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'nama') {
                comparison = a.nama_peserta.localeCompare(b.nama_peserta);
            } else if (sortBy === 'tanggal') {
                comparison =
                    new Date(a.tanggal).getTime() -
                    new Date(b.tanggal).getTime();
            } else if (sortBy === 'status') {
                comparison = a.status.localeCompare(b.status);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }, [filtered, sortBy, sortOrder]);

    const groupedData = useMemo(() => {
        const groups: Record<number, GroupedLogbook> = {};

        sorted.forEach((logbook) => {
            const id = logbook.peserta_profile_id;
            if (!groups[id]) {
                groups[id] = {
                    nama_peserta: logbook.nama_peserta,
                    peserta_profile_id: logbook.peserta_profile_id,
                    logbooks: [],
                    total_logbook: 0,
                    pending: 0,
                    disetujui: 0,
                    revision: 0,
                    ditolak: 0,
                };
            }

            groups[id].logbooks.push(logbook);
            groups[id].total_logbook++;

            if (logbook.status === 'pending') groups[id].pending++;
            if (logbook.status === 'disetujui') groups[id].disetujui++;
            if (logbook.status === 'revision') groups[id].revision++;
            if (logbook.status === 'ditolak') groups[id].ditolak++;
        });

        return Object.values(groups);
    }, [sorted]);

    const handleViewLogbook = (pesertaProfileId: number) => {
        router.visit(showLogbookMahasiswa(pesertaProfileId).url);
    };

    const handleViewDetail = (logbookId: number) => {
        router.visit(detail(logbookId).url);
    };

    const toggleSort = (field: 'tanggal' | 'nama' | 'status') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: 'tanggal' | 'nama' | 'status' }) => {
        if (sortBy !== field) return null;
        return sortOrder === 'asc' ? (
            <ChevronUp className="ml-1 inline h-4 w-4" />
        ) : (
            <ChevronDown className="ml-1 inline h-4 w-4" />
        );
    };

    const handleVerifikasi = (logbookId: number) => {
        Swal.fire({
            title: 'Setujui Logbook?',
            input: 'textarea',
            inputPlaceholder: 'Catatan (opsional)',
            showCancelButton: true,
            confirmButtonText: 'Setujui',
            cancelButtonText: 'Batal',
            showLoaderOnConfirm: true,
            preConfirm: (note) => {
                return new Promise((resolve, reject) => {
                    router.post(
                        `/logbook/${logbookId}/approve`,
                        { catatan_pembimbing: note || '' },
                        {
                            preserveScroll: true,
                            onSuccess: (page) => {
                                const flash = page.props.flash;

                                if (flash?.success) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Berhasil',
                                        text: flash.success,
                                    });
                                }

                                if (flash?.error) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Gagal',
                                        text: flash.error,
                                    });
                                }

                                resolve(true);
                            },
                            onError: () => {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Gagal',
                                    text: 'Terjadi kesalahan sistem',
                                });
                                reject();
                            },
                        },
                    );
                });
            },
        });
    };

    const handleTolak = (logbookId: number) => {
        Swal.fire({
            title: 'Tolak Logbook?',
            input: 'textarea',
            inputPlaceholder: 'Alasan penolakan (min 10 karakter)',
            showCancelButton: true,
            confirmButtonText: 'Tolak',
            showLoaderOnConfirm: true,
            preConfirm: (note) => {
                if (!note || note.trim().length < 10) {
                    Swal.showValidationMessage('Minimal 10 karakter');
                    return false;
                }

                return new Promise((resolve, reject) => {
                    router.post(
                        `/logbook/${logbookId}/reject`,
                        { catatan_pembimbing: note },
                        {
                            onSuccess: (page) => {
                                const flash = page.props.flash;
                                Swal.fire(
                                    flash?.error ? 'Ditolak' : 'Berhasil',
                                    flash?.error || flash?.success,
                                    flash?.error ? 'error' : 'success',
                                );
                                resolve(true);
                            },
                            onError: reject,
                        },
                    );
                });
            },
        });
    };

    const handleRevisi = (logbookId: number) => {
        Swal.fire({
            title: 'Minta Revisi Logbook?',
            input: 'textarea',
            inputPlaceholder: 'Catatan revisi (min 10 karakter)',
            showCancelButton: true,
            confirmButtonText: 'Kirim Revisi',
            cancelButtonText: 'Batal',
            showLoaderOnConfirm: true,

            preConfirm: (note) => {
                if (!note || note.trim().length < 10) {
                    Swal.showValidationMessage(
                        'Catatan revisi minimal 10 karakter',
                    );
                    return false;
                }

                return new Promise((resolve, reject) => {
                    router.post(
                        `/logbook/${logbookId}/revision`,
                        { catatan_pembimbing: note },
                        {
                            preserveScroll: true,

                            onSuccess: (page) => {
                                const flash = page.props.flash;

                                if (flash?.success) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Berhasil',
                                        text: flash.success,
                                    });
                                }

                                if (flash?.error) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Gagal',
                                        text: flash.error,
                                    });
                                }

                                resolve(true);
                            },

                            onError: () => {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Gagal',
                                    text: 'Terjadi kesalahan sistem',
                                });
                                reject();
                            },
                        },
                    );
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook Mahasiswa" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Logbook Mahasiswa
                    </h1>
                    <p className="text-muted-foreground">
                        Lihat dan validasi logbook harian mahasiswa
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Menunggu Validasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-yellow-500">
                            {data.filter((d) => d.status === 'pending').length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Sudah Divalidasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-green-500">
                            {
                                data.filter((d) => d.status === 'disetujui')
                                    .length
                            }
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Diminta Revisi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-orange-500">
                            {data.filter((d) => d.status === 'revision').length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Ditolak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-red-500">
                            {data.filter((d) => d.status === 'ditolak').length}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <Input
                                placeholder="Cari logbook (nama atau judul kegiatan)..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1"
                            />

                            <Select
                                value={viewMode}
                                onValueChange={(value: 'list' | 'grouped') =>
                                    setViewMode(value)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tampilan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="list">
                                        List View
                                    </SelectItem>
                                    <SelectItem value="grouped">
                                        Group by Student
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {[
                                'Semua',
                                'pending',
                                'disetujui',
                                'revision',
                                'ditolak',
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
                                    {status === 'pending'
                                        ? 'Menunggu'
                                        : status === 'disetujui'
                                          ? 'Valid'
                                          : status === 'revision'
                                            ? 'Revisi'
                                            : status === 'ditolak'
                                              ? 'Ditolak'
                                              : status}
                                </Button>
                            ))}
                            <Input
                                type="date"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-40"
                            />
                            <Input
                                type="date"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-40"
                            />
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.get('/logbook', {
                                        status:
                                            statusFilter === 'Semua'
                                                ? undefined
                                                : statusFilter,
                                        start,
                                        end,
                                    })
                                }
                            >
                                Terapkan Periode
                            </Button>
                            <Button
                                onClick={() => {
                                    const url = `/logbook/export?${new URLSearchParams({ status: statusFilter === 'Semua' ? '' : statusFilter, start, end }).toString()}`;
                                    window.location.href = url;
                                }}
                            >
                                Export CSV
                            </Button>
                        </div>

                        <Separator />

                        <p className="text-sm text-muted-foreground">
                            Menampilkan{' '}
                            {viewMode === 'list'
                                ? sorted.length
                                : groupedData.length}{' '}
                            {viewMode === 'list' ? 'logbook' : 'mahasiswa'}
                        </p>
                    </CardContent>
                </Card>

                {viewMode === 'list' ? (
                    <div className="overflow-hidden rounded-lg border shadow-sm">
                        <CardContent className="p-0">
                            <Table className="align-item-center text-center">
                                <TableHeader className="text-center align-middle">
                                    <TableRow className="bg-gray-100">
                                        <TableHead
                                            className="className='text-center align-middle' cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleSort('nama')}
                                        >
                                            Nama Mahasiswa{' '}
                                            <SortIcon field="nama" />
                                        </TableHead>

                                        <TableHead
                                            className="className='text-center align-middle' cursor-pointer hover:bg-muted/50"
                                            onClick={() =>
                                                toggleSort('tanggal')
                                            }
                                        >
                                            Tanggal <SortIcon field="tanggal" />
                                        </TableHead>
                                        <TableHead className="text-center align-middle">
                                            Durasi
                                        </TableHead>
                                        <TableHead className="text-center align-middle">
                                            Deskripsi Singkat
                                        </TableHead>
                                        <TableHead
                                            className="className='text-center align-middle' cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleSort('status')}
                                        >
                                            Status <SortIcon field="status" />
                                        </TableHead>
                                        <TableHead className="text-center align-middle">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sorted.map((d) => (
                                        <TableRow
                                            key={d.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="font-medium">
                                                {d.nama_peserta}
                                            </TableCell>

                                            <TableCell>{d.tanggal}</TableCell>
                                            <TableCell>{d.durasi}</TableCell>
                                            <TableCell>
                                                {d.deskripsi
                                                    ? `${d.deskripsi.slice(0, 80)}${d.deskripsi.length > 80 ? '...' : ''}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {statusVariant(d.status_label)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleViewDetail(
                                                                d.id,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-5 w-5 text-blue-500" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleVerifikasi(
                                                                d.id,
                                                            )
                                                        }
                                                    >
                                                        Verifikasi
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleTolak(d.id)
                                                        }
                                                    >
                                                        Tolak
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleRevisi(d.id)
                                                        }
                                                    >
                                                        Revisi
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groupedData.map((group) => (
                            <Card
                                key={group.peserta_profile_id}
                                className="transition-shadow hover:shadow-lg"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-primary/10 p-2">
                                                <Users className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {group.nama_peserta}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleViewLogbook(
                                                    group.peserta_profile_id,
                                                )
                                            }
                                        >
                                            Lihat Semua Logbook
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-5">
                                        <div className="rounded-lg bg-muted p-3 text-center">
                                            <p className="text-2xl font-bold">
                                                {group.total_logbook}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Total
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-yellow-50 p-3 text-center">
                                            <p className="text-2xl font-bold text-yellow-600">
                                                {group.pending}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Pending
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-green-50 p-3 text-center">
                                            <p className="text-2xl font-bold text-green-600">
                                                {group.disetujui}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Disetujui
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-orange-50 p-3 text-center">
                                            <p className="text-2xl font-bold text-orange-600">
                                                {group.revision}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Revisi
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-red-50 p-3 text-center">
                                            <p className="text-2xl font-bold text-red-600">
                                                {group.ditolak}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Ditolak
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">
                                            Logbook Terbaru:
                                        </p>
                                        {group.logbooks
                                            .slice(0, 3)
                                            .map((logbook) => (
                                                <div
                                                    key={logbook.id}
                                                    className="flex cursor-pointer items-center justify-between rounded bg-muted/50 p-2 hover:bg-muted"
                                                    onClick={() =>
                                                        handleViewDetail(
                                                            logbook.id,
                                                        )
                                                    }
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {logbook.kegiatan}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {logbook.tanggal} •{' '}
                                                            {logbook.durasi}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        className={badgeColor(
                                                            logbook.status,
                                                        )}
                                                        variant="secondary"
                                                    >
                                                        {logbook.status_label}
                                                    </Badge>
                                                </div>
                                            ))}
                                        {group.logbooks.length > 3 && (
                                            <p className="pt-2 text-center text-xs text-muted-foreground">
                                                Dan {group.logbooks.length - 3}{' '}
                                                logbook lainnya...
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
