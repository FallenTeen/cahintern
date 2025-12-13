import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
import { Head, router, usePage } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronDownIcon, Edit, Eye, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';

interface Logbook {
    id: number;
    tanggal: string;
    kegiatan: string;
    deskripsi: string;
    jam_mulai: string | null;
    jam_selesai: string | null;
    hasil: string;
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
    revision: 'bg-blue-100 text-blue-800',
    ditolak: 'bg-red-100 text-red-800',
};

const statusLabel = {
    pending: 'Menunggu',
    disetujui: 'Disetujui',
    revision: 'Perlu Revisi',
    ditolak: 'Ditolak',
};

const LogbookPage = () => {
    const { logbooks, auth, flash } = usePage<LogbookPageProps>().props;
    const [date, setDate] = useState<Date | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<
        'list' | 'create' | 'view' | 'edit'
    >('list');
    const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(
        null,
    );
    const [open, setOpen] = React.useState(false);

    const [form, setForm] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        kegiatan: '',
        deskripsi: '',
        jam_mulai: '',
        jam_selesai: '',
        hasil: '',
        dokumentasi: null as File | null,
    });
    const [errors, setErrors] = useState<any>({});

    const resetForm = () => {
        setForm({
            tanggal: new Date().toISOString().split('T')[0],
            kegiatan: '',
            deskripsi: '',
            jam_mulai: '',
            jam_selesai: '',
            hasil: '',
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
            hasil: logbook.hasil,
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
        formData.append('hasil', form.hasil);
        if (form.dokumentasi) {
            formData.append('dokumentasi', form.dokumentasi);
        }

        const url =
            selectedLogbook && viewMode === 'edit'
                ? `/logBook/${selectedLogbook.id}`
                : '/logBook';
        const method = selectedLogbook && viewMode === 'edit' ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                setViewMode('list');
                resetForm();
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
            forceFormData: true,
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Yakin ingin menghapus?',
            text: 'Data logbook ini akan dihapus secara permanen.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/logBook/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Berhasil!',
                            text: 'Logbook berhasil dihapus.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            timerProgressBar: true,
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Terjadi kesalahan saat menghapus.',
                            icon: 'error',
                            timer: 1500,
                            showConfirmButton: false,
                            timerProgressBar: true,
                        });
                    },
                });
            }
        });
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

    const [filterTanggal, setFilterTanggal] = useState(
        (usePage().props as any).filters?.tanggal || '',
    );

    const handleFilterTanggal = (value: string) => {
        setFilterTanggal(value);

        router.get(
            '/logBook',
            { tanggal: value },
            {
                preserveState: true,
                replace: true,
            },
        );
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
                <div className="flex flex-col gap-4 px-6 sm:flex-row sm:items-end sm:justify-between">
                    {/* Judul */}
                    <CardHeader className="mb-3 p-0">
                        <CardTitle>Daftar Logbook</CardTitle>
                    </CardHeader>

                    {/* Filter */}
                    <div className="flex flex-wrap items-end gap-3">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-52 justify-between font-normal"
                                >
                                    {date
                                        ? format(date, 'dd MMM yyyy', {
                                              locale: id,
                                          })
                                        : 'Filter tanggal'}
                                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                align="start"
                                className="w-auto p-0"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(selectedDate) => {
                                        setDate(selectedDate);

                                        handleFilterTanggal(
                                            selectedDate
                                                ? format(
                                                      selectedDate,
                                                      'yyyy-MM-dd',
                                                  )
                                                : '',
                                        );

                                        setOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {filterTanggal && (
                            <Button
                                variant="outline"
                                className="h-10"
                                onClick={() => handleFilterTanggal('')}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                <CardContent>
                    <Table className="text-center">
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="text-center">
                                    Tanggal
                                </TableHead>
                                <TableHead className="text-center">
                                    Kegiatan
                                </TableHead>
                                <TableHead className="text-center">
                                    Jam
                                </TableHead>
                                <TableHead className="text-center">
                                    Durasi
                                </TableHead>
                                <TableHead className="text-center">
                                    Hasil
                                </TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {logbooks.data.length > 0 ? (
                                logbooks.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{log.tanggal}</TableCell>
                                        <TableCell className="line-clamp-1">
                                            {log.kegiatan}
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
                                        <TableCell className="line-clamp-1">
                                            {log.hasil}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-medium ${
                                                    log.status === 'Disetujui'
                                                        ? 'bg-green-100 text-green-700'
                                                        : log.status ===
                                                            'Ditolak'
                                                          ? 'bg-red-100 text-red-700'
                                                          : log.status ===
                                                              'Perlu Revisi'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {log.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleViewLogbook(log)
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {log.status !== 'Disetujui' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEditLogbook(
                                                                log,
                                                            )
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {log.status !==
                                                        'Ditolak' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    log.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center"
                                    >
                                        Tidak ada data logbook
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {logbooks.links.length > 1 && (
                <div className="mt-4 flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            {/* Sebelumnya */}
                            <PaginationItem>
                                <PaginationPrevious
                                    href={logbooks.links[0].url ?? '#'}
                                    onClick={(e) => {
                                        if (!logbooks.links[0].url) {
                                            e.preventDefault();
                                            return;
                                        }
                                        e.preventDefault();
                                        router.get(
                                            logbooks.links[0].url,
                                            { tanggal: filterTanggal },
                                            { preserveState: true },
                                        );
                                    }}
                                />
                            </PaginationItem>

                            {/* Nomor halaman */}
                            {logbooks.links
                                .slice(1, logbooks.links.length - 1)
                                .map((link, index) => (
                                    <PaginationItem key={index}>
                                        {link.label === '...' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href={link.url ?? '#'}
                                                isActive={link.active}
                                                onClick={(e) => {
                                                    if (!link.url) {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    e.preventDefault();
                                                    router.get(
                                                        link.url,
                                                        {
                                                            tanggal:
                                                                filterTanggal,
                                                        },
                                                        { preserveState: true },
                                                    );
                                                }}
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                            {/* Berikutnya */}
                            <PaginationItem>
                                <PaginationNext
                                    href={
                                        logbooks.links[
                                            logbooks.links.length - 1
                                        ].url ?? '#'
                                    }
                                    onClick={(e) => {
                                        const next =
                                            logbooks.links[
                                                logbooks.links.length - 1
                                            ];
                                        if (!next.url) {
                                            e.preventDefault();
                                            return;
                                        }
                                        e.preventDefault();
                                        router.get(
                                            next.url,
                                            { tanggal: filterTanggal },
                                            { preserveState: true },
                                        );
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </>
    );

    // edit and create form
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
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="tanggal">
                                        Tanggal Kegiatan
                                    </Label>
                                    <span className="text-red-600">*</span>
                                    <Input
                                        id="tanggal"
                                        name="tanggal"
                                        type="date"
                                        value={form.tanggal}
                                        onChange={handleChange}
                                    />
                                    {errors.tanggal && (
                                        <p className="text-sm text-red-500">
                                            {errors.tanggal}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="kegiatan">
                                        Judul Kegiatan
                                    </Label>
                                    <span className="text-red-600">*</span>
                                    <Input
                                        id="kegiatan"
                                        name="kegiatan"
                                        value={form.kegiatan}
                                        onChange={handleChange}
                                        placeholder="Contoh: Implementasi fitur X"
                                    />
                                    {errors.kegiatan && (
                                        <p className="text-sm text-red-500">
                                            {errors.kegiatan}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="jam_mulai">
                                            Jam Mulai
                                        </Label>
                                        <span className="text-red-600">*</span>
                                        <Input
                                            id="jam_mulai"
                                            name="jam_mulai"
                                            type="time"
                                            value={form.jam_mulai}
                                            onChange={handleChange}
                                        />
                                        {errors.jam_mulai && (
                                            <p className="text-sm text-red-500">
                                                {errors.jam_mulai}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="jam_selesai">
                                            Jam Selesai
                                        </Label>
                                        <span className="text-red-600">*</span>
                                        <Input
                                            id="jam_selesai"
                                            name="jam_selesai"
                                            type="time"
                                            value={form.jam_selesai}
                                            onChange={handleChange}
                                        />
                                        {errors.jam_selesai && (
                                            <p className="text-sm text-red-500">
                                                {errors.jam_selesai}
                                            </p>
                                        )}
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
                                    <Label htmlFor="hasil">
                                        Hasil Kegiatan
                                    </Label>
                                    <span className="text-red-600">*</span>
                                    <Textarea
                                        id="hasil"
                                        name="hasil"
                                        value={form.hasil}
                                        onChange={handleChange}
                                        placeholder="Jelaskan hasil yang dicapai dari kegiatan ini..."
                                        className="min-h-[100px]"
                                    />
                                    {errors.hasil && (
                                        <p className="text-sm text-red-500">
                                            {errors.hasil}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="deskripsi">
                                        Deskripsi Kegiatan
                                    </Label>
                                    <span className="text-red-600">*</span>
                                    <Textarea
                                        id="deskripsi"
                                        name="deskripsi"
                                        value={form.deskripsi}
                                        onChange={handleChange}
                                        placeholder="Jelaskan detail kegiatan yang Anda lakukan..."
                                        className="min-h-[200px]"
                                    />
                                    {errors.deskripsi && (
                                        <p className="text-sm text-red-500">
                                            {errors.deskripsi}
                                        </p>
                                    )}
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
                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                                        selectedLogbook.status === 'Disetujui'
                                            ? 'bg-green-100 text-green-700'
                                            : selectedLogbook.status ===
                                                'Ditolak'
                                              ? 'bg-red-100 text-red-700'
                                              : selectedLogbook.status ===
                                                  'Perlu Revisi'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                    } `}
                                >
                                    {selectedLogbook.status}
                                </span>

                                {selectedLogbook.status !== 'Disetujui' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setForm({
                                                tanggal:
                                                    (selectedLogbook as any)
                                                        .tanggal_raw || '',
                                                kegiatan:
                                                    selectedLogbook.kegiatan,
                                                deskripsi:
                                                    selectedLogbook.deskripsi,
                                                jam_mulai:
                                                    selectedLogbook.jam_mulai ||
                                                    '',
                                                jam_selesai:
                                                    selectedLogbook.jam_selesai ||
                                                    '',
                                                hasil: selectedLogbook.hasil,
                                                dokumentasi: null,
                                            });
                                            setViewMode('edit');
                                        }}
                                    >
                                        Edit
                                    </Button>
                                )}
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
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        Hasil Kegiatan
                                    </h3>
                                    <div className="prose max-w-none">
                                        <p className="whitespace-pre-line">
                                            {selectedLogbook.hasil}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        Dokumentasi
                                    </h3>
                                    {selectedLogbook.dokumentasi ? (
                                        <img
                                            src={`/storage/logbook/${selectedLogbook.dokumentasi}`}
                                            alt="Dokumentasi"
                                            width={400}
                                            height={300}
                                            className="rounded-md"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-500">
                                            Tidak ada dokumentasi
                                        </p>
                                    )}
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
        <AppLayout>
            <Head title="Logbook Harian" />
            <div className="space-y-6 p-6">{renderContent()}</div>
        </AppLayout>
    );
};

export default LogbookPage;
