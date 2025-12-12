import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { dashboard, formulir } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Download, FileText, Trash2 } from 'lucide-react';

type UploadItem = {
    id: string;
    file: File;
    preview?: string;
    progress: number;
    status: 'idle' | 'uploading' | 'done' | 'error';
};

export default function PremiumFormUpload() {
    const [items, setItems] = useState<UploadItem[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => {
            items.forEach(
                (it) => it.preview && URL.revokeObjectURL(it.preview),
            );
        };
    }, []);

    const addFiles = useCallback((files: FileList | File[]) => {
        const arr = Array.from(files);
        const mapped = arr.map((f) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            file: f,
            preview: f.type.startsWith('image/')
                ? URL.createObjectURL(f)
                : undefined,
            progress: 0,
            status: 'idle',
        }));
        setItems((prev) => [...mapped, ...prev]);
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length) {
                addFiles(e.dataTransfer.files);
            }
        },
        [addFiles],
    );

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    }, []);

    const removeItem = (id: string) => {
        setItems((prev) => {
            const found = prev.find((p) => p.id === id);
            if (found && found.preview) URL.revokeObjectURL(found.preview);
            return prev.filter((p) => p.id !== id);
        });
    };

    const startUploadAll = async () => {
        for (const it of items) {
            if (it.status === 'done') continue;
            await uploadSingle(it.id);
        }
    };

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
            xhr.open('POST', '/api/upload');

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

            xhr.onerror = () => {
                setItems((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, status: 'error' } : p,
                    ),
                );
                resolve();
            };

            xhr.send(form);
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(e.target.files);
        if (inputRef.current) inputRef.current.value = '';
    };

    const downloadTemplate = () => {
        window.open('formulir/TemplateKesanggupanMahasiswa.doc', '_blank');
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Formulir', href: formulir().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-4xl p-6">
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="mb-4 text-center">
                            Upload Formulir
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-6 md:flex-row">
                            <div className="flex-1">
                                <Label className="mb-2">Template</Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={downloadTemplate}
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />{' '}
                                        Download Template
                                    </Button>
                                </div>

                                <Separator className="my-4" />

                                <Label className="mb-2">Cara Penggunaan</Label>
                                <ul className="ml-5 list-disc text-sm text-muted-foreground">
                                    <li>Seret file PDF ke area upload.</li>
                                    <li>
                                        Klik Upload untuk mengirimkan berkas ke
                                        server.
                                    </li>
                                </ul>
                            </div>

                            <div className="w-full md:w-2/5">
                                <div
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    className={`rounded-lg border-2 p-4 transition-colors duration-150 ${
                                        dragActive
                                            ? 'border-blue-400 bg-blue-50'
                                            : 'border-dashed border-gray-200 bg-white'
                                    }`}
                                >
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="text-center">
                                            <h3 className="font-semibold">
                                                Drop files here
                                            </h3>
                                        </div>

                                        <input
                                            ref={inputRef}
                                            type="file"
                                            multiple
                                            accept=".pdf"
                                            onChange={handleInputChange}
                                            className="hidden"
                                            id="premium-file-input"
                                        />

                                        <div className="flex gap-2">
                                            <label htmlFor="premium-file-input">
                                                <Button variant="secondary">
                                                    Pilih Berkas
                                                </Button>
                                            </label>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setItems([])}
                                            >
                                                Clear All
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {items.map((it) => (
                                        <div
                                            key={it.id}
                                            className="flex items-start gap-3 rounded-md border bg-white p-3"
                                        >
                                            <div className="flex h-14 w-14 items-center justify-center rounded-md border bg-gray-50">
                                                {it.preview ? (
                                                    <img
                                                        src={it.preview}
                                                        alt={it.file.name}
                                                        className="h-12 w-12 rounded object-cover"
                                                    />
                                                ) : (
                                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <div className="font-medium">
                                                            {it.file.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {Math.round(
                                                                it.file.size /
                                                                    1024,
                                                            )}{' '}
                                                            KB
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {it.status ===
                                                            'done' && (
                                                            <div className="text-xs text-green-600">
                                                                Selesai
                                                            </div>
                                                        )}
                                                        {it.status ===
                                                            'error' && (
                                                            <div className="text-xs text-red-600">
                                                                Error
                                                            </div>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                removeItem(
                                                                    it.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="mt-2">
                                                    <Progress
                                                        value={it.progress}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex justify-end gap-2">
                                    <Button
                                        onClick={startUploadAll}
                                        disabled={items.length === 0}
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
