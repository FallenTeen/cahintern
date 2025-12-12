import { Badge } from '@/components/ui/badge';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dataMahasiswaAktif } from '@/routes';
import { show as dataMahasiswaAktifShow } from '@/routes/dataMahasiswaAktif';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type MahasiswaData = {
    id: number;
    nama_lengkap: string;
    email: string;
    nim_nisn: string;
    asal_instansi: string;
    jurusan: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    waktu: string;
    status: string;
    nilai_akhir: number | null;
    predikat: string | null;
    sertifikat: string | null;
};

type Props = {
    mahasiswaData: {
        data: MahasiswaData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

interface PaginatedData {
    data: MahasiswaData[];
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Mahasiswa Aktif',
        href: dataMahasiswaAktif().url,
    },
];

export default function DataMahasiswaAktif({
    mahasiswaData,
}: {
    mahasiswaData: PaginatedData;
}) {
    const [search, setSearch] = useState('');

    const dataMahasiswa = mahasiswaData.data;

    const filteredData = useMemo(() => {
        let filtered = dataMahasiswa;

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (m) =>
                    m.nama_lengkap.toLowerCase().includes(q) ||
                    m.asal_instansi.toLowerCase().includes(q) ||
                    m.jurusan.toLowerCase().includes(q),
            );
        }

        return filtered;
    }, [dataMahasiswa, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Mahasiswa Aktif" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">
                        Data Mahasiswa Aktif
                    </h2>
                    <p className="text-sm text-gray-500 md:text-base">
                        Kelola data pendaftar magang ke Dinas Pendidikan
                        Banyumas
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
                        <div className="relative w-full gap-2 sm:w-[400px]">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari berdasarkan nama, universitas, atau jurusan..."
                                className="w-full pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* <Button className="bg-red-600 text-white hover:bg-red-700">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Mahasiswa
                    </Button> */}
                </div>

                {/* <p className="text-sm text-gray-500">
                    Menampilkan {filteredData.length} dari{' '}
                    {dataMahasiswa.length} mahasiswa aktif
                </p> */}
                <div className="overflow-hidden rounded-lg border shadow-sm">
                    <Table className="align-item-center text-center">
                        <TableHeader className="text-center align-middle">
                            <TableRow className="bg-gray-100">
                                <TableHead className="text-center align-middle">
                                    Nama Mahasiswa
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Asal Instansi
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Jurusan
                                </TableHead>

                                <TableHead className="text-center align-middle">
                                    NIM/NISN
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Durasi Magang
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Tanggal Mulai
                                </TableHead>
                                <TableHead className="text-center align-middle">
                                    Status
                                </TableHead>
                                <TableHead className="text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((mhs) => (
                                <TableRow key={mhs.id}>
                                    <TableCell>{mhs.nama_lengkap}</TableCell>
                                    <TableCell>{mhs.asal_instansi}</TableCell>
                                    <TableCell>{mhs.jurusan}</TableCell>

                                    <TableCell>{mhs.nim_nisn}</TableCell>
                                    <TableCell>{mhs.waktu}</TableCell>
                                    <TableCell>{mhs.tanggal_mulai}</TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                mhs.status === 'Aktif'
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-gray-400 text-white'
                                            }
                                        >
                                            {mhs.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <Link
                                                href={
                                                    dataMahasiswaAktifShow(
                                                        mhs.id,
                                                    ).url
                                                }
                                            >
                                                <Eye className="h-4 w-4 text-blue-600" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="border-t border-gray-200 p-4">
                        <Pagination>
                            <PaginationContent className="flex-wrap gap-1">
                                {mahasiswaData.links.map((link, index) => {
                                    const isPrevious = link.label
                                        .toLowerCase()
                                        .includes('previous');
                                    const isNext = link.label
                                        .toLowerCase()
                                        .includes('next');
                                    const isEllipsis = link.label === '...';

                                    if (isPrevious) {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationPrevious
                                                    href={link.url || '#'}
                                                    className="h-9"
                                                    onClick={(e) => {
                                                        if (!link.url)
                                                            e.preventDefault();
                                                        else
                                                            router.get(
                                                                link.url,
                                                            );
                                                    }}
                                                />
                                            </PaginationItem>
                                        );
                                    }

                                    if (isNext) {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationNext
                                                    href={link.url || '#'}
                                                    className="h-9"
                                                    onClick={(e) => {
                                                        if (!link.url)
                                                            e.preventDefault();
                                                        else
                                                            router.get(
                                                                link.url,
                                                            );
                                                    }}
                                                />
                                            </PaginationItem>
                                        );
                                    }

                                    if (isEllipsis) {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }

                                    return (
                                        <PaginationItem key={index}>
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
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
