import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dataPendaftaran } from '@/routes';
import {
    approve as approvePendaftaran,
    destroy as destroyPendaftaran,
    reject as rejectPendaftaran,
    show as showPendaftaran,
} from '@/routes/dataPendaftaran';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Select } from '@radix-ui/react-select';
import {
    Check,
    Eye,
    Inbox,
    MapPin,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Peserta',
        href: dataPendaftaran().url,
    },
];

interface DataPendaftar {
    id: number;
    nama_lengkap: string;
    asal_instansi: string;
    jurusan: string;
    waktu: string;
    tanggal_mulai: string;
    status: string;
}

interface PaginatedData {
    data: DataPendaftar[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export default function DataPendaftaran({
    dataPendaftar,
}: {
    dataPendaftar: PaginatedData;
}) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('semua');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get(
            dataPendaftaran().url,
            {
                search: search,
                status: status,
            },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleApprove = (id: number) => {
        Swal.fire({
            title: 'Terima Pendaftar?',
            text: 'Pastikan data pendaftar sudah benar sebelum diterima.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Terima',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#38c172',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    approvePendaftaran(id).url,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire({
                                title: 'Diterima',
                                text: 'Pendaftar berhasil diterima.',
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 1500,
                                timerProgressBar: true,
                            });
                            router.reload();
                        },
                    },
                );
            }
        });
    };

    const handleReject = (id: number) => {
        Swal.fire({
            title: 'Tolak Pendaftar',
            input: 'textarea',
            inputLabel: 'Alasan Penolakan',
            inputPlaceholder: 'Masukkan alasan penolakan...',
            showCancelButton: true,
            confirmButtonText: 'Tolak',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#e3342f',
            inputValidator: (value) => {
                if (!value) {
                    return 'Alasan penolakan harus diisi!';
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    rejectPendaftaran(id).url,
                    { alasan_tolak: result.value },
                    {
                        onSuccess: () => {
                            Swal.fire({
                                title: 'Ditolak',
                                text: 'Pendaftar berhasil ditolak.',
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 1500,
                                timerProgressBar: true,
                            });
                            router.reload();
                        },
                    },
                );
            }
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Hapus Data?',
            text: 'Data yang dihapus tidak dapat dikembalikan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#e3342f',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(destroyPendaftaran(id).url, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Dihapus',
                            text: 'Data berhasil dihapus.',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true,
                        });
                        router.reload();
                    },
                });
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Diterima':
                return 'bg-green-100 text-green-800';
            case 'Ditolak':
                return 'bg-red-100 text-red-800';
            case 'Proses':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Peserta" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">Data Peserta</h1>
                    <p className="text-sm text-gray-500 md:text-base">
                        Kelola data peserta magang ke Dinas Pendidikan
                        Banyumas
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-[280px]">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari nama pendaftar..."
                                className="w-full pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                            />
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="diterima">
                                    Diterima
                                </SelectItem>
                                <SelectItem value="pending">Proses</SelectItem>
                                <SelectItem value="ditolak">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? 'Mencari...' : 'Cari'}
                        </Button>
                    </div>

                    <Link href="data-pendaftaran/create">
                        <Button className="flex w-full items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 sm:w-auto">
                            <Plus className="h-4 w-4" />
                            <span>Tambah Peserta</span>
                        </Button>
                    </Link>
                </div>

                {/* Container Utama */}
                <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                    {/* --- LOGIC 1: JIKA DATA KOSONG --- */}
                    {dataPendaftar.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 rounded-full bg-gray-50 p-6">
                                <Inbox className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Belum ada data pendaftaran
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Data pendaftar akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* --- TAMPILAN DESKTOP (Table) --- */}
                            <div className="hidden overflow-x-auto lg:block">
                                <Table className="w-full text-left text-sm text-gray-600">
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="py-4 font-semibold text-gray-900">
                                                Nama Lengkap
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                Asal Instansi
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                Jurusan
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                Waktu
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                Mulai
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-gray-900">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dataPendaftar.data.map((pendaftar) => (
                                            <TableRow
                                                key={pendaftar.id}
                                                className="group transition-colors hover:bg-gray-50"
                                            >
                                                <TableCell className="font-medium text-gray-900">
                                                    {pendaftar.nama_lengkap}
                                                </TableCell>
                                                <TableCell>
                                                    {pendaftar.asal_instansi}
                                                </TableCell>
                                                <TableCell>
                                                    {pendaftar.jurusan}
                                                </TableCell>
                                                <TableCell>
                                                    {pendaftar.waktu}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {pendaftar.tanggal_mulai}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(pendaftar.status)}`}
                                                    >
                                                        {pendaftar.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity group-hover:opacity-100">
                                                        {/* Tombol Aksi Desktop */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                            title="Lihat Detail"
                                                            onClick={() =>
                                                                router.visit(
                                                                    showPendaftaran(
                                                                        pendaftar.id,
                                                                    ).url,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>

                                                        {pendaftar.status ===
                                                            'Proses' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                                    title="Terima"
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            pendaftar.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                                    title="Tolak"
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            pendaftar.id,
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
                                                            title="Hapus"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    pendaftar.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* --- TAMPILAN MOBILE (Cards) --- */}
                            <div className="flex flex-col divide-y divide-gray-100 lg:hidden">
                                {dataPendaftar.data.map((pendaftar, index) => (
                                    <div
                                        key={pendaftar.id}
                                        className="p-5 transition-colors active:bg-gray-50"
                                    >
                                        {/* Header Card: Nama & Status */}
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                                                    {index +
                                                        1 +
                                                        (dataPendaftar.current_page -
                                                            1) *
                                                            dataPendaftar.per_page}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {pendaftar.nama_lengkap}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <MapPin className="h-3 w-3" />
                                                        {
                                                            pendaftar.asal_instansi
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getStatusColor(pendaftar.status)}`}
                                            >
                                                {pendaftar.status}
                                            </span>
                                        </div>

                                        {/* Body Card: Detail */}
                                        <div className="ml-14 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                                            <div className="col-span-2 sm:col-span-1">
                                                <p className="text-xs text-gray-400">
                                                    Jurusan
                                                </p>
                                                <p className="font-medium">
                                                    {pendaftar.jurusan}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Durasi
                                                </p>
                                                <p className="font-medium">
                                                    {pendaftar.waktu}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Mulai
                                                </p>
                                                <p className="font-medium">
                                                    {pendaftar.tanggal_mulai}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer Card: Actions */}
                                        <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 border-gray-200 text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                                onClick={() =>
                                                    router.visit(
                                                        showPendaftaran(
                                                            pendaftar.id,
                                                        ).url,
                                                    )
                                                }
                                            >
                                                <Eye className="mr-2 h-3.5 w-3.5" />{' '}
                                                Detail
                                            </Button>

                                            {pendaftar.status === 'Proses' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 border-gray-200 text-green-600 hover:border-green-200 hover:bg-green-50"
                                                        onClick={() =>
                                                            handleApprove(
                                                                pendaftar.id,
                                                            )
                                                        }
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 border-gray-200 text-orange-600 hover:border-orange-200 hover:bg-orange-50"
                                                        onClick={() =>
                                                            handleReject(
                                                                pendaftar.id,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                onClick={() =>
                                                    handleDelete(pendaftar.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- LOGIC 2: PAGINATION (Hanya jika data > 10) --- */}
                            {dataPendaftar.total > 10 && (
                                <div className="border-t border-gray-200 bg-gray-50/50 p-4">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={
                                                        dataPendaftar.prev_page_url ??
                                                        '#'
                                                    }
                                                    onClick={(e) => {
                                                        if (
                                                            !dataPendaftar.prev_page_url
                                                        )
                                                            e.preventDefault();
                                                        else {
                                                            e.preventDefault();
                                                            router.get(
                                                                dataPendaftar.prev_page_url,
                                                                {},
                                                                {
                                                                    preserveState: true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    className={
                                                        !dataPendaftar.prev_page_url
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>

                                            {dataPendaftar.links
                                                .slice(1, -1)
                                                .map((link, i) => (
                                                    <PaginationItem
                                                        key={i}
                                                        className="hidden sm:block"
                                                    >
                                                        <PaginationLink
                                                            href={
                                                                link.url ?? '#'
                                                            }
                                                            isActive={
                                                                link.active
                                                            }
                                                            onClick={(e) => {
                                                                if (!link.url)
                                                                    e.preventDefault();
                                                                else {
                                                                    e.preventDefault();
                                                                    router.get(
                                                                        link.url,
                                                                        {},
                                                                        {
                                                                            preserveState: true,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {link.label}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}

                                            {/* Mobile Pagination Info (Optional) */}
                                            <span className="text-xs text-gray-500 sm:hidden">
                                                Halaman{' '}
                                                {dataPendaftar.current_page}
                                            </span>

                                            <PaginationItem>
                                                <PaginationNext
                                                    href={
                                                        dataPendaftar.next_page_url ??
                                                        '#'
                                                    }
                                                    onClick={(e) => {
                                                        if (
                                                            !dataPendaftar.next_page_url
                                                        )
                                                            e.preventDefault();
                                                        else {
                                                            e.preventDefault();
                                                            router.get(
                                                                dataPendaftar.next_page_url,
                                                                {},
                                                                {
                                                                    preserveState: true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    className={
                                                        !dataPendaftar.next_page_url
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
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
