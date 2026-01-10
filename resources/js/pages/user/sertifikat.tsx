import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { sertifikat } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Award,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    FileText,
    Hash,
    Lock,
    XCircle,
} from 'lucide-react';
import FloatingWhatsapp from '../whatsappCs';

interface SertifikatData {
    id: number;
    nomor_sertifikat: string;
    tanggal_terbit: string;
    file_path: string;
    approval_status: 'pending' | 'approved' | 'rejected';
    is_published: boolean;
}

interface Props {
    sertifikat: SertifikatData | null;
    progress: number;
    total_hari: number;
    hari_selesai: number;
}

type PageProps = SharedData & Props;

export default function Sertifikat() {
    const {
        sertifikat: sertifikatData,
        progress,
        total_hari,
        hari_selesai,
    } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sertifikat', href: sertifikat().url },
    ];

    const statusMap = {
        approved: {
            text: 'Valid & Disetujui',
            color: 'text-green-700',
            bg: 'bg-green-100 border-green-200',
            icon: <CheckCircle className="h-4 w-4" />,
        },
        pending: {
            text: 'Menunggu Persetujuan',
            color: 'text-yellow-700',
            bg: 'bg-yellow-100 border-yellow-200',
            icon: <Clock className="h-4 w-4" />,
        },
        rejected: {
            text: 'Pengajuan Ditolak',
            color: 'text-red-700',
            bg: 'bg-red-100 border-red-200',
            icon: <XCircle className="h-4 w-4" />,
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sertifikat Magang" />

            {/* HERO SECTION DENGAN PATTERN */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-700 to-red-600 pt-10 pb-20">
                {/* Decorative background pattern (optional) */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'radial-gradient(#ffffff 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                ></div>

                <div className="relative mx-auto max-w-6xl px-6 text-center md:text-left">
                    <div className="flex flex-col items-center gap-4 md:flex-row">
                        <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                            <Award className="h-8 w-8 text-white md:h-10 md:w-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white md:text-3xl">
                                Sertifikat Magang
                            </h1>
                            <p className="mt-1 text-sm text-red-100 md:text-base">
                                Dokumen resmi penyelesaian program
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT - Menggunakan negative margin agar card "naik" ke atas hero */}
            <div className="relative mx-auto -mt-12 max-w-4xl px-4 pb-12 md:px-6">
                {sertifikatData && sertifikatData.is_published ? (
                    <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
                        <CardHeader className="bg-white pt-6 pb-2">
                            <div className="flex justify-center">
                                <div
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm ${
                                        statusMap[
                                            sertifikatData.approval_status
                                        ].bg
                                    } ${
                                        statusMap[
                                            sertifikatData.approval_status
                                        ].color
                                    }`}
                                >
                                    {
                                        statusMap[
                                            sertifikatData.approval_status
                                        ].icon
                                    }
                                    <span>
                                        {
                                            statusMap[
                                                sertifikatData.approval_status
                                            ].text
                                        }
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 md:p-8">
                            <div className="group relative w-full overflow-hidden rounded-xl border bg-gray-100 shadow-inner"></div>
                            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50">
                                    <div className="rounded-lg bg-white p-2 shadow-sm">
                                        <Hash className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Nomor Sertifikat
                                        </p>
                                        <p className="mt-0.5 font-mono font-semibold break-all text-gray-900">
                                            {sertifikatData.nomor_sertifikat}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50">
                                    <div className="rounded-lg bg-white p-2 shadow-sm">
                                        <Calendar className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                                            Tanggal Terbit
                                        </p>
                                        <p className="mt-0.5 font-semibold text-gray-900">
                                            {new Date(
                                                sertifikatData.tanggal_terbit,
                                            ).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                                <Button
                                    size="lg"
                                    className="w-full rounded-xl bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-700 md:w-auto"
                                    onClick={() =>
                                        window.open(
                                            `/sertifikat/${sertifikatData.id}/download`,
                                            '_blank',
                                        )
                                    }
                                >
                                    <Download className="mr-2 h-5 w-5" />
                                    Download PDF
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full rounded-xl md:w-auto"
                                    onClick={() =>
                                        window.open(
                                            `/sertifikat/${sertifikatData.id}/preview`,
                                            '_blank',
                                        )
                                    }
                                >
                                    <FileText className="mr-2 h-5 w-5" />
                                    Preview Sertifikat
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* EMPTY STATE CARD */
                    <Card className="border-none shadow-xl shadow-gray-200/50">
                        <CardContent className="flex flex-col items-center p-8 text-center md:p-12">
                            <div className="mb-6 rounded-full bg-gray-50 p-6 ring-1 ring-gray-100">
                                <Lock className="h-10 w-10 text-gray-400" />
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                                Sertifikat Belum Tersedia
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 md:text-base">
                                Sertifikat Anda terkunci. Mohon selesaikan
                                seluruh periode magang dan pastikan laporan
                                akhir telah disetujui.
                            </p>

                            <div className="mt-8 w-full max-w-sm rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                                <div className="mb-2 flex justify-between text-sm font-medium">
                                    <span className="text-gray-700">
                                        Progress Magang
                                    </span>
                                    <span
                                        className={
                                            progress === 100
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }
                                    >
                                        {progress}%
                                    </span>
                                </div>
                                <Progress
                                    value={progress}
                                    className="h-3 w-full rounded-full bg-gray-200"
                                    // Anda bisa menambahkan styling custom indicator di global css jika progress bar default shadcn kurang berwarna
                                />
                                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>
                                        {hari_selesai} dari {total_hari} hari
                                        selesai
                                    </span>
                                </div>
                            </div>
                            <FloatingWhatsapp />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
