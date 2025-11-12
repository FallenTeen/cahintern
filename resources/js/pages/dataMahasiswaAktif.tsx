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
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function DataMahasiswaAktif() {
    const [filter, setFilter] = useState('Semua');

    const dataMahasiswa = [
        {
            nama: 'Budi Santoso',
            universitas: 'Universitas Jenderal Soedirman',
            jurusan: 'Pendidikan Teknik',
            bidang: 'Sapras',
            pic: 'Ibu Hartati',
            durasi: '2 bulan',
            mulai: '01/01/2025',
            status: 'Aktif',
        },
        {
            nama: 'Siti Nurhaliza',
            universitas: 'Universitas Negeri Yogyakarta',
            jurusan: 'Pendidikan Guru Kelas',
            bidang: 'PGTK',
            pic: 'Bapak Supriyanto',
            durasi: '3 bulan',
            mulai: '05/01/2025',
            status: 'Aktif',
        },
        {
            nama: 'Ahmad Hidayat',
            universitas: 'Institut Teknologi Purwokerto',
            jurusan: 'Teknik Informatika',
            bidang: 'Umum',
            pic: 'Ibu Dewi',
            durasi: '2 bulan',
            mulai: '08/01/2025',
            status: 'Aktif',
        },
        {
            nama: 'Rina Putri',
            universitas: 'Universitas Muhammadiyah Purwokerto',
            jurusan: 'Pendidikan IPA',
            bidang: 'Kurikulum',
            pic: 'Bapak Haryanto',
            durasi: '3 bulan',
            mulai: '10/12/2024',
            status: 'Non-Aktif',
        },
        {
            nama: 'Yudi Hermawan',
            universitas: 'Universitas Jenderal Soedirman',
            jurusan: 'Pendidikan Bahasa Inggris',
            bidang: 'GTK',
            pic: 'Ibu Tri Wahyuni',
            durasi: '2 bulan',
            mulai: '03/01/2025',
            status: 'Aktif',
        },
    ];

    const bidangList = ['Sapras', 'Umum', 'PGTK', 'Kurikulum', 'GTK', 'Semua'];

    const filteredData =
        filter === 'Semua'
            ? dataMahasiswa
            : dataMahasiswa.filter((m) => m.bidang === filter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Mahasiswa Aktif" />
            <div className="space-y-4 p-6">
                {/* Header */}
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

                {/* Search */}
                <Input
                    placeholder="Cari berdasarkan nama, universitas, atau jurusan..."
                    className="max-w-md"
                />

                {/* Filter */}
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

                {/* Info jumlah data */}
                <p className="text-sm text-gray-500">
                    Menampilkan {filteredData.length} dari{' '}
                    {dataMahasiswa.length} mahasiswa aktif
                </p>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead>Nama Mahasiswa</TableHead>
                                <TableHead>Universitas</TableHead>
                                <TableHead>Jurusan</TableHead>
                                <TableHead>Bidang</TableHead>
                                <TableHead>PIC Pembimbing</TableHead>
                                <TableHead>Durasi Magang</TableHead>
                                <TableHead>Tanggal Mulai</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((mhs, i) => (
                                <TableRow key={i}>
                                    <TableCell>{mhs.nama}</TableCell>
                                    <TableCell>{mhs.universitas}</TableCell>
                                    <TableCell>{mhs.jurusan}</TableCell>
                                    <TableCell>{mhs.bidang}</TableCell>
                                    <TableCell>{mhs.pic}</TableCell>
                                    <TableCell>{mhs.durasi}</TableCell>
                                    <TableCell>{mhs.mulai}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                mhs.status === 'Aktif'
                                                    ? 'success'
                                                    : 'secondary'
                                            }
                                            className={
                                                mhs.status === 'Aktif'
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : 'bg-gray-400'
                                            }
                                        >
                                            {mhs.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4 text-blue-600" />
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
