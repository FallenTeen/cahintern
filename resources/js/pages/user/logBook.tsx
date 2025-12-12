import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { logBook } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Edit, Eye, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Logbook {
    id: number;
    tanggal: string;
    kegiatan: string;
    deskripsi: string;
    jam_mulai: string | null;
    jam_selesai: string | null;
    status: string;
    dokumentasi: string | null;
    catatan_pembimbing?: string | null;
    created_at: string;
    updated_at: string;
}

interface LogbookPageProps {
    logbooks: {
        data: Logbook[];
        links: any[];
    };
    auth: {
        user: {
            id: number;
            name: string;
        };
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const statusVariant = {
    pending: 'bg-yellow-100 text-yellow-800',
    disetujui: 'bg-green-100 text-green-800',
    revisi: 'bg-blue-100 text-blue-800',
    ditolak: 'bg-red-100 text-red-800',
};

const statusLabel = {
    pending: 'Menunggu',
    disetujui: 'Disetujui',
    revisi: 'Perlu Revisi',
    ditolak: 'Ditolak',
};

const LogbookPage = () => {
    const { logbooks, auth, flash } = usePage<LogbookPageProps>().props;
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<
        'list' | 'create' | 'view' | 'edit'
    >('list');
    const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(
        null,
    );

    const [form, setForm] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        kegiatan: '',
        deskripsi: '',
        jam_mulai: '',
        jam_selesai: '',
        dokumentasi: null as File | null,
    });

    const resetForm = () => {
        setForm({
            tanggal: new Date().toISOString().split('T')[0],
            kegiatan: '',
            deskripsi: '',
            jam_mulai: '',
            jam_selesai: '',
            dokumentasi: null,
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Logbook', href: logBook().url },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setForm((prev) => ({
                ...prev,
                dokumentasi: e.target.files![0],
            }));
        }
    };

    const formatDate = (dateString: string) => {
        return format(parseISO(dateString), 'EEEE, d MMMM yyyy', {
            locale: id,
        });
    };

    const formatTime = (timeString: string | null) => {
        if (!timeString) return '-';
        return format(new Date(`1970-01-01T${timeString}`), 'HH:mm');
    };

    const handleViewLogbook = (logbook: Logbook) => {
        setSelectedLogbook(logbook);
        setViewMode('view');
    };

    const handleEditLogbook = (logbook: Logbook) => {
        setSelectedLogbook(logbook);
        setForm({
            tanggal: logbook.tanggal.split('T')[0],
            kegiatan: logbook.kegiatan,
            deskripsi: logbook.deskripsi,
            jam_mulai: logbook.jam_mulai || '',
            jam_selesai: logbook.jam_selesai || '',
            dokumentasi: null,
        });
        setViewMode('edit');
    };

    const handleCreateNew = () => {
        resetForm();
        setViewMode('create');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedLogbook(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('tanggal', form.tanggal);
        formData.append('kegiatan', form.kegiatan);
        formData.append('deskripsi', form.deskripsi);
        formData.append('jam_mulai', form.jam_mulai);
        formData.append('jam_selesai', form.jam_selesai);
        if (form.dokumentasi) {
            formData.append('dokumentasi', form.dokumentasi);
        }

        const url =
            selectedLogbook && viewMode === 'edit'
                ? `/logbooks/${selectedLogbook.id}`
                : '/logbooks';
        const method = selectedLogbook && viewMode === 'edit' ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                setViewMode('list');
                resetForm();
            },
            onError: (errors) => {
                console.error(errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
            forceFormData: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus logbook ini?')) {
            router.delete(`/logbooks/${id}`);
        }
    };

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return '-';

        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);

        let diffHours = endHours - startHours;
        let diffMinutes = endMinutes - startMinutes;

        if (diffMinutes < 0) {
            diffHours--;
            diffMinutes += 60;
        }

        if (diffHours < 0) {
            diffHours += 24;
        }

        return `${diffHours} jam ${diffMinutes} menit`;
    };

    const renderLogbookList = () => (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Logbook Harian</h1>
                    <p className="mt-1 text-gray-600">
                        Catat kegiatan harian Anda selama magang
                    </p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setViewMode('create');
                    }}
                >
                    Tambah Logbook
                </Button>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Daftar Logbook</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Kegiatan</TableHead>
                                <TableHead>Jam</TableHead>
                                <TableHead>Durasi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logbooks.data.length > 0 ? (
                                logbooks.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            {log.tanggal}
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="line-clamp-1">
                                                {log.kegiatan}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(log.jam_mulai ?? '-') +
                                                ' - ' +
                                                (log.jam_selesai ?? '-')}
                                        </TableCell>
                                        <TableCell>
                                            {log.jam_mulai && log.jam_selesai
                                                ? calculateDuration(
                                                      log.jam_mulai,
                                                      log.jam_selesai,
                                                  )
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {log.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="space-x-1 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Lihat"
                                                onClick={() => {
                                                    setSelectedLogbook(
                                                        log as any,
                                                    );
                                                    setViewMode('view');
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Edit"
                                                onClick={() => {
                                                    setSelectedLogbook(
                                                        log as any,
                                                    );
                                                    setForm({
                                                        tanggal:
                                                            (log as any)
                                                                .tanggal_raw ||
                                                            '',
                                                        kegiatan: log.kegiatan,
                                                        deskripsi:
                                                            log.deskripsi,
                                                        jam_mulai:
                                                            log.jam_mulai || '',
                                                        jam_selesai:
                                                            log.jam_selesai ||
                                                            '',
                                                        dokumentasi: null,
                                                    });
                                                    setViewMode('edit');
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Hapus"
                                                onClick={() =>
                                                    handleDelete(log.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center"
                                    >
                                        Tidak ada data logbook
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );

    const renderForm = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">
                        {viewMode === 'edit'
                            ? 'Edit Logbook'
                            : 'Tambah Logbook Baru'}
                    </h1>
                    <p className="mt-1 text-gray-600">
                        Isi detail kegiatan harian Anda
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => {
                        setViewMode('list');
                        setSelectedLogbook(null);
                    }}
                >
                    Kembali ke Daftar
                </Button>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Form Logbook</CardTitle>
                        <CardDescription>
                            Lengkapi form berikut untuk menambahkan logbook
                            harian
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="tanggal">
                                        Tanggal Kegiatan
                                    </Label>
                                    <Input
                                        id="tanggal"
                                        name="tanggal"
                                        type="date"
                                        value={form.tanggal}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="kegiatan">
                                        Judul Kegiatan
                                    </Label>
                                    <Input
                                        id="kegiatan"
                                        name="kegiatan"
                                        value={form.kegiatan}
                                        onChange={handleChange}
                                        placeholder="Contoh: Implementasi fitur X"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="jam_mulai">
                                            Jam Mulai
                                        </Label>
                                        <Input
                                            id="jam_mulai"
                                            name="jam_mulai"
                                            type="time"
                                            value={form.jam_mulai}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="jam_selesai">
                                            Jam Selesai
                                        </Label>
                                        <Input
                                            id="jam_selesai"
                                            name="jam_selesai"
                                            type="time"
                                            value={form.jam_selesai}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="dokumentasi">
                                        Dokumentasi
                                    </Label>
                                    <Input
                                        id="dokumentasi"
                                        name="dokumentasi"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Format: JPG, PNG, PDF. Maks 5MB
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="deskripsi">
                                        Deskripsi Kegiatan
                                    </Label>
                                    <Textarea
                                        id="deskripsi"
                                        name="deskripsi"
                                        value={form.deskripsi}
                                        onChange={handleChange}
                                        placeholder="Jelaskan detail kegiatan yang Anda lakukan..."
                                        className="min-h-[200px]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 border-t px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setViewMode('list');
                                setSelectedLogbook(null);
                            }}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Logbook'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );

    const renderViewLogbook = () => {
        if (!selectedLogbook) return null;
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Detail Logbook
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Detail lengkap logbook kegiatan Anda
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setViewMode('list');
                            setSelectedLogbook(null);
                        }}
                    >
                        Kembali ke Daftar
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>
                                    {selectedLogbook.kegiatan}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {selectedLogbook.tanggal}
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                                    {selectedLogbook.status}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setForm({
                                            tanggal:
                                                (selectedLogbook as any)
                                                    .tanggal_raw || '',
                                            kegiatan: selectedLogbook.kegiatan,
                                            deskripsi:
                                                selectedLogbook.deskripsi,
                                            jam_mulai:
                                                selectedLogbook.jam_mulai || '',
                                            jam_selesai:
                                                selectedLogbook.jam_selesai ||
                                                '',
                                            dokumentasi: null,
                                        });
                                        setViewMode('edit');
                                    }}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        Waktu Pelaksanaan
                                    </h3>
                                    <p className="mt-1">
                                        {selectedLogbook.jam_mulai ?? '-'} -{' '}
                                        {selectedLogbook.jam_selesai ?? '-'}
                                        {selectedLogbook.jam_mulai &&
                                            selectedLogbook.jam_selesai && (
                                                <span className="ml-2 text-gray-500">
                                                    (
                                                    {calculateDuration(
                                                        selectedLogbook.jam_mulai,
                                                        selectedLogbook.jam_selesai,
                                                    )}
                                                    )
                                                </span>
                                            )}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-medium text-gray-500">
                                    Deskripsi Kegiatan
                                </h3>
                                <div className="prose max-w-none">
                                    <p className="whitespace-pre-line">
                                        {selectedLogbook.deskripsi}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderContent = () => {
        switch (viewMode) {
            case 'create':
            case 'edit':
                return renderForm();
            case 'view':
                return renderViewLogbook();
            default:
                return renderLogbookList();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook Harian" />
            <div className="space-y-6 p-6">{renderContent()}</div>
        </AppLayout>
    );
};

export default LogbookPage;
