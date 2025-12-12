import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { sertifikat } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { HardDriveDownload, Info, Mail, Phone } from 'lucide-react';

export default function Sertifikat() {
    const progress = 80;

    const certificateAvailable = false;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sertifikat', href: sertifikat().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sertifikat Magang" />
            <div className="flex min-h-screen w-full flex-col gap-6 bg-gray-50 p-6">
                <h1 className="text-2xl font-bold">Sertifikat Magang</h1>
                <p className="-mt-3 text-gray-600">
                    Lihat dan unduh sertifikat setelah program magang selesai
                </p>

                {certificateAvailable ? (
                    <Card className="w-full rounded-2xl border shadow-sm">
                        <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
                            <img
                                src="/mnt/data/e4350eb8-9f24-4e1f-8c32-0c20b1a7758c.png"
                                alt="Certificate"
                                className="w-full max-w-3xl rounded-lg shadow-md"
                            />

                            <Button className="rounded-full bg-red-600 px-8 py-2 text-white hover:bg-red-700">
                                Download
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
                            <p className="max-w-md text-gray-500">
                                Sertifikat akan diterbitkan setelah kamu
                                menyelesaikan seluruh periode magang.
                            </p>

                            <div className="mt-3 w-full max-w-lg">
                                <div className="mb-1 flex justify-between text-sm text-gray-600">
                                    <span>Progress Magang</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                                <p className="mt-1 text-sm text-gray-500">
                                    32 dari 40 hari magang telah diselesaikan
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
                    </Card>
                )}
                <Card className="w-full rounded-2xl border shadow-sm">
                    <CardContent className="flex flex-col gap-3 p-6">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Info className="h-5 w-5 text-blue-600" /> Informasi
                        </div>
                        <p className="text-gray-600">
                            Hubungi admin Dinas Pendidikan Banyumas jika
                            sertifikat belum muncul setelah program selesai.
                        </p>

                        <div className="mt-2 flex flex-col gap-2 text-gray-700">
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-red-500" />{' '}
                                admin@disdikbms.go.id
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-green-600" />{' '}
                                (0281) 1234567
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
