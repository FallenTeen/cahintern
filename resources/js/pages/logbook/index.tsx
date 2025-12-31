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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { logbookMahasiswa } from '@/routes';
import { show as showLogbookMahasiswa } from '@/routes/logbook/mahasiswa';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Eye,
    FileText,
    Users,
} from 'lucide-react';
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
        first_page_url: string;
        last_page_url: string;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Logbook Peserta', href: logbookMahasiswa().url },
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
        if (!logbookId) {
            Swal.fire('Error', 'ID logbook tidak valid', 'error');
            return;
        }

        router.visit(`/logbook/${logbookId}`);
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

    const handlePagination = (url: string | null) => {
        if (url) {
            router.get(
                url,
                {
                    status: statusFilter === 'Semua' ? undefined : statusFilter,
                    start,
                    end,
                    q: query,
                },
                { preserveState: true, preserveScroll: true },
            );
        }
    };

    const handleVerifikasi = (_logbookId: number) => {
        Swal.fire({
            title: 'Setujui Logbook?',
            text: 'Apakah Anda yakin ingin menyetujui logbook ini?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/logbook/${_logbookId}/approve`);
            }
        });
    };

    const handleTolak = (_logbookId: number) => {
        Swal.fire({
            title: 'Tolak Logbook',
            input: 'textarea',
            inputLabel: 'Catatan Pembimbing',
            inputPlaceholder: 'Masukkan alasan penolakan...',
            inputAttributes: {
                required: 'true',
            },
            showCancelButton: true,
            confirmButtonText: 'Tolak',
            cancelButtonText: 'Batal',
            icon: 'warning',
            preConfirm: (value) => {
                if (!value || value.trim().length < 5) {
                    Swal.showValidationMessage(
                        'Catatan pembimbing wajib diisi (min. 5 karakter)',
                    );
                }
                return value;
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/logbook/${_logbookId}/reject`, {
                    catatan_pembimbing: result.value,
                });
            }
        });
    };

    const handleRevisi = (_logbookId: number) => {
        Swal.fire({
            title: 'Revisi Logbook',
            input: 'textarea',
            inputLabel: 'Catatan Pembimbing',
            inputPlaceholder: 'Masukkan catatan revisi...',
            inputAttributes: {
                required: 'true',
            },
            showCancelButton: true,
            confirmButtonText: 'Kirim Revisi',
            cancelButtonText: 'Batal',
            icon: 'info',
            preConfirm: (value) => {
                if (!value || value.trim().length < 5) {
                    Swal.showValidationMessage(
                        'Catatan pembimbing wajib diisi (min. 5 karakter)',
                    );
                }
                return value;
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/logbook/${_logbookId}/revision`, {
                    catatan_pembimbing: result.value,
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook Peserta" />

            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-semibold md:text-2xl">
                        Logbook Peserta
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Lihat dan validasi logbook harian peserta
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium md:text-sm">
                                Menunggu Validasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-2xl font-semibold text-yellow-500 md:text-3xl">
                            {data.filter((d) => d.status === 'pending').length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium md:text-sm">
                                Sudah Divalidasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-2xl font-semibold text-green-500 md:text-3xl">
                            {
                                data.filter((d) => d.status === 'disetujui')
                                    .length
                            }
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium md:text-sm">
                                Diminta Revisi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-2xl font-semibold text-orange-500 md:text-3xl">
                            {data.filter((d) => d.status === 'revision').length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-medium md:text-sm">
                                Ditolak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-2xl font-semibold text-red-500 md:text-3xl">
                            {data.filter((d) => d.status === 'ditolak').length}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="space-y-4 p-4">
                        {/* Search & View Mode */}
                        <div className="flex flex-col gap-3 md:flex-row">
                            <Input
                                placeholder="Cari logbook..."
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
                                <SelectTrigger className="w-full md:w-[180px]">
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

                        {/* Filter Container */}
                        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
                            <div className="overflow-x-auto pb-2 md:pb-0">
                                <Tabs
                                    value={statusFilter}
                                    onValueChange={(value) =>
                                        setStatusFilter(
                                            value as Status | 'Semua',
                                        )
                                    }
                                    className="w-full"
                                >
                                    <TabsList className="w-full justify-start md:w-auto">
                                        <TabsTrigger value="Semua">
                                            Semua
                                        </TabsTrigger>
                                        <TabsTrigger value="pending">
                                            Menunggu
                                        </TabsTrigger>
                                        <TabsTrigger value="disetujui">
                                            Valid
                                        </TabsTrigger>
                                        <TabsTrigger value="revision">
                                            Revisi
                                        </TabsTrigger>
                                        <TabsTrigger value="ditolak">
                                            Ditolak
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="flex flex-1 flex-col gap-2 md:flex-row md:justify-end">
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={start}
                                        onChange={(e) =>
                                            setStart(e.target.value)
                                        }
                                        className="w-full md:w-auto"
                                    />
                                    <Input
                                        type="date"
                                        value={end}
                                        onChange={(e) => setEnd(e.target.value)}
                                        className="w-full md:w-auto"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 md:flex-none"
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
                                        Filter
                                    </Button>
                                    <Button
                                        className="flex-1 md:flex-none"
                                        onClick={() => {
                                            const url = `/logbook/export?${new URLSearchParams({ status: statusFilter === 'Semua' ? '' : statusFilter, start, end }).toString()}`;
                                            window.location.href = url;
                                        }}
                                    >
                                        Export
                                    </Button>
                                </div>
                            </div>
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

                {/* Content Area */}
                {sorted.length === 0 ? (
                    /* EMPTY STATE */
                    <Card className="flex flex-col items-center justify-center border-dashed py-12 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Belum ada data logbook
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Data logbook akan muncul di sini setelah user mengisi logbook.
                        </p>
                    </Card>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <div className="overflow-hidden rounded-lg border shadow-sm">
                                {/* WRAPPER FOR MOBILE SCROLLING */}
                                <div className="overflow-x-auto">
                                    <Table className="whitespace-nowrap md:whitespace-normal">
                                        <TableHeader className="bg-gray-100/50">
                                            <TableRow>
                                                <TableHead
                                                    className="w-[200px] cursor-pointer hover:bg-muted/50"
                                                    onClick={() =>
                                                        toggleSort('nama')
                                                    }
                                                >
                                                    Nama Peserta{' '}
                                                    <SortIcon field="nama" />
                                                </TableHead>

                                                <TableHead
                                                    className="w-[150px] cursor-pointer hover:bg-muted/50"
                                                    onClick={() =>
                                                        toggleSort('tanggal')
                                                    }
                                                >
                                                    Tanggal{' '}
                                                    <SortIcon field="tanggal" />
                                                </TableHead>
                                                <TableHead className="w-[100px]">
                                                    Durasi
                                                </TableHead>
                                                <TableHead className="min-w-[200px]">
                                                    Deskripsi Singkat
                                                </TableHead>
                                                <TableHead
                                                    className="w-[150px] cursor-pointer text-center hover:bg-muted/50"
                                                    onClick={() =>
                                                        toggleSort('status')
                                                    }
                                                >
                                                    Status{' '}
                                                    <SortIcon field="status" />
                                                </TableHead>
                                                <TableHead className="w-[180px] text-center">
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
                                                    <TableCell>
                                                        {d.tanggal}
                                                    </TableCell>
                                                    <TableCell>
                                                        {d.durasi}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate md:whitespace-normal">
                                                        {d.deskripsi
                                                            ? `${d.deskripsi.slice(0, 60)}${d.deskripsi.length > 60 ? '...' : ''}`
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center">
                                                            {statusVariant(
                                                                d.status_label,
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() =>
                                                                    router.visit(
                                                                        `/logbook/mahasiswa/${d.peserta_profile_id}`,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="h-4 w-4 text-blue-500" />
                                                            </Button>

                                                            {d.status ===
                                                                'pending' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 bg-green-500 px-2 text-xs text-white hover:bg-green-600"
                                                                        onClick={() =>
                                                                            handleVerifikasi(
                                                                                d.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Setuju
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 bg-yellow-500 px-2 text-xs text-white hover:bg-yellow-600"
                                                                        onClick={() =>
                                                                            handleRevisi(
                                                                                d.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Revisi
                                                                    </Button>
                                                                    {/* Tombol Tolak/Revisi bisa dijadikan dropdown jika terlalu sempit di HP */}
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="h-8 px-2 text-xs"
                                                                        onClick={() =>
                                                                            handleTolak(
                                                                                d.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Tolak
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {/* Render buttons conditionally based on status like original code... */}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ) : (
                            // GROUPED VIEW
                            <div className="space-y-4">
                                {groupedData.map((group) => (
                                    <Card
                                        key={group.peserta_profile_id}
                                        className="transition-shadow hover:shadow-lg"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full bg-primary/10 p-2">
                                                        <Users className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <CardTitle className="text-base md:text-lg">
                                                        {group.nama_peserta}
                                                    </CardTitle>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleViewLogbook(
                                                            group.peserta_profile_id,
                                                        )
                                                    }
                                                >
                                                    Lihat Detail
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4">
                                                {/* Stats Cards - Simplified for mobile */}
                                                <div className="col-span-2 rounded-lg bg-muted p-2 text-center md:col-span-1">
                                                    <p className="text-xl font-bold">
                                                        {group.total_logbook}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">
                                                        Total
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-yellow-50 p-2 text-center">
                                                    <p className="text-xl font-bold text-yellow-600">
                                                        {group.pending}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">
                                                        Pending
                                                    </p>
                                                </div>
                                                {/* ... other stats ... */}
                                                <div className="rounded-lg bg-green-50 p-2 text-center">
                                                    <p className="text-xl font-bold text-green-600">
                                                        {group.disetujui}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">
                                                        Valid
                                                    </p>
                                                </div>
                                                {/* Hidden on very small screens if needed, or keeping grid-cols-2 behavior */}
                                                <div className="rounded-lg bg-orange-50 p-2 text-center">
                                                    <p className="text-xl font-bold text-orange-600">
                                                        {group.revision}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">
                                                        Revisi
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-red-50 p-2 text-center">
                                                    <p className="text-xl font-bold text-red-600">
                                                        {group.ditolak}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">
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
                                                            className="flex cursor-pointer flex-col gap-2 rounded bg-muted/50 p-3 hover:bg-muted md:flex-row md:items-center md:justify-between"
                                                            onClick={() =>
                                                                handleViewDetail(
                                                                    logbook.id,
                                                                )
                                                            }
                                                        >
                                                            <div className="flex-1">
                                                                <p className="line-clamp-1 text-sm font-medium">
                                                                    {
                                                                        logbook.kegiatan
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        logbook.tanggal
                                                                    }{' '}
                                                                    •{' '}
                                                                    {
                                                                        logbook.durasi
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="self-start md:self-center">
                                                                {statusVariant(
                                                                    logbook.status_label,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* PAGINATION SECTION */}
                        {logbookData.total > 10 && (
                            <div className="mt-4 flex items-center justify-between border-t pt-4">
                                <div className="hidden text-sm text-muted-foreground md:block">
                                    Halaman {logbookData.current_page} dari{' '}
                                    {logbookData.last_page}
                                </div>
                                <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePagination(
                                                logbookData.prev_page_url,
                                            )
                                        }
                                        disabled={!logbookData.prev_page_url}
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-muted-foreground md:hidden">
                                        {logbookData.current_page} /{' '}
                                        {logbookData.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePagination(
                                                logbookData.next_page_url,
                                            )
                                        }
                                        disabled={!logbookData.next_page_url}
                                    >
                                        Selanjutnya
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
