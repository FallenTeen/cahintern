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
import { BookOpen, Calendar, Eye, Inbox, MapPin, Search, User } from 'lucide-react';
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
                </div>

<div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    
    {/* --- LOGIC 1: JIKA DATA KOSONG --- */}
    {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-gray-50 p-4">
                <Inbox className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Belum ada data pendaftaran aktif</h3>
            <p className="mt-1 text-sm text-gray-500">Data mahasiswa magang akan muncul di sini.</p>
        </div>
    ) : (
        <>
            {/* --- TAMPILAN DESKTOP (Table) --- */}
            {/* Hidden di mobile, muncul di layar LG ke atas */}
            <div className="hidden overflow-x-auto lg:block">
                <Table className="align-item-center w-full text-center text-sm">
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-center font-semibold text-gray-900">Nama Mahasiswa</TableHead>
                            <TableHead className="text-center font-semibold text-gray-900">Asal Instansi</TableHead>
                            <TableHead className="text-center font-semibold text-gray-900">Jurusan</TableHead>
                            <TableHead className="text-center font-semibold text-gray-900">NIM/NISN</TableHead>
                            <TableHead className="text-center font-semibold text-gray-900">Durasi</TableHead>
                            <TableHead className="text-center font-semibold text-gray-900">Mulai</TableHead>
                            <TableHead className="text-center font-semibold text-gray-900">Status</TableHead>
                            <TableHead className="text-center font-semibold text-gray-900">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((mhs) => (
                            <TableRow key={mhs.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium text-gray-900">{mhs.nama_lengkap}</TableCell>
                                <TableCell className="text-gray-600">{mhs.asal_instansi}</TableCell>
                                <TableCell className="text-gray-600">{mhs.jurusan}</TableCell>
                                <TableCell className="text-gray-600">{mhs.nim_nisn}</TableCell>
                                <TableCell className="text-gray-600">{mhs.waktu}</TableCell>
                                <TableCell className="text-gray-600">{mhs.tanggal_mulai}</TableCell>
                                <TableCell>
                                    <Badge
                                        className={`${
                                            mhs.status === 'Aktif'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } px-2.5 py-0.5 shadow-none`}
                                    >
                                        {mhs.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <Link href={dataMahasiswaAktifShow(mhs.id).url}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* --- TAMPILAN MOBILE (Card List) --- */}
            {/* Muncul di mobile, hidden di layar LG ke atas */}
            <div className="flex flex-col divide-y divide-gray-100 lg:hidden">
                {filteredData.map((mhs, index) => (
                    <div key={mhs.id} className="p-4 transition-colors hover:bg-gray-50">
                        {/* Header Card */}
                        <div className="mb-3 flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{mhs.nama_lengkap}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <span className="font-mono">{mhs.nim_nisn}</span>
                                    </div>
                                </div>
                            </div>
                            <Badge
                                className={`${
                                    mhs.status === 'Aktif'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                } px-2 py-0.5 text-[10px] shadow-none`}
                            >
                                {mhs.status}
                            </Badge>
                        </div>

                        {/* Body Card */}
                        <div className="ml-13 grid grid-cols-1 gap-y-2 text-sm text-gray-600 sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <span className="truncate">{mhs.asal_instansi}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                                <span className="truncate">{mhs.jurusan}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span>Mulai: {mhs.tanggal_mulai} ({mhs.waktu})</span>
                            </div>
                        </div>

                        {/* Footer Card */}
                        <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                            >
                                <Link href={dataMahasiswaAktifShow(mhs.id).url}>
                                    <Eye className="mr-2 h-3.5 w-3.5" /> Lihat Detail
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- LOGIC 2: PAGINATION --- */}
            {/* Hanya tampil jika total data lebih dari 10 */}
            {mahasiswaData.total > 10 && (
                <div className="border-t border-gray-200 bg-gray-50/50 p-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={mahasiswaData.links[0].url ?? '#'}
                                    onClick={(e) => {
                                        if (!mahasiswaData.links[0].url) e.preventDefault();
                                        else {
                                            e.preventDefault();
                                            router.get(mahasiswaData.links[0].url, {}, { preserveState: true });
                                        }
                                    }}
                                    className={!mahasiswaData.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>

                            {/* Logic loop pagination links */}
                            {mahasiswaData.links.slice(1, -1).map((link, index) => (
                                <PaginationItem key={index} className="hidden sm:block">
                                    {link.label === '...' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            href={link.url ?? '#'}
                                            isActive={link.active}
                                            onClick={(e) => {
                                                if (!link.url) e.preventDefault();
                                                else {
                                                    e.preventDefault();
                                                    router.get(link.url, {}, { preserveState: true });
                                                }
                                            }}
                                        >
                                            {link.label}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}
                            
                            {/* Mobile Pagination Info (Optional, pengganti angka di HP) */}
                            <span className="text-xs text-gray-500 sm:hidden">
                                Hal {mahasiswaData.current_page}
                            </span>

                            <PaginationItem>
                                <PaginationNext
                                    href={mahasiswaData.links[mahasiswaData.links.length - 1].url ?? '#'}
                                    onClick={(e) => {
                                        const nextUrl = mahasiswaData.links[mahasiswaData.links.length - 1].url;
                                        if (!nextUrl) e.preventDefault();
                                        else {
                                            e.preventDefault();
                                            router.get(nextUrl, {}, { preserveState: true });
                                        }
                                    }}
                                    className={!mahasiswaData.links[mahasiswaData.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
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
