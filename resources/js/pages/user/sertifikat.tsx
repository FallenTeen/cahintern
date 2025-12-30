import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { sertifikat } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { HardDriveDownload, Info, Mail, Phone } from 'lucide-react';
import WhatsappCS from '../whatsappCs';
import FloatingWhatsapp from '../whatsappCs';

interface SertifikatData {
    id: number;
    nomor_sertifikat: string;
    tanggal_terbit: string;
    file_path: string;
    approval_status: 'pending' | 'approved' | 'rejected';
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

    const getApprovalStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Sertifikat telah disetujui';
            case 'rejected':
                return 'Sertifikat ditolak';
            case 'pending':
                return 'Sertifikat menunggu persetujuan admin';
            default:
                return 'Sertifikat belum tersedia';
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            case 'pending':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sertifikat Magang" />
            <div className="flex min-h-screen w-full flex-col gap-6 bg-gray-50 p-6">
                <h1 className="text-2xl font-bold">Sertifikat Magang</h1>
                <p className="-mt-3 text-gray-600">
                    Lihat dan unduh sertifikat setelah program magang selesai
                </p>

                {sertifikatData &&
                sertifikatData.approval_status === 'approved' ? (
                    <Card className="w-full rounded-2xl border shadow-sm">
                        <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
                            <img
                                src="/mnt/data/e4350eb8-9f24-4e1f-8c32-0c20b1a7758c.png"
                                alt="Certificate"
                                className="w-full max-w-3xl rounded-lg shadow-md"
                            />
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    Nomor Sertifikat:{' '}
                                    {sertifikatData.nomor_sertifikat}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Tanggal Terbit:{' '}
                                    {new Date(
                                        sertifikatData.tanggal_terbit,
                                    ).toLocaleDateString('id-ID')}
                                </p>
                                <p
                                    className={`text-sm font-medium ${getApprovalStatusColor(sertifikatData.approval_status)}`}
                                >
                                    {getApprovalStatusText(
                                        sertifikatData.approval_status,
                                    )}
                                </p>
                            </div>
                            <Button
                                className="rounded-full bg-red-600 px-8 py-2 text-white hover:bg-red-700"
                                onClick={() =>
                                    window.open(
                                        `/sertifikat/${sertifikatData.id}/download`,
                                        '_blank',
                                    )
                                }
                            >
                                <HardDriveDownload className="mr-2 h-4 w-4" />
                                Download Sertifikat
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="w-full rounded-2xl border shadow-sm">
                        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
                                <span className="text-4xl text-gray-400">
                                    ?
                                </span>
                            </div>

                            <h2 className="text-xl font-semibold">
                                Sertifikat Belum Tersedia
                            </h2>
                            <p
                                className={`text-sm font-medium ${sertifikatData ? getApprovalStatusColor(sertifikatData.approval_status) : 'text-gray-600'}`}
                            >
                                {sertifikatData
                                    ? getApprovalStatusText(
                                          sertifikatData.approval_status,
                                      )
                                    : 'Sertifikat akan diterbitkan setelah kamu menyelesaikan seluruh periode magang.'}
                            </p>

                            <div className="mt-3 w-full max-w-lg">
                                <div className="mb-1 flex justify-between text-sm text-gray-600">
                                    <span>Progress Magang</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                                <p className="mt-1 text-sm text-gray-500">
                                    {hari_selesai} dari {total_hari} hari magang
                                    telah diselesaikan
                                </p>
                            </div>

                            <Button
                                disabled
                                className="mt-4 cursor-not-allowed opacity-70"
                            >
                                <HardDriveDownload /> Unduh Sertifikat (Belum
                                Tersedia)
                            </Button>
                        </CardContent>
                        <FloatingWhatsapp />
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
