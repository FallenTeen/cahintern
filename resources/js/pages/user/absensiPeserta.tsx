import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { absensi, dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ClockArrowDown,
    ClockArrowUp,
    Moon,
    Send,
    Sun,
    Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
                        onSelect={(newDate) => {
                            setDate(newDate);
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
const AbsensiMagang = () => {
    const { schedule } = usePage<Props>().props;
    const [izinStatus, setIzinStatus] = useState<'IZIN' | 'SAKIT' | ''>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [alasan, setAlasan] = useState('');

    const [riwayat] = useState([
        {
            tanggal: '20 Nov 2025',
            jamDatang: '08:00',
            jamPulang: '16:00',
            status: 'Hadir',
        },
        {
            tanggal: '19 Nov 2025',
            jamDatang: '-',
            jamPulang: '-',
            status: 'Terlambat',
        },
        {
            tanggal: '18 Nov 2025',
            jamDatang: '-',
            jamPulang: '-',
            status: 'Izin',
        },
        {
            tanggal: '17 Nov 2025',
            jamDatang: '-',
            jamPulang: '-',
            status: 'Sakit',
        },
    ]);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleKirimPengajuan = () => {
        if (!izinStatus || !selectedDate || !alasan) {
            alert('Harap lengkapi semua data!');
            return;
        }
        const formData = {
            tanggal: selectedDate?.toISOString().slice(0, 10) as string,
            tipe: izinStatus.toLowerCase(),
            keterangan: alasan,
        };
        router.post('/absensi/izin', formData, {
            onSuccess: () => {
                setIzinStatus('');
                setSelectedDate(undefined);
                setAlasan('');
            },
        });
    };

    const handleCheckIn = () => {
        router.post('/absensi/check-in');
    };

    const handleCheckOut = () => {
        router.post('/absensi/check-out');
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
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
                            {schedule && (
                                <span className="text-xs text-gray-500">
                                    Jadwal: {schedule.jam_buka} -{' '}
                                    {schedule.jam_tutup}
                                </span>
                            )}
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
                                    File Pendukung (Opsional)
                                </Label>
                            </div>
                            <div className="flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 transition-colors hover:border-gray-400">
                                <Upload className="mb-2 h-6 w-6" />
                                <p className="font-medium">
                                    Klik untuk upload file
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    (Opsional - PDF, JPG, PNG)
                                </p>
                            </div>

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
                            <table className="w-full border-collapse text-sm">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="border-b px-4 py-2 text-left">
                                            Tanggal
                                        </th>
                                        <th className="border-b px-4 py-2 text-left">
                                            Jam Datang
                                        </th>
                                        <th className="border-b px-4 py-2 text-left">
                                            Jam Pulang
                                        </th>
                                        <th className="border-b px-4 py-2 text-left">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riwayat.map((r, i) => (
                                        <tr
                                            key={i}
                                            className="border-b text-gray-700"
                                        >
                                            <td className="px-4 py-2">
                                                {r.tanggal}
                                            </td>
                                            <td className="px-4 py-2">
                                                {r.jamDatang}
                                            </td>
                                            <td className="px-4 py-2">
                                                {r.jamPulang}
                                            </td>
                                            <td className="px-4 py-2">
                                                {r.status === 'Hadir' && (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                        Hadir
                                                    </Badge>
                                                )}
                                                {r.status === 'Terlambat' && (
                                                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                                        Terlambat
                                                    </Badge>
                                                )}
                                                {r.status === 'Izin' && (
                                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                                        Izin
                                                    </Badge>
                                                )}
                                                {r.status === 'Sakit' && (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                                        Sakit
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default AbsensiMagang;
