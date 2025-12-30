import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    ExternalLink,
    Paperclip,
    Undo2,
} from 'lucide-react';

interface AbsensiData {
    peserta_profile_id: number;
    name: string;
    tanggal: string;
    jam_masuk: string | null;
    jam_keluar: string | null;
    status: string;
    keterangan?: string;
    surat?: string | null;
    status_approval?: string | null;
}

const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('hadir')) return 'bg-green-500 text-white';
    if (s.includes('izin')) return 'bg-yellow-500 text-white';
    if (s.includes('sakit')) return 'bg-blue-500 text-white';
    if (s.includes('terlambat')) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Absensi', href: '/absen-mahasiswa' },
    { title: 'Detail', href: '#' },
];

const ShowAbsensi = ({ absensi }: { absensi: AbsensiData }) => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Absensi" />

            <div className="mt-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Absensi Peserta
                    </h1>
                    <div className="mb-3 flex items-center gap-3">
                        <Button
                            variant="destructive"
                            onClick={() => window.history.back()}
                        >
                            <Undo2 /> Kembali
                        </Button>
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {/* Header Simple */}
                    <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {absensi.name}
                                </h2>
                            </div>
                            {absensi.status_approval && (
                                <div className="flex items-start gap-3">
                                    <span className="font-semibold text-gray-900 capitalize">
                                        {absensi.status_approval && (
                                            <div className="flex items-start gap-3">
                                                <div>
                                                    <span
                                                        className={`font-semibold capitalize ${
                                                            absensi.status_approval.toLowerCase() ===
                                                            'disetujui'
                                                                ? 'flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600'
                                                                : absensi.status_approval.toLowerCase() ===
                                                                    'ditolak'
                                                                  ? 'flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600'
                                                                  : 'flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-600'
                                                        }`}
                                                    >
                                                        {
                                                            absensi.status_approval
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="px-6 py-6">
                        {/* Grid Informasi Utama */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Tanggal */}
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Tanggal
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {absensi.tanggal}
                                    </p>
                                </div>
                            </div>

                            <div className="items-start gap-3">
                                <p className="text-sm font-medium text-gray-500">
                                    Status
                                </p>

                                <Badge
                                    className={`${getStatusColor(absensi.status)} border-0 px-2.5 py-0.5 shadow-none`}
                                >
                                    { absensi.status}
                                </Badge>
                            </div>

                            {/* Jam Masuk */}
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Jam Masuk
                                    </p>
                                    <p className="font-mono text-base font-semibold text-gray-900">
                                        {absensi.jam_masuk || '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Jam Pulang */}
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Jam Pulang
                                    </p>
                                    <p className="font-mono text-base font-semibold text-gray-900">
                                        {absensi.jam_keluar || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="my-6 border-t border-gray-100"></div>

                        {/* Bagian Bawah: Lampiran & Keterangan */}
                        <div className="space-y-4">
                            {/* Keterangan */}
                            {absensi.keterangan ? (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Keterangan / Catatan
                                    </label>
                                    <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                                        {absensi.keterangan}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">
                                    Tidak ada keterangan tambahan.
                                </p>
                            )}

                            {/* Lampiran File */}
                            {absensi.surat && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Bukti Lampiran
                                    </label>
                                    <a
                                        href={`/storage/${absensi.surat}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                            <Paperclip className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                Lihat Dokumen
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Klik untuk membuka file
                                            </p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-gray-400" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ShowAbsensi;
