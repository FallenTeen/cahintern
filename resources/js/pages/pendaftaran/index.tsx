import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
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
import { Check, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Pendaftaran',
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
            <Head title="Data Pendaftaran" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">Data Pendaftaran</h1>
                    <p className="text-sm text-gray-500 md:text-base">
                        Kelola data pendaftar magang ke Dinas Pendidikan
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
                            <span>Tambah Pendaftar</span>
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="hidden overflow-x-auto lg:block">
                        <Table className="align-item-center text-center">
                            <TableHeader className="text-center align-middle">
                                <TableRow className="bg-gray-100">
                                    <TableHead className="min-w-[180px] text-center align-middle">
                                        Nama Lengkap
                                    </TableHead>
                                    <TableHead className="min-w-[200px] text-center align-middle">
                                        Asal Instansi
                                    </TableHead>
                                    <TableHead className="min-w-[140px] text-center align-middle">
                                        Jurusan
                                    </TableHead>

                                    <TableHead className="min-w-[100px] text-center align-middle">
                                        Waktu
                                    </TableHead>
                                    <TableHead className="min-w-[140px] text-center align-middle">
                                        Tanggal Mulai
                                    </TableHead>
                                    <TableHead className="min-w-[100px] text-center align-middle">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-[100px] text-center align-middle">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dataPendaftar.data.map((pendaftar) => (
                                    <TableRow
                                        key={pendaftar.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium">
                                            {pendaftar.nama_lengkap}
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {pendaftar.asal_instansi}
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {pendaftar.jurusan}
                                        </TableCell>

                                        <TableCell className="text-gray-600">
                                            {pendaftar.waktu}
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {pendaftar.tanggal_mulai}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(pendaftar.status)}`}
                                            >
                                                {pendaftar.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-blue-100"
                                                    title="Lihat Data"
                                                    onClick={() =>
                                                        router.visit(
                                                            showPendaftaran(
                                                                pendaftar.id,
                                                            ).url,
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>

                                                {pendaftar.status ===
                                                    'Proses' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-green-100"
                                                            title="Terima"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    pendaftar.id,
                                                                )
                                                            }
                                                        >
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-orange-100"
                                                            title="Tolak"
                                                            onClick={() =>
                                                                handleReject(
                                                                    pendaftar.id,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4 text-orange-500" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-red-100"
                                                    title="Hapus"
                                                    onClick={() =>
                                                        handleDelete(
                                                            pendaftar.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="divide-y divide-gray-200 lg:hidden">
                        {dataPendaftar.data.map((pendaftar, index) => (
                            <div
                                key={pendaftar.id}
                                className="p-4 transition-colors hover:bg-gray-50"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                                    {index + 1}
                                                </span>
                                                <h3 className="font-semibold text-gray-900">
                                                    {pendaftar.nama_lengkap}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {pendaftar.asal_instansi}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${getStatusColor(pendaftar.status)}`}
                                        >
                                            {pendaftar.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Jurusan
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {pendaftar.jurusan}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Durasi
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {pendaftar.waktu}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Mulai
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {pendaftar.tanggal_mulai}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-gray-100"
                                            title="Lihat Data"
                                            onClick={() =>
                                                router.visit(
                                                    showPendaftaran(
                                                        pendaftar.id,
                                                    ).url,
                                                )
                                            }
                                        >
                                            <Eye className="h-4 w-4 text-blue-500" />
                                        </Button>

                                        {pendaftar.status === 'Proses' && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-green-100"
                                                    title="Terima"
                                                    onClick={() =>
                                                        handleApprove(
                                                            pendaftar.id,
                                                        )
                                                    }
                                                >
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-orange-100"
                                                    title="Tolak"
                                                    onClick={() =>
                                                        handleReject(
                                                            pendaftar.id,
                                                        )
                                                    }
                                                >
                                                    <X className="h-4 w-4 text-orange-500" />
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-red-100"
                                            title="Hapus"
                                            onClick={() =>
                                                handleDelete(pendaftar.id)
                                            }
                                        >
                                            <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 p-4">
                        <Pagination>
                            <PaginationContent className="flex-wrap gap-1">
                                {dataPendaftar.links.map((link, index) => (
                                    <PaginationItem key={index}>
                                        {link.label.includes('Previous') ? (
                                            <PaginationPrevious
                                                href={link.url || '#'}
                                                className="h-9"
                                                onClick={(e) => {
                                                    if (!link.url)
                                                        e.preventDefault();
                                                    else router.get(link.url);
                                                }}
                                            />
                                        ) : link.label.includes('Next') ? (
                                            <PaginationNext
                                                href={link.url || '#'}
                                                className="h-9"
                                                onClick={(e) => {
                                                    if (!link.url)
                                                        e.preventDefault();
                                                    else router.get(link.url);
                                                }}
                                            />
                                        ) : link.label === '...' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href={link.url || '#'}
                                                isActive={link.active}
                                                className="h-9"
                                                onClick={(e) => {
                                                    if (!link.url)
                                                        e.preventDefault();
                                                    else router.get(link.url);
                                                }}
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
