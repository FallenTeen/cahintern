import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Eye, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { show as dataMahasiswaAktifShow } from '@/routes/dataMahasiswaAktif';
import { type BreadcrumbItem } from '@/types';

type MahasiswaData = {
    id: number;
    nama_lengkap: string;
    email: string;
    nim_nisn: string;
    asal_instansi: string;
    jurusan: string;
    bidang_magang: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    waktu: string;
    status: string;
    nilai_akhir: number | null;
    predikat: string | null;
    sertifikat: string | null;
};

type BidangOption = {
    id: number;
    nama_bidang: string;
};

type Props = {
    mahasiswaData: {
        data: MahasiswaData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    bidangOptions: BidangOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function DataMahasiswaAktif() {
    const { mahasiswaData, bidangOptions } = usePage<Props>().props;
    const [filter, setFilter] = useState('Semua');
    const [search, setSearch] = useState('');

    const dataMahasiswa = mahasiswaData.data;

    const bidangList = ['Semua', ...bidangOptions.map(b => b.nama_bidang)];

    const filteredData = useMemo(() => {
        let filtered = dataMahasiswa;

        if (filter !== 'Semua') {
            filtered = filtered.filter((m) => m.bidang_magang === filter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter((m) =>
                m.nama_lengkap.toLowerCase().includes(q) ||
                m.asal_instansi.toLowerCase().includes(q) ||
                m.jurusan.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [dataMahasiswa, filter, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Mahasiswa Aktif" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">
                            Data Mahasiswa Aktif
                        </h2>
                        <p className="text-sm text-gray-500">
                            Kelola data pendaftar magang ke Dinas Pendidikan
                            Banyumas
                        </p>
                    </div>
                    <Button className="bg-red-600 text-white hover:bg-red-700">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Mahasiswa
                    </Button>
                </div>
                <Input
                    placeholder="Cari berdasarkan nama, universitas, atau jurusan..."
                    className="max-w-md"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                    {bidangList.map((b) => (
                        <Button
                            key={b}
                            variant={filter === b ? 'default' : 'outline'}
                            onClick={() => setFilter(b)}
                            className={
                                filter === b
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'text-gray-700'
                            }
                        >
                            {b}
                        </Button>
                    ))}
                </div>
                <p className="text-sm text-gray-500">
                    Menampilkan {filteredData.length} dari{' '}
                    {dataMahasiswa.length} mahasiswa aktif
                </p>
                <div className="overflow-hidden rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead>Nama Mahasiswa</TableHead>
                                <TableHead>Asal Instansi</TableHead>
                                <TableHead>Jurusan</TableHead>
                                <TableHead>Bidang</TableHead>
                                <TableHead>NIM/NISN</TableHead>
                                <TableHead>Durasi Magang</TableHead>
                                <TableHead>Tanggal Mulai</TableHead>
                                <TableHead>Status</TableHead>
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
                                    <TableCell>{mhs.bidang_magang}</TableCell>
                                    <TableCell>{mhs.nim_nisn}</TableCell>
                                    <TableCell>{mhs.waktu}</TableCell>
                                    <TableCell>{mhs.tanggal_mulai}</TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                mhs.status === 'Aktif'
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
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
                                            <Link href={dataMahasiswaAktifShow(mhs.id).url}>
                                                <Eye className="h-4 w-4 text-blue-600" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
