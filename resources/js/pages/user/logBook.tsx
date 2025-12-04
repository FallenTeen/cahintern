import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ChevronDown, Paperclip, Save, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface Log {
    date: string;
    title: string;
    description: string;
    file?: string;
    status: 'Disetujui' | 'Menunggu Review' | 'Perlu Revisi';
}

const DatePicker = ({ id, label, date, setDate }) => {
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

const LogbookPage = () => {
    const [logs, setLogs] = useState<Log[]>([
        {
            date: '12 Nov 2024',
            title: 'Analisis Sistem Database',
            description:
                'Melakukan analisis dan dokumentasi sistem database perusahaan.',
            file: 'dokumentasi.pdf',
            status: 'Disetujui',
        },
        {
            date: '12 Nov 2024',
            title: 'Meeting Tim',
            description: 'Mengikuti meeting mingguan dengan tim pengembang.',
            file: 'meeting.jpg',
            status: 'Menunggu Review',
        },
        {
            date: '12 Nov 2024',
            title: 'Coding Frontend Website',
            description: 'Mengerjakan tampilan frontend untuk modul baru.',
            file: '',
            status: 'Perlu Revisi',
        },
    ]);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [form, setForm] = useState({
        title: '',
        description: '',
        file: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = () => {
        if (!selectedDate || !form.title) {
            return alert('Isi tanggal dan judul kegiatan!');
        }

        const formattedDate = selectedDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

        setLogs([
            ...logs,
            {
                date: formattedDate,
                title: form.title,
                description: form.description,
                file: form.file,
                status: 'Menunggu Review',
            },
        ]);

        setForm({ title: '', description: '', file: '' });
        setSelectedDate(undefined);
    };

    return (
        <AppLayout>
            <div className="space-y-6 px-6 py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                            Logbook Mahasiswa
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Catat aktivitas harian Anda
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg md:text-xl">
                                Logbook Harian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <DatePicker
                                    id="tanggal_mulai"
                                    label="Tanggal"
                                    date={selectedDate}
                                    setDate={setSelectedDate}
                                />
                                <div className="flex flex-col gap-1.5">
                                    <Label
                                        htmlFor="title"
                                        className="text-sm font-medium"
                                    >
                                        Judul Aktivitas
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Judul Aktivitas/Pekerjaan"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="description"
                                    className="text-sm font-medium"
                                >
                                    Deskripsi
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Deskripsikan aktivitas yang dilakukan secara detail..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 transition-colors hover:border-gray-400">
                                <Upload className="mb-2 h-6 w-6" />
                                <p className="font-medium">
                                    Klik untuk upload atau drag & drop file
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    (Format: PDF, JPG, PNG - Max 5MB)
                                </p>
                            </div>

                            <Button
                                className="w-full bg-red-500 text-white hover:bg-red-600"
                                onClick={handleSubmit}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Logbook
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg md:text-xl">
                                Riwayat Logbook
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="hidden overflow-x-auto md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">
                                                Tanggal
                                            </TableHead>
                                            <TableHead className="w-[200px]">
                                                Judul Aktivitas
                                            </TableHead>
                                            <TableHead>
                                                Deskripsi Singkat
                                            </TableHead>
                                            <TableHead className="w-[150px]">
                                                Bukti
                                            </TableHead>
                                            <TableHead className="w-[140px]">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">
                                                    {log.date}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {log.title}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {log.description}
                                                </TableCell>
                                                <TableCell>
                                                    {log.file ? (
                                                        <div className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                                                            <Paperclip
                                                                size={14}
                                                            />
                                                            <span className="max-w-[100px] truncate text-sm">
                                                                {log.file}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {log.status ===
                                                        'Disetujui' && (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                            Disetujui
                                                        </Badge>
                                                    )}
                                                    {log.status ===
                                                        'Menunggu Review' && (
                                                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                                            Menunggu Review
                                                        </Badge>
                                                    )}
                                                    {log.status ===
                                                        'Perlu Revisi' && (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                                            Perlu Revisi
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="space-y-4 md:hidden">
                                {logs.map((log, i) => (
                                    <div
                                        key={i}
                                        className="space-y-3 rounded-lg border bg-white p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {log.title}
                                                </h3>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {log.date}
                                                </p>
                                            </div>
                                            {log.status === 'Disetujui' && (
                                                <Badge className="bg-green-100 text-xs text-green-700 hover:bg-green-100">
                                                    Disetujui
                                                </Badge>
                                            )}
                                            {log.status ===
                                                'Menunggu Review' && (
                                                <Badge className="bg-yellow-100 text-xs text-yellow-700 hover:bg-yellow-100">
                                                    Menunggu
                                                </Badge>
                                            )}
                                            {log.status === 'Perlu Revisi' && (
                                                <Badge className="bg-red-100 text-xs text-red-700 hover:bg-red-100">
                                                    Revisi
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {log.description}
                                        </p>
                                        {log.file && (
                                            <div className="flex items-center gap-1 text-sm text-blue-600">
                                                <Paperclip size={14} />
                                                <span>{log.file}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {logs.length === 0 && (
                                <div className="py-8 text-center text-gray-500">
                                    <p>Belum ada riwayat logbook</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default LogbookPage;
