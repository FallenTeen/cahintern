import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash } from 'lucide-react';
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
        title: 'Kelola Peserta',
        href: dashboard().url,
    },
];

export default function DataPICPage() {
    const { picData } = usePage<Props>().props;
    const [dataPIC] = useState<PICData[]>(picData.data);
    const [isDesktop, setIsDesktop] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Peserta" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold">
                            Kelola Peserta
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
                {filteredPIC.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                        Tidak ada data yang cocok dengan pencarian.
                    </div>
                ) : isDesktop ? (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-3 text-left">
                                        Nama Peserta
                                    </th>

                                    <th className="p-3 text-left">NIM/NISN</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">
                                        Asal Instansi
                                    </th>
                                    <th className="p-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPIC.map((pic) => (
                                    <tr
                                        key={pic.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3">
                                            {pic.nama_lengkap}
                                        </td>

                                        <td className="p-3">{pic.nim_nisn}</td>
                                        <td className="p-3">{pic.email}</td>
                                        <td className="p-3">
                                            {pic.asal_instansi}
                                        </td>
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
                    <div className="grid grid-cols-1 gap-4">
                        {filteredPIC.map((pic) => (
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
                                    <div className="flex justify-between"></div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">
                                            Email:
                                        </span>
                                        <span className="truncate text-right">
                                            {pic.email}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">
                                            Asal Instansi:
                                        </span>
                                        <span>{pic.asal_instansi}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">
                                            Status:
                                        </span>
                                        <Badge variant="secondary">
                                            {pic.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
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
            </div>
        </AppLayout>
    );
}
