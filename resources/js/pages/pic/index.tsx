import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Eye, 
    Pencil, 
    Search, 
    Trash, 
    Inbox // <-- Import Icon Inbox
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type PICData = {
    id: number;
    nama_lengkap: string;
    email: string;
    nim_nisn: string;
    asal_instansi: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    waktu: string;
    status: string;
    absensi_count: number;
    logbook_count: number;
    logbook_approved: number;
    nilai_akhir: number | null;
    predikat: string | null;
};

type Props = {
    picData: {
        data: PICData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola Akun Peserta',
        href: dashboard().url,
    },
];

export default function DataPICPage() {
    const { picData } = usePage<Props>().props;
    const [dataPIC] = useState<PICData[]>(picData.data);
    
    const [isDesktop, setIsDesktop] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. FILTER DATA
    const filteredPIC = useMemo(() => {
        return dataPIC.filter((pic) => {
            const q = searchTerm.toLowerCase();
            return (
                pic.nama_lengkap.toLowerCase().includes(q) ||
                pic.email.toLowerCase().includes(q) ||
                pic.nim_nisn.toLowerCase().includes(q)
            );
        });
    }, [dataPIC, searchTerm]);

    // 2. RESET HALAMAN SAAT SEARCH
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // 3. LOGIKA PAGINATION
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPIC.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPIC.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Akun Peserta" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold">
                            Kelola Akun Peserta
                        </h2>
                        <p className="text-sm text-gray-500 md:text-base">
                            Kelola data peserta
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <div className="relative w-full sm:w-1/2">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari berdasarkan nama, email, atau jabatan..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* CUSTOM EMPTY STATE SESUAI GAMBAR */}
                    {filteredPIC.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm min-h-[400px]">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                                <Inbox className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Belum ada data pendaftaran aktif
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Data mahasiswa magang akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* TAMPILAN DESKTOP (TABLE) */}
                            {isDesktop ? (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="p-3 text-left">Nama Peserta</th>
                                                <th className="p-3 text-left">NIM/NISN</th>
                                                <th className="p-3 text-left">Email</th>
                                                <th className="p-3 text-left">Asal Instansi</th>
                                                <th className="p-3 text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((pic) => (
                                                <tr
                                                    key={pic.id}
                                                    className="border-t hover:bg-gray-50"
                                                >
                                                    <td className="p-3">{pic.nama_lengkap}</td>
                                                    <td className="p-3">{pic.nim_nisn}</td>
                                                    <td className="p-3">{pic.email}</td>
                                                    <td className="p-3">{pic.asal_instansi}</td>
                                                    <td className="p-3">
                                                        <Badge
                                                            className={
                                                                pic.status === 'Menunggu Verifikasi'
                                                                    ? 'bg-yellow-100 text-yellow-900'
                                                                    : pic.status === 'Aktif'
                                                                    ? 'bg-green-100 text-green-900'
                                                                    : pic.status === 'Ditolak'
                                                                    ? 'bg-red-100 text-red-900'
                                                                    : ''
                                                            }
                                                        >
                                                            {pic.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                /* TAMPILAN MOBILE (CARD GRID) */
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {currentItems.map((pic) => (
                                        <Card
                                            key={pic.id}
                                            className="rounded-2xl shadow-md"
                                        >
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg font-semibold">
                                                    {pic.nama_lengkap}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {pic.nim_nisn}
                                                </p>
                                            </CardHeader>
                                            <CardContent className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Email:</span>
                                                    <span className="max-w-[200px] truncate text-right">
                                                        {pic.email}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Asal Instansi:</span>
                                                    <span>{pic.asal_instansi}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">Status:</span>
                                                    <Badge variant="secondary">
                                                        {pic.status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 flex justify-end gap-3 border-t pt-2">
                                                    <Button variant="ghost" size="icon">
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <Trash size={16} />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* KOMPONEN PAGINATION */}
                            {filteredPIC.length > itemsPerPage && (
                                <div className="mt-2 flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
                                    <div className="text-sm text-muted-foreground">
                                        Menampilkan {indexOfFirstItem + 1} hingga{' '}
                                        {Math.min(indexOfLastItem, filteredPIC.length)} dari{' '}
                                        {filteredPIC.length} peserta
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="sr-only">Previous</span>
                                        </Button>

                                        <div className="text-sm font-medium">
                                            Halaman {currentPage} dari {totalPages}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Next</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}