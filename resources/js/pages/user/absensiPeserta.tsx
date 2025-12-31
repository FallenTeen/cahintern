import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { absensi } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ClockArrowDown,
    ClockArrowUp,
    Eye,
    Inbox,
    Moon,
    Send,
    Sun,
    Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { statusAbsensi } from '../statusAbsensi';

type DatePickerProps = {
    id: string;
    label: string;
    date?: Date;
    setDate: (d?: Date) => void;
};
const DatePicker = ({ id, label, date, setDate }: DatePickerProps) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id} className="text-sm font-medium">
                {label}
            </Label>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={id}
                        className="w-full justify-between text-left font-normal"
                    >
                        {date
                            ? date.toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                              })
                            : 'Pilih tanggal'}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(newDate: Date | undefined) => {
                            if (newDate) setDate(newDate);
                            setIsPopoverOpen(false);
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

type Props = {
    schedule?: {
        jam_buka: string;
        jam_tutup: string;
        toleransi_menit: number;
    } | null;
};

type absensiData = {
    id: number;
    tanggal: string;
    kegiatan: string;
    jam: string;
    durasi: string;
    status: string;
};

const AbsensiMagang = () => {
    const { schedule } = usePage<Props>().props;
    const [izinStatus, setIzinStatus] = useState<'IZIN' | 'SAKIT' | ''>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        undefined,
    );
    const [alasan, setAlasan] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const isSakit = izinStatus === 'SAKIT';
    const [currentTime, setCurrentTime] = useState(new Date());
    const { absensiData } = usePage<{ absensiData: absensiData[] }>().props;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTanggal = (tanggal: string | Date): string => {
        const date = new Date(tanggal);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatJam = (jam: string | null | undefined): string => {
        if (!jam) return '-';
        const [hours, minutes] = jam.split(':');
        if (!hours || !minutes) return '-';
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    const handleKirimPengajuan = () => {
        if (!izinStatus || !selectedDate || !alasan) {
            Swal.fire({
                icon: 'warning',
                title: 'Data tidak lengkap',
                text: 'Harap lengkapi semua data sebelum mengirim!',
                confirmButtonText: 'OK',
            });
            return;
        }

        // Validasi file untuk sakit
        if (izinStatus === 'SAKIT' && !file) {
            Swal.fire({
                icon: 'warning',
                title: 'File Wajib',
                text: 'Surat dokter wajib dilampirkan untuk pengajuan sakit!',
                confirmButtonText: 'OK',
            });
            return;
        }

        // Format tanggal dengan benar (YYYY-MM-DD) tanpa timezone issue
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formData = new FormData();
        formData.append('tanggal', formatDate(selectedDate));
        formData.append('tipe', izinStatus.toLowerCase());
        formData.append('keterangan', alasan);

        if (file) {
            formData.append('surat', file);
        }

        router.post('/absensi/izin', formData, {
            forceFormData: true,
            onSuccess: (page) => {
                setIzinStatus('');
                setSelectedDate(undefined);
                setAlasan('');
                setFile(null);

                if (page.props.flash?.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        text: page.props.flash.success,
                        confirmButtonText: 'OK',
                    });
                }

                if (page.props.flash?.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: page.props.flash.error,
                        confirmButtonText: 'OK',
                    });
                }
            },
        });
    };

    const handleCheckIn = () => {
        router.post(
            '/absensi/check-in',
            {},
            {
                onSuccess: (page) => {
                    const flash = page.props.flash;

                    if (flash?.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Berhasil',
                            text: flash.success,
                            confirmButtonText: 'OK',
                        });
                    }

                    if (flash?.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal',
                            text: flash.error,
                            confirmButtonText: 'OK',
                        });
                    }
                },
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: 'Terjadi kesalahan saat melakukan check-in.',
                        confirmButtonText: 'OK',
                    });
                },
            },
        );
    };

    const handleCheckOut = () => {
        router.post(
            '/absensi/check-out',
            {},
            {
                onSuccess: (page) => {
                    const flash = page.props.flash;

                    if (flash?.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Berhasil',
                            text: flash.success,
                            confirmButtonText: 'OK',
                        });
                    }

                    if (flash?.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal',
                            text: flash.error,
                            confirmButtonText: 'OK',
                        });
                    }
                },
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: 'Terjadi kesalahan saat melakukan check-out.',
                        confirmButtonText: 'OK',
                    });
                },
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Absensi', href: absensi().url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi" />
            <div className="space-y-6 px-6 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                                Absensi Magang
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Catat kehadiran harian dan kelola izin/sakit
                                dengan mudah.
                            </p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <p className="text-mx mt-1 font-medium text-red-500">
                                {currentTime.toLocaleTimeString('id-ID')}
                            </p>
                            <span className="text-black-500 text-sm font-medium">
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Sun className="h-5 w-5 text-red-500" />
                                    Absen Datang
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 flex items-center gap-1 text-sm text-yellow-500">
                                    Absensi dibuka sebelum 30 menit dari jam
                                    masuk.
                                </p>
                                {schedule ? (
                                    <>
                                        <p className="mb-4 text-sm text-red-600">
                                            Jam masuk: {schedule.jam_buka}{' '}
                                            (Toleransi{' '}
                                            {schedule.toleransi_menit} menit)
                                        </p>
                                    </>
                                ) : (
                                    <p className="mb-4 text-sm text-gray-600">
                                        Tidak ada jadwal absensi hari ini.
                                    </p>
                                )}
                                <p className="mb-4 text-sm text-gray-600">
                                    Catat kehadiran pagi hari
                                </p>
                                <Button
                                    className="w-full bg-red-500 text-white hover:bg-red-600"
                                    onClick={handleCheckIn}
                                >
                                    <ClockArrowUp className="mr-2 h-4 w-4" />
                                    Absen Datang
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Moon className="h-5 w-5 text-red-500" />
                                    Absen Pulang
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 flex items-center gap-1 text-sm text-yellow-500">
                                    Absensi ditututp setelah 1 jam dari jam
                                    pulang.
                                </p>
                                {schedule ? (
                                    <p className="mb-4 text-sm text-red-600">
                                        Jam pulang: {schedule.jam_tutup}
                                    </p>
                                ) : (
                                    <p className="mb-4 text-sm text-gray-600">
                                        Tidak ada jadwal absensi hari ini.
                                    </p>
                                )}
                                <p className="mb-4 text-sm text-gray-600">
                                    Catat kehadiran sore hari
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={handleCheckOut}
                                >
                                    <ClockArrowDown className="mr-2 h-4 w-4" />
                                    Absen Pulang
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg md:text-xl">
                                Formulir Izin/Sakit
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-4">
                                <Label
                                    htmlFor="keterangan"
                                    className="text-sm font-medium"
                                >
                                    Keterangan
                                </Label>
                            </div>
                            <div className="flex gap-1.5">
                                <Button
                                    variant={
                                        izinStatus === 'IZIN'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={
                                        izinStatus === 'IZIN'
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : ''
                                    }
                                    onClick={() => setIzinStatus('IZIN')}
                                >
                                    Izin
                                </Button>
                                <Button
                                    variant={
                                        izinStatus === 'SAKIT'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={
                                        izinStatus === 'SAKIT'
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : ''
                                    }
                                    onClick={() => setIzinStatus('SAKIT')}
                                >
                                    Sakit
                                </Button>
                            </div>

                            <DatePicker
                                id="tanggal_izin"
                                label="Tanggal"
                                date={selectedDate}
                                setDate={setSelectedDate}
                            />

                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="alasan"
                                    className="text-sm font-medium"
                                >
                                    Alasan
                                </Label>
                                <Textarea
                                    id="alasan"
                                    name="alasan"
                                    value={alasan}
                                    onChange={(e) => setAlasan(e.target.value)}
                                    placeholder="Tuliskan alasan izin atau keterangan sakit..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="pendukung"
                                    className="text-sm font-medium"
                                >
                                    File Pendukung
                                    {isSakit && (
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    )}
                                </Label>

                                {isSakit && (
                                    <p className="text-xs text-red-500">
                                        Wajib melampirkan surat dokter jika
                                        sakit
                                    </p>
                                )}
                            </div>
                            <label
                                htmlFor="pendukung"
                                className={`flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed p-6 text-center text-sm transition-colors ${
                                    isSakit
                                        ? 'border-red-400 text-red-500 hover:border-red-500'
                                        : 'border-gray-300 text-gray-500 hover:border-gray-400'
                                } `}
                            >
                                <Upload className="mb-2 h-6 w-6" />
                                <p className="font-medium">
                                    {file
                                        ? file.name
                                        : isSakit
                                          ? 'Upload Surat Dokter'
                                          : 'Klik untuk upload file'}
                                </p>
                                <p className="mt-1 text-xs">
                                    (PDF, JPG, PNG - Max 2MB)
                                </p>

                                <input
                                    id="pendukung"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) =>
                                        setFile(e.target.files?.[0] ?? null)
                                    }
                                />
                            </label>

                            {file && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFile(null)}
                                    className="w-full"
                                >
                                    Hapus File
                                </Button>
                            )}

                            <Button
                                className="w-full bg-red-500 text-white hover:bg-red-600"
                                onClick={handleKirimPengajuan}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Kirim Pengajuan
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg md:text-xl">
                                Riwayat Absensi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table className="text-center align-middle">
                                {absensiData.data.length > 0 && (
                                    <TableHeader>
                                        <TableRow className="bg-gray-100">
                                            <TableHead className="text-center align-middle">
                                                Tanggal
                                            </TableHead>
                                            <TableHead className="text-center align-middle">
                                                Jam Masuk
                                            </TableHead>
                                            <TableHead className="text-center align-middle">
                                                Jam Keluar
                                            </TableHead>
                                            <TableHead className="text-center align-middle">
                                                Keterangan
                                            </TableHead>
                                            <TableHead className="text-center align-middle">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-center align-middle">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                )}

                                <TableBody>
                                    {absensiData.data.length > 0 ? (
                                        absensiData.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    {formatTanggal(log.tanggal)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatJam(
                                                        log.jam_masuk ?? '-',
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatJam(
                                                        log.jam_keluar ?? '-',
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {log.keterangan ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {statusAbsensi(log.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-transparent text-blue-600"
                                                        onClick={() =>
                                                            router.get(
                                                                `/absensi/${log.id}`,
                                                            )
                                                        }
                                                    >
                                                        <Eye />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="mb-4 rounded-full bg-gray-50 p-4">
                                                        <Inbox className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Belum ada data logbook
                                                        harian
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Data logbook harian akan
                                                        muncul di sini.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {absensiData.links.length > 10 &&
                                absensiData.links.length > 1 && (
                                    <div className="mt-4 flex justify-end border-t pt-4">
                                        <Pagination>
                                            <PaginationContent>
                                                {/* Previous */}
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href={
                                                            absensiData.links[0]
                                                                .url ?? '#'
                                                        }
                                                        className={
                                                            !absensiData
                                                                .links[0].url
                                                                ? 'pointer-events-none opacity-50'
                                                                : ''
                                                        }
                                                        onClick={(e) => {
                                                            if (
                                                                !absensiData
                                                                    .links[0]
                                                                    .url
                                                            ) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            e.preventDefault();
                                                            router.get(
                                                                absensiData
                                                                    .links[0]
                                                                    .url,
                                                                {
                                                                    preserveState: true,
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }}
                                                    />
                                                </PaginationItem>

                                                {/* Page Numbers */}
                                                {absensiData.links
                                                    .slice(1, -1)
                                                    .map((link, index) => (
                                                        <PaginationItem
                                                            key={index}
                                                        >
                                                            {link.label ===
                                                            '...' ? (
                                                                <PaginationEllipsis />
                                                            ) : (
                                                                <PaginationLink
                                                                    href={
                                                                        link.url ??
                                                                        '#'
                                                                    }
                                                                    isActive={
                                                                        link.active
                                                                    }
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        if (
                                                                            !link.url
                                                                        ) {
                                                                            e.preventDefault();
                                                                            return;
                                                                        }
                                                                        e.preventDefault();
                                                                        router.get(
                                                                            link.url,
                                                                            {
                                                                                preserveState: true,
                                                                                preserveScroll: true,
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    {link.label}
                                                                </PaginationLink>
                                                            )}
                                                        </PaginationItem>
                                                    ))}

                                                {/* Next */}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        href={
                                                            absensiData.links[
                                                                absensiData
                                                                    .links
                                                                    .length - 1
                                                            ].url ?? '#'
                                                        }
                                                        className={
                                                            !absensiData.links[
                                                                absensiData
                                                                    .links
                                                                    .length - 1
                                                            ].url
                                                                ? 'pointer-events-none opacity-50'
                                                                : ''
                                                        }
                                                        onClick={(e) => {
                                                            const nextLink =
                                                                absensiData
                                                                    .links[
                                                                    absensiData
                                                                        .links
                                                                        .length -
                                                                        1
                                                                ];
                                                            if (!nextLink.url) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            e.preventDefault();
                                                            router.get(
                                                                nextLink.url,
                                                                {
                                                                    preserveState: true,
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default AbsensiMagang;
