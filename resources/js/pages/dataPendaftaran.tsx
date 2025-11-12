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
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Select } from '@radix-ui/react-select';
import { Check, Eye, Plus, Search, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Pendaftaran',
        href: dashboard().url,
    },
];

export default function DataPendaftaran({
    breadcrumbs,
}: {
    breadcrumbs?: any;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pendaftaran" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">
                        Data Pendaftaran
                    </h1>
                    <p className="text-sm text-gray-500 md:text-base">
                        Kelola data pendaftar magang ke Dinas Pendidikan
                        Banyumas
                    </p>
                </div>

                {/* Search & Filter & Tambah */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search dan Filter */}
                    <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-[280px]">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari nama pendaftar..."
                                className="w-full pl-9"
                            />
                        </div>
                        <Select>
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
                                <SelectItem value="proses">Proses</SelectItem>
                                <SelectItem value="ditolak">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tombol Tambah */}
                    <Button className="flex w-full items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 sm:w-auto">
                        <Plus className="h-4 w-4" />
                        <span>Tambah Pendaftar</span>
                    </Button>
                </div>

                {/* Table Container */}
                <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm">
                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto lg:block">
                        <Table className="align-item-center text-center">
                            <TableHeader className="text-center align-middle">
                                <TableRow className="bg-gray-50">
                                    <TableHead className="min-w-[180px] text-center align-middle">
                                        Nama Lengkap
                                    </TableHead>
                                    <TableHead className="min-w-[200px] text-center align-middle">
                                        Asal Instansi
                                    </TableHead>
                                    <TableHead className="min-w-[140px] text-center align-middle">
                                        Jurusan
                                    </TableHead>
                                    <TableHead className="min-w-[140px] text-center align-middle">
                                        Bidang Magang
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
                                {[...Array(10)].map((_, i) => (
                                    <TableRow
                                        key={i}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium">
                                            Febri Nur Hidayat
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            Universitas Amikom Purwokerto
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            Informatika
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            UMPEG
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            16 Minggu
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            01 Januari 2024
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                                                Diterima
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Icon Eye */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-blue-100"
                                                    title="Lihat Data"
                                                >
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>

                                                {/* Icon CakeSlice */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-green-100"
                                                    title="Lihat Detail"
                                                >
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </Button>

                                                {/* Icon X (hapus) */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-red-100"
                                                    title="Hapus"
                                                >
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="divide-y divide-gray-200 lg:hidden">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="p-4 transition-colors hover:bg-gray-50"
                            >
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                                    {i + 1}
                                                </span>
                                                <h3 className="font-semibold text-gray-900">
                                                    Febri Nur Hidayat
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Universitas Amikom Purwokerto
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-green-800">
                                            Diterima
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Jurusan
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                Informatika
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Bidang
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                UMPEG
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Durasi
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                16 Minggu
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Mulai
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                01 Jan 2024
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <TableCell className="flex items-center justify-center">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Icon Eye */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-gray-100"
                                                title="Lihat Data"
                                            >
                                                <Eye className="h-4 w-4 text-blue-500" />
                                            </Button>

                                            {/* Icon CakeSlice */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-green-100"
                                                title="Lihat Detail"
                                            >
                                                <Check className="h-4 w-4 text-green-500" />
                                            </Button>

                                            {/* Icon X (hapus) */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-red-100"
                                                title="Hapus"
                                            >
                                                <X className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-gray-200 p-4">
                        <Pagination>
                            <PaginationContent className="flex-wrap gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        className="h-9"
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        isActive
                                        className="h-9"
                                    >
                                        1
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#" className="h-9">
                                        2
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#" className="h-9">
                                        3
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext href="#" className="h-9" />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
