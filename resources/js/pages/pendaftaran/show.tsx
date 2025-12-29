import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dataPendaftaran } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Download,
    FileText,
    Mail,
    MapPin,
    Phone,
    Undo2,
    User,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Pendaftaran',
        href: dataPendaftaran().url,
    },
    {
        title: 'Detail Pendaftar',
        href: '#',
    },
];

interface PendaftarData {
    id: number;
    nama_lengkap: string;
    email: string;
    phone: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    kota: string;
    provinsi: string;
    jenis_peserta: string;
    nim_nisn: string;
    asal_instansi: string;
    jurusan: string;
    semester_kelas: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    waktu: string;
    cv: string | null;
    surat_pengantar: string | null;
    form_kesanggupan: string | null;
    nama_pembimbing: string | null;
    no_hp_pembimbing: string | null;
    status: string;
    alasan_tolak: string | null;
}

export default function ShowPendaftaran({
    pendaftar,
}: {
    pendaftar: PendaftarData;
}) {
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
            <Head title="Detail Pendaftar" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Detail Pendaftar
                        </h1>
                        <p className="text-sm text-gray-500 md:text-base">
                            Informasi lengkap pendaftar magang
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit(dataPendaftaran().url)}
                        className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 hover:text-white"
                    >
                        <Undo2 className="h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="border-0 p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Informasi Pribadi
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Data pribadi pendaftar
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Nama Lengkap
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.nama_lengkap}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Email
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Nomor Telepon
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.phone}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Tempat, Tanggal Lahir
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.tempat_lahir},{' '}
                                        {pendaftar.tanggal_lahir}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Jenis Kelamin
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.jenis_kelamin}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">
                                        Alamat Lengkap
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.alamat}, {pendaftar.kota},{' '}
                                        {pendaftar.provinsi}
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-0 p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-3">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Informasi Akademik
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Data akademik dan institusi
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Jenis Peserta
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">
                                        {pendaftar.jenis_peserta}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        {pendaftar.jenis_peserta === 'mahasiswa'
                                            ? 'NIM'
                                            : 'NIS'}
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.nim_nisn}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Asal Instansi
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.asal_instansi}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Jurusan/Program Studi
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.jurusan}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        {pendaftar.jenis_peserta === 'mahasiswa'
                                            ? 'Semester'
                                            : 'Kelas'}
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.semester_kelas}
                                    </p>
                                </div>
                                {pendaftar.nama_pembimbing && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Nama Pembimbing
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftar.nama_pembimbing}
                                        </p>
                                    </div>
                                )}
                                {pendaftar.no_hp_pembimbing && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            No. HP Pembimbing
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {pendaftar.no_hp_pembimbing}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                        <Card className="border-0 p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-3">
                                    <MapPin className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Informasi Magang
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Detail program magang
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Durasi Magang
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.waktu}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Tanggal Mulai
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.tanggal_mulai}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Tanggal Selesai
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {pendaftar.tanggal_selesai}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {(pendaftar.cv || pendaftar.surat_pengantar) && (
                            <Card className="border-0 p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-100 p-3">
                                        <FileText className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Dokumen
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            File yang diunggah pendaftar
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {pendaftar.cv && (
                                        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Curriculum Vitae (CV)
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PDF Document
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        pendaftar.cv!,
                                                        '_blank',
                                                    )
                                                }
                                                className="flex items-center gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Lihat
                                            </Button>
                                        </div>
                                    )}
                                    {pendaftar.surat_pengantar && (
                                        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Surat Pengantar
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PDF Document
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        pendaftar.surat_pengantar!,
                                                        '_blank',
                                                    )
                                                }
                                                className="flex items-center gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Lihat
                                            </Button>
                                        </div>
                                    )}
                                    {
                                        pendaftar.form_kesanggupan && (
                                            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Form Kesanggupan
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            PDF Document
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        window.open(
                                                            pendaftar.form_kesanggupan!,
                                                            '_blank',
                                                        )
                                                    }
                                                    className="flex items-center gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Lihat
                                                </Button>
                                            </div>
                                        )
                                    }
                                </div>
                            </Card>
                        )}
                    </div>
                    <div className="space-y-6">
                        <Card className="border-0 p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Status Pendaftaran
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(pendaftar.status)}`}
                                        >
                                            {pendaftar.status}
                                        </span>
                                    </div>
                                </div>
                                {pendaftar.status === 'Ditolak' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Alasan Penolakan
                                        </label>
                                        <p className="mt-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-gray-900">
                                            {pendaftar.alasan_tolak}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card className="border-0 p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Kontak Cepat
                            </h2>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        window.open(`mailto:${pendaftar.email}`)
                                    }
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        window.open(`tel:${pendaftar.phone}`)
                                    }
                                >
                                    <Phone className="mr-2 h-4 w-4" />
                                    Telepon
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
