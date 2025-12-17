import React, { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { formulir } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import {
    CheckCircle2,
    Download,
    FileText,
    Trash2,
    UploadCloud,
} from 'lucide-react';

import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

type UploadItem = {
    id: string;
    file: File;
    progress: number;
    status: 'idle' | 'uploading' | 'done' | 'error';
};

export default function PremiumFormUpload() {
    const [items, setItems] = useState<UploadItem[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedDoc, setUploadedDoc] = useState<{
        uri: string;
        fileName: string;
    } | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const downloadTemplate = () => {
        window.open(
            '/storage/formKesanggupan/Formulir Kesanggupan.docx',
            '_blank',
        );
    };

    const addFiles = useCallback((files: FileList | File[]) => {
        const file = Array.from(files)[0];

        setItems([
            {
                id: crypto.randomUUID(),
                file,
                progress: 0,
                status: 'idle',
            },
        ]);
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files.length) {
                addFiles(e.dataTransfer.files);
            }
        },
        [addFiles],
    );

    const uploadSingle = (id: string) => {
        return new Promise<void>((resolve) => {
            setItems((prev) =>
                prev.map((p) =>
                    p.id === id
                        ? { ...p, status: 'uploading', progress: 0 }
                        : p,
                ),
            );

            const item = items.find((p) => p.id === id);
            if (!item) return resolve();

            const form = new FormData();
            form.append('file', item.file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/peserta/upload-formulir');

            xhr.upload.onprogress = (ev) => {
                if (ev.lengthComputable) {
                    const percent = Math.round((ev.loaded / ev.total) * 100);
                    setItems((prev) =>
                        prev.map((p) =>
                            p.id === id ? { ...p, progress: percent } : p,
                        ),
                    );
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const res = JSON.parse(xhr.responseText);
                    setUploadedDoc({
                        uri: res.url,
                        fileName: res.name,
                    });

                    setItems((prev) =>
                        prev.map((p) =>
                            p.id === id
                                ? { ...p, status: 'done', progress: 100 }
                                : p,
                        ),
                    );
                } else {
                    setItems((prev) =>
                        prev.map((p) =>
                            p.id === id ? { ...p, status: 'error' } : p,
                        ),
                    );
                }
                resolve();
            };

            xhr.onerror = () => resolve();
            xhr.send(form);
        });
    };

    const startUploadAll = async () => {
        for (const it of items) {
            if (it.status !== 'done') await uploadSingle(it.id);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Formulir', href: formulir().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-5xl px-4 py-10">
                {/* ===== HEADER ===== */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Formulir Kesanggupan
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Unduh template, isi formulir, lalu unggah kembali dalam
                        format PDF
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* ===== TEMPLATE CARD ===== */}
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Template Formulir</CardTitle>
                            <CardDescription>
                                Gunakan template resmi berikut untuk mengisi
                                formulir kesanggupan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={downloadTemplate}
                                className="flex w-full items-center justify-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Template
                            </Button>
                        </CardContent>
                    </Card>

                    {/* ===== UPLOAD CARD ===== */}
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Upload Formulir</CardTitle>
                            <CardDescription>
                                Unggah formulir yang sudah diisi (PDF)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div
                                onDrop={onDrop}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={() => setDragActive(false)}
                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
                                    dragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted'
                                }`}
                            >
                                <UploadCloud className="mb-3 h-8 w-8 text-muted-foreground" />

                                <p className="font-medium">
                                    Drag & drop PDF di sini
                                </p>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    atau pilih file dari perangkat
                                </p>

                                {/* INPUT ASLI (HIDDEN) */}
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".pdf"
                                    hidden
                                    onChange={(e) => {
                                        if (e.target.files)
                                            addFiles(e.target.files);
                                        if (inputRef.current)
                                            inputRef.current.value = '';
                                    }}
                                />

                                {/* TOMBOL CHOOSE FILE */}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => inputRef.current?.click()}
                                    className="h-9 text-xs"
                                >
                                    Choose File
                                </Button>
                            </div>

                            {items.map((it) => (
                                <div
                                    key={it.id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            <span className="text-sm font-medium">
                                                {it.file.name}
                                            </span>
                                        </div>

                                        {it.status === 'done' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        )}

                                        {it.status !== 'uploading' && (
                                            <Trash2
                                                onClick={() => setItems([])}
                                                className="h-4 w-4 cursor-pointer text-muted-foreground"
                                            />
                                        )}
                                    </div>

                                    <Progress
                                        value={it.progress}
                                        className="mt-3"
                                    />
                                </div>
                            ))}

                            <Button
                                onClick={startUploadAll}
                                disabled={items.length === 0}
                                className="w-full"
                            >
                                Upload Formulir
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* ===== PREVIEW ===== */}
                {uploadedDoc && (
                    <Card className="mt-10 shadow-md">
                        <CardHeader>
                            <CardTitle>Preview Formulir Peserta</CardTitle>
                            <CardDescription>
                                Pastikan isi formulir sudah benar
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[600px] overflow-hidden rounded-lg border">
                                <DocViewer
                                    documents={[uploadedDoc]}
                                    pluginRenderers={DocViewerRenderers}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
