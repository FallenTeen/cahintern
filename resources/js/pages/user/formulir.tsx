import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formulir } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CloudUpload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import Swal from 'sweetalert2';

type DocType = 'form_kesanggupan' | 'cv' | 'surat_pengantar';

type Props = {
    form_kesanggupan: string | null;
    cv: string | null;
    surat_pengantar: string | null;
};

export default function PremiumFormUpload(props: Props) {
    const [documents, setDocuments] = useState<Props>(props);
    const [uploadType, setUploadType] = useState<DocType | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [openPdf, setOpenPdf] = useState<{
        title: string;
        uri: string;
    } | null>(null);
    const closePdf = () => {
        setOpenPdf(null);
    };

    const addFile = (files: FileList | null) => {
        const f = files?.[0];
        if (!f || f.type !== 'application/pdf') {
            Swal.fire('Error', 'Hanya file PDF', 'error');
            return;
        }
        setFile(f);
    };

    const upload = () => {
        if (!file || !uploadType) {
            Swal.fire('Error', 'Pilih jenis dokumen & file', 'warning');
            return;
        }

        const form = new FormData();
        form.append('type', uploadType);
        form.append(uploadType, file);

        router.post('/formulir', form, {
            forceFormData: true,
            onStart: () => {
                Swal.fire({
                    title: 'Mengirim Data...',
                    text: 'Mohon tunggu sebentar',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });
            },
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    html: 'Pendaftaran berhasil!',
                    icon: 'success',
                    confirmButtonColor: '#dc2626',
                    confirmButtonText: 'OK',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/formulir';
                    }
                });
            },
            onError: (errors) => {
                Swal.close();
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan. Silakan periksa kembali form Anda.',
                    icon: 'error',
                    confirmButtonColor: '#dc2626',
                    confirmButtonText: 'OK',
                });
            },
        });
    };
    const downloadTemplate = () => {
        window.open(
            '/storage/formKesanggupan/Formulir Kesanggupan.docx',
            '_blank',
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Formulir', href: formulir().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dokumen Persyaratan" />
            <div className="space-y-6 p-6">
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Penilaian & Sertifikat
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola penilaian mahasiswa dan penerbitan sertifikat
                        </p>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Dokumen</CardTitle>
                            <Button
                                onClick={downloadTemplate}
                                className="mt-2 mb-4"
                            >
                                Download Template Form Kesanggupan
                            </Button>
                            <CardDescription>
                                Upload & lihat dokumen persyaratan
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* BUTTON PREVIEW */}
                            <div className="flex flex-wrap gap-2">
                                {documents.form_kesanggupan && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setOpenPdf({
                                                title: 'Form Kesanggupan',
                                                uri: `/storage/${documents.form_kesanggupan}`,
                                            })
                                        }
                                    >
                                        Form Kesanggupan
                                    </Button>
                                )}

                                {documents.cv && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setOpenPdf({
                                                title: 'CV',
                                                uri: `/storage/${documents.cv}`,
                                            })
                                        }
                                    >
                                        CV
                                    </Button>
                                )}

                                {documents.surat_pengantar && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setOpenPdf({
                                                title: 'Surat Pengantar',
                                                uri: `/storage/${documents.surat_pengantar}`,
                                            })
                                        }
                                    >
                                        Surat Pengantar
                                    </Button>
                                )}
                            </div>

                            {/* UPLOAD AREA  */}
                            <div className="space-y-3 border-2 border-dashed p-6 text-center">
                                <p className="mt-0 text-sm text-red-600">
                                    Silahkan pilih kategori mana yang mau di
                                    upload, file harus berupa PDF
                                </p>
                                <Tabs
                                    value={uploadType ?? ''}
                                    onValueChange={(val) => {
                                        setUploadType(val as DocType);
                                        setFile(null);
                                    }}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger
                                            value="form_kesanggupan"
                                            className="data-[state=active]:text-red-600"
                                        >
                                            Form Kesanggupan
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="cv"
                                            className="data-[state=active]:text-red-600"
                                        >
                                            CV
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="surat_pengantar"
                                            className="data-[state=active]:text-red-600"
                                        >
                                            Surat Pengantar
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    hidden
                                    accept="application/pdf"
                                    onChange={(e) => addFile(e.target.files)}
                                />
                                <Button
                                    onClick={() => inputRef.current?.click()}
                                >
                                    <CloudUpload className="mr-2 h-4 w-4" />{' '}
                                    Pilih File
                                </Button>
                                {file && (
                                    <div className="flex items-center justify-between rounded border p-2">
                                        <span className="truncate text-sm">
                                            {file.name}
                                        </span>
                                        <X
                                            className="cursor-pointer text-red-600 hover:text-gray-600"
                                            onClick={() => setFile(null)}
                                        />
                                    </div>
                                )}
                                <Button
                                    className="w-full"
                                    disabled={!file || !uploadType}
                                    onClick={upload}
                                >
                                    Upload
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PDF PREVIEW  */}
                    <Dialog open={!!openPdf} onOpenChange={closePdf}>
                        <DialogContent className="p-0">
                            {openPdf && (
                                <>
                                    <DialogHeader className="px-4 py-2">
                                        <DialogTitle>
                                            {openPdf.title}
                                        </DialogTitle>
                                    </DialogHeader>

                                    <iframe
                                        src={openPdf.uri}
                                        className="h-[calc(90vh-50px)] w-full border-0"
                                    />
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
