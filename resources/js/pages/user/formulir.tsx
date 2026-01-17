import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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

            <div className="space-y-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Dokumen Persyaratan
                    </h1>
                    <p className="text-muted-foreground">
                        Upload dan kelola dokumen persyaratan magang
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Dokumen</CardTitle>
                            <CardDescription>
                                Dokumen yang sudah diupload
                            </CardDescription>

                            <Button
                                onClick={downloadTemplate}
                                variant="outline"
                                className="mt-2 w-fit bg-blue-500 text-white"
                            >
                                Download Template Form Kesanggupan
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {[
                                {
                                    label: 'Form Kesanggupan',
                                    value: documents.form_kesanggupan,
                                },
                                { label: 'CV', value: documents.cv },
                                {
                                    label: 'Surat Pengantar',
                                    value: documents.surat_pengantar,
                                },
                            ].map((doc) => (
                                <div
                                    key={doc.label}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div>
                                        <p className="font-medium">{doc.label}</p>
                                        <p
                                            className={`text-sm ${
                                                doc.value
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {doc.value
                                                ? 'Sudah diupload'
                                                : 'Belum diupload'}
                                        </p>
                                    </div>

                                    {doc.value && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                window.open(`/storage/${doc.value}`, '_blank')
                                            }
                                        >
                                            Lihat
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Dokumen</CardTitle>
                            <CardDescription>
                                Pilih jenis dokumen dan upload file PDF
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <RadioGroup
                                value={uploadType ?? ''}
                                onValueChange={(val) => {
                                    setUploadType(val as DocType);
                                    setFile(null);
                                }}
                                className="space-y-3"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="form_kesanggupan" id="form" />
                                    <Label htmlFor="form">Form Kesanggupan</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cv" id="cv" />
                                    <Label htmlFor="cv">CV</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="surat_pengantar" id="surat" />
                                    <Label htmlFor="surat">Surat Pengantar</Label>
                                </div>
                            </RadioGroup>
                            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center">
                                <CloudUpload className="h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Upload file PDF (maks. 5MB)
                                </p>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    hidden
                                    accept="application/pdf"
                                    onChange={(e) => addFile(e.target.files)}
                                />

                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        inputRef.current?.click()
                                    }
                                >
                                    Pilih File
                                </Button>

                                {file && (
                                    <div className="flex w-full items-center justify-between rounded border p-2">
                                        <span className="truncate text-sm">
                                            {file.name}
                                        </span>
                                        <X
                                            className="cursor-pointer text-red-600"
                                            onClick={() => setFile(null)}
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                className="w-full"
                                disabled={!file || !uploadType}
                                onClick={upload}
                            >
                                Upload Dokumen
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );

}
