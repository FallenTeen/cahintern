import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { guestDaftar } from '@/routes/pendaftaran';
import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronDownIcon,
    FileText,
    School,
    University,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import FooterSection from './LandingPage/FooterSection';
import Header from './LandingPage/Header';

const DatePicker = ({ id, label, date, setDate }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const currentYear = new Date().getFullYear();

    return (
        <div className="mt-3 flex flex-col gap-1">
            <Label htmlFor={id} className="font-medium">
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
                        <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                        fromYear={2000}
                        toYear={currentYear + 10}
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

type FormErrors = {
    nama_lengkap?: string;
    email?: string;
    phone?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    alamat?: string;
    kota?: string;
    provinsi?: string;

    nim?: string;
    nama_univ?: string;
    jurusan?: string;
    semester?: string;

    nis?: string;
    nama_sekolah?: string;
    kelas?: string;
    nama_pembimbing?: string;
    no_hp_pembimbing?: string;

    tanggal_mulai?: string;
    tanggal_selesai?: string;

    cv?: string;
    surat_pengantar?: string;
};

export default function Pendaftaran() {
    const [jenjang, setJenjang] = useState<'universitas' | 'smk'>(
        'universitas',
    );
    const [errors, setErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState({
        nim: '',
        nama_univ: '',
        jurusan: '',
        semester: '',
        nis: '',
        nama_sekolah: '',
        kelas: '',

        nama_lengkap: '',
        email: '',
        phone: '',
        tempat_lahir: '',
        tanggal_lahir: undefined as Date | undefined,
        jenis_kelamin: '',
        alamat: '',
        kota: '',
        provinsi: '',

        nama_pembimbing: '',
        no_hp_pembimbing: '',

        tanggal_mulai: undefined as Date | undefined,
        tanggal_selesai: undefined as Date | undefined,

        cv: null as File | null,
        surat_pengantar: null as File | null,
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'cv' | 'surat_pengantar',
    ) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, [field]: file }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();

        data.append('jenjang', jenjang);

        if (jenjang === 'universitas') {
            data.append('nim', formData.nim);
            data.append('nama_univ', formData.nama_univ);
            data.append('jurusan', formData.jurusan);
            data.append('semester', formData.semester);
        } else {
            data.append('nis', formData.nis);
            data.append('nama_sekolah', formData.nama_sekolah);
            data.append('kelas', formData.kelas);
            data.append('nama_pembimbing', formData.nama_pembimbing);
            data.append('no_hp_pembimbing', formData.no_hp_pembimbing);
        }

        data.append('nama_lengkap', formData.nama_lengkap);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('tempat_lahir', formData.tempat_lahir);
        data.append('alamat', formData.alamat);
        data.append('kota', formData.kota);
        data.append('provinsi', formData.provinsi);
        data.append('jenis_kelamin', formData.jenis_kelamin);

        if (formData.tanggal_lahir) {
            data.append(
                'tanggal_lahir',
                formData.tanggal_lahir.toISOString().split('T')[0],
            );
        }

        if (formData.tanggal_mulai) {
            data.append(
                'tanggal_mulai',
                formData.tanggal_mulai.toISOString().split('T')[0],
            );
        }

        if (formData.tanggal_selesai) {
            data.append(
                'tanggal_selesai',
                formData.tanggal_selesai.toISOString().split('T')[0],
            );
        }

        if (formData.cv) {
            data.append('cv', formData.cv);
        }

        if (formData.surat_pengantar) {
            data.append('surat_pengantar', formData.surat_pengantar);
        }

        router.post(guestDaftar().url, data, {
            onError: (errs) => {
                setErrors(errs as FormErrors);
            },
        });
    };

    return (
        <section className="bg-white py-8 text-gray-900">
            <div className="mx-auto mt-8 flex w-full flex-col items-center gap-12 px-4">
                <Header />

                <div className="relative mx-auto mt-8 w-full px-4 pb-16">
                    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
                        <div className="mx-auto w-full rounded-2xl bg-white sm:px-8 sm:py-6 lg:px-32 lg:py-10">
                            <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
                                Formulir Pendaftaran Magang
                            </h1>
                            <p className="mb-8 text-center text-gray-600">
                                Silakan lengkapi data berikut untuk mendaftar
                                program magang
                            </p>

                            <div className="mb-8 flex overflow-hidden rounded-lg border shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setJenjang('universitas')}
                                    aria-pressed={jenjang === 'universitas'}
                                    className={`flex flex-1 items-center justify-center gap-2 py-4 font-semibold transition-all focus:ring-2 focus:ring-red-600 focus:outline-none ${
                                        jenjang === 'universitas'
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <University className="h-5 w-5" />
                                    <span>Universitas</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setJenjang('smk')}
                                    aria-pressed={jenjang === 'smk'}
                                    className={`flex flex-1 items-center justify-center gap-2 py-4 font-semibold transition-all focus:ring-2 focus:ring-red-600 focus:outline-none ${
                                        jenjang === 'smk'
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <School className="h-5 w-5" />
                                    <span>SMK</span>
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-800">
                                        Data Institusi
                                    </h2>

                                    {jenjang === 'universitas' ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="nim"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    NIM (Nomor Induk Mahasiswa){' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    id="nim"
                                                    type="text"
                                                    placeholder="Contoh: 1234567890"
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                    value={formData.nim}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="nama_univ"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    Nama Universitas{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    id="nama_univ"
                                                    type="text"
                                                    placeholder="Contoh: Universitas Indonesia"
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                    value={formData.nama_univ}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="jurusan"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    Jurusan/Program Studi{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    id="jurusan"
                                                    type="text"
                                                    placeholder="Contoh: Teknik Informatika"
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                    value={formData.jurusan}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="semester"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    Semester{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    id="semester"
                                                    type="number"
                                                    min="1"
                                                    max="14"
                                                    placeholder="Contoh: 5"
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                    value={formData.semester}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label
                                                        htmlFor="nis"
                                                        className="mb-2 block font-medium text-gray-700"
                                                    >
                                                        NIS (Nomor Induk Siswa){' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        id="nis"
                                                        type="text"
                                                        placeholder="Contoh: 1234567890"
                                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                        value={formData.nis}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="nama_sekolah"
                                                        className="mb-2 block font-medium text-gray-700"
                                                    >
                                                        Nama Sekolah{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        id="nama_sekolah"
                                                        type="text"
                                                        placeholder="Contoh: SMK Negeri 1 Jakarta"
                                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                        value={
                                                            formData.nama_sekolah
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="kelas"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    Kelas{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    id="kelas"
                                                    type="text"
                                                    placeholder="Contoh: XII RPL 1"
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                    value={formData.kelas}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="border-t border-gray-200 pt-4">
                                                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                                                    Data Pembimbing Sekolah
                                                </h3>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label
                                                            htmlFor="nama_pembimbing"
                                                            className="mb-2 block font-medium text-gray-700"
                                                        >
                                                            Nama Pembimbing{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            id="nama_pembimbing"
                                                            type="text"
                                                            placeholder="Contoh: Budi Santoso, S.Pd"
                                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                            value={
                                                                formData.nama_pembimbing
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="no_hp_pembimbing"
                                                            className="mb-2 block font-medium text-gray-700"
                                                        >
                                                            No. HP Pembimbing{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            id="no_hp_pembimbing"
                                                            type="tel"
                                                            placeholder="Contoh: 081234567890"
                                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition focus:border-transparent focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                            value={
                                                                formData.no_hp_pembimbing
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-800">
                                        Data Pribadi
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="nama_lengkap"
                                                className="mb-2 block font-medium text-gray-700"
                                            >
                                                Nama Lengkap{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="nama_lengkap"
                                                type="text"
                                                placeholder="Masukkan nama lengkap sesuai KTP"
                                                className={`w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none ${errors.nama_lengkap ? 'border-red-500' : 'border-gray-300'}`}
                                                value={formData.nama_lengkap}
                                                onChange={handleInputChange}
                                                required
                                            />

                                            {errors.nama_lengkap && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.nama_lengkap}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    Email{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    id="email"
                                                    type="email"
                                                    placeholder="nama@example.com"
                                                    className={`w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />

                                                {errors.email && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="phone"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    No. Telepon{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="081234567890"
                                                    className={`w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                />

                                                {errors.phone && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div>
                                                <label
                                                    htmlFor="tempat_lahir"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    Tempat Lahir{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    id="tempat_lahir"
                                                    type="text"
                                                    placeholder="Contoh: Jakarta"
                                                    className={`w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none ${errors.tempat_lahir ? 'border-red-500' : 'border-gray-300'}`}
                                                    value={
                                                        formData.tempat_lahir
                                                    }
                                                    onChange={handleInputChange}
                                                    required
                                                />

                                                {errors.tempat_lahir && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.tempat_lahir}
                                                    </p>
                                                )}
                                            </div>

                                            <DatePicker
                                                id="tanggal_lahir"
                                                label={
                                                    <>
                                                        Tanggal Lahir{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </>
                                                }
                                                date={formData.tanggal_lahir}
                                                setDate={(date) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        tanggal_lahir: date,
                                                    }))
                                                }
                                            />
                                            {errors.tanggal_lahir && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.tanggal_lahir}
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-col gap-1">
                                                <label
                                                    htmlFor="jenis_kelamin"
                                                    className="mb-2 block font-medium text-gray-700"
                                                >
                                                    Jenis Kelamin{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <Select
                                                    value={
                                                        formData.jenis_kelamin
                                                    }
                                                    onValueChange={(value) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            jenis_kelamin:
                                                                value,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger
                                                        className={`h-11 w-full ${errors.jenis_kelamin ? 'border-red-500' : ''}`}
                                                    >
                                                        <SelectValue placeholder="Pilih" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="L">
                                                                Laki-laki
                                                            </SelectItem>
                                                            <SelectItem value="P">
                                                                Perempuan
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>

                                                {errors.jenis_kelamin && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.jenis_kelamin}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="alamat"
                                                className="mb-2 block font-medium text-gray-700"
                                            >
                                                Alamat Lengkap{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <textarea
                                                id="alamat"
                                                rows={3}
                                                placeholder="Masukkan alamat lengkap"
                                                className={`w-full resize-none rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none ${errors.alamat ? 'border-red-500' : 'border-gray-300'}`}
                                                value={formData.alamat}
                                                onChange={handleInputChange}
                                                required
                                            />

                                            {errors.alamat && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.alamat}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-800">
                                        Data Magang
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <DatePicker
                                                    id="tanggal_mulai"
                                                    label={
                                                        <>
                                                            Tanggal Mulai Magang{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </>
                                                    }
                                                    date={
                                                        formData.tanggal_mulai
                                                    }
                                                    setDate={(date) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            tanggal_mulai: date,
                                                        }))
                                                    }
                                                />

                                                {errors.tanggal_mulai && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.tanggal_mulai}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <DatePicker
                                                    id="tanggal_selesai"
                                                    label={
                                                        <>
                                                            Tanggal Selesai
                                                            Magang{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </>
                                                    }
                                                    date={
                                                        formData.tanggal_selesai
                                                    }
                                                    setDate={(date) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            tanggal_selesai:
                                                                date,
                                                        }))
                                                    }
                                                />

                                                {errors.tanggal_selesai && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.tanggal_selesai}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-800">
                                        Upload Dokumen
                                    </h2>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div
                                            className={`rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                                                formData.cv
                                                    ? 'border-green-400 bg-green-50'
                                                    : 'border-red-300 bg-white hover:border-red-400'
                                            }`}
                                        >
                                            <label
                                                htmlFor="cv"
                                                className="cursor-pointer"
                                            >
                                                <div className="flex flex-col items-center">
                                                    {formData.cv ? (
                                                        <>
                                                            <CheckCircle2 className="mb-3 h-12 w-12 text-green-500" />
                                                            <p className="mb-1 text-sm font-semibold text-green-700">
                                                                CV Berhasil
                                                                Diunggah
                                                            </p>
                                                            <p className="px-2 text-xs break-all text-gray-600">
                                                                {
                                                                    formData.cv
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="mt-3 text-xs text-blue-600 hover:underline">
                                                                Klik untuk
                                                                mengganti file
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="mb-3 h-12 w-12 text-gray-400" />
                                                            <p className="mb-1 text-sm text-gray-700">
                                                                Klik untuk
                                                                upload <b>CV</b>
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                PDF only, max
                                                                2MB
                                                            </p>
                                                            <span className="mt-1 text-xs text-red-500">
                                                                * Wajib
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="cv"
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            e,
                                                            'cv',
                                                        )
                                                    }
                                                    required
                                                />
                                            </label>
                                        </div>

                                        <div
                                            className={`rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                                                formData.surat_pengantar
                                                    ? 'border-green-400 bg-green-50'
                                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}
                                        >
                                            <label
                                                htmlFor="surat_pengantar"
                                                className="cursor-pointer"
                                            >
                                                <div className="flex flex-col items-center">
                                                    {formData.surat_pengantar ? (
                                                        <>
                                                            <CheckCircle2 className="mb-3 h-12 w-12 text-green-500" />
                                                            <p className="mb-1 text-sm font-semibold text-green-700">
                                                                Surat Berhasil
                                                                Diunggah
                                                            </p>
                                                            <p className="px-2 text-xs break-all text-gray-600">
                                                                {
                                                                    formData
                                                                        .surat_pengantar
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="mt-3 text-xs text-blue-600 hover:underline">
                                                                Klik untuk
                                                                mengganti file
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="mb-3 h-12 w-12 text-gray-400" />
                                                            <p className="mb-1 text-sm text-gray-700">
                                                                Klik untuk
                                                                upload{' '}
                                                                <b>
                                                                    Surat
                                                                    Pengantar
                                                                </b>
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                PDF only, max
                                                                2MB (Opsional)
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="surat_pengantar"
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            e,
                                                            'surat_pengantar',
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-red-600 py-4 text-lg font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg focus:ring-4 focus:ring-red-300 active:scale-[0.98]"
                                    onClick={() =>
                                        toast.success(
                                            'Data berhasil ditambahkan',
                                        )
                                    }
                                >
                                    Kirim Pendaftaran
                                </button>

                                <p className="mt-4 text-center text-sm text-gray-500">
                                    <span className="text-red-500">*</span>{' '}
                                    Wajib diisi
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <FooterSection />
        </section>
    );
}
