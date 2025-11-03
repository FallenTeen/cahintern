import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDownIcon, FileText, School, University } from 'lucide-react';
import { useState } from 'react';
import FooterSection from './LandingPage/FooterSection';
import Header from './LandingPage/Header';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const DatePicker = ({ id, label, date, setDate }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return (
        <div className="flex flex-col gap-1 mt-3">
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

export default function Pendaftaran() {
    const [schoolType, setSchoolType] = useState<'university' | 'smk'>(
        'university',
    );

    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        alert('Form Submitted (Data masih belum dikirim)');
    };

    return (
        <section className="bg-white py-8 text-gray-800">
            <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center gap-12 px-4 md:flex-row">
                <Header />

                <div className="relative mx-auto mt-8 max-w-4xl px-4 pb-16">
                    {/* Main Card */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-sm">
                        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-md">
                            {/* Tabs */}
                            <div className="mb-6 flex overflow-hidden rounded-lg border">
                                <button
                                    type="button"
                                    onClick={() => setSchoolType('university')}
                                    aria-pressed={schoolType === 'university'}
                                    className={`flex flex-1 items-center justify-center gap-2 py-3 font-medium transition focus:ring-2 focus:ring-red-600 focus:outline-none ${
                                        schoolType === 'university'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    <University className="h-5 w-5" />
                                    <span>Universitas</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSchoolType('smk')}
                                    aria-pressed={schoolType === 'smk'}
                                    className={`flex flex-1 items-center justify-center gap-2 py-3 font-medium transition focus:ring-2 focus:ring-red-600 focus:outline-none ${
                                        schoolType === 'smk'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    <School className="h-5 w-5" />
                                    <span>Sekolah Menengah Kejuruan (SMK)</span>
                                </button>
                            </div>

                            {/* Form Fields */}
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {schoolType === 'university' ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="nim"
                                                className="mb-1 block font-medium"
                                            >
                                                NIM (Nomer Induk Mahasiswa)
                                            </label>
                                            <input
                                                id="nim"
                                                type="text"
                                                placeholder="Masukan NIM"
                                                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="nama-univ"
                                                className="mb-1 block font-medium"
                                            >
                                                Nama Universitas
                                            </label>
                                            <input
                                                id="nama-univ"
                                                type="text"
                                                placeholder="Masukan nama universitas"
                                                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="nis"
                                                className="mb-1 block font-medium"
                                            >
                                                NIS (Nomor Induk Siswa)
                                            </label>
                                            <input
                                                id="nis"
                                                type="text"
                                                placeholder="Masukan NIS"
                                                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="nama-sekolah"
                                                className="mb-1 block font-medium"
                                            >
                                                Nama Sekolah
                                            </label>
                                            <input
                                                id="nama-sekolah"
                                                type="text"
                                                placeholder="Masukan nama sekolah"
                                                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="nama-lengkap"
                                        className="mb-1 block font-medium"
                                    >
                                        Nama Lengkap
                                    </label>
                                    <input
                                        id="nama-lengkap"
                                        type="text"
                                        placeholder="Masukan nama lengkap"
                                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {/* Tempat Lahir */}
                                    <div>
                                        <label
                                            htmlFor="tempat-lahir"
                                            className="mb-1 block font-medium"
                                        >
                                            Tempat Lahir
                                        </label>
                                        <input
                                            id="tempat-lahir"
                                            type="text"
                                            placeholder="City"
                                            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Tanggal Lahir */}
                                    <DatePicker
                                        id="tanggal-lahir"
                                        label="Tanggal Lahir"
                                        date={dob}
                                        setDate={setDob}
                                    />

                                    {/* Jenis Kelamin */}
                                    <form className="mx-auto max-w-sm">
                                        <label
                                            htmlFor="jenis-kelamin"
                                            className="mb-1 block font-medium"
                                        >
                                            Jenis Kelamin
                                        </label>
                                        <Select>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Pilih Jenis Kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>
                                                        Jenis Kelamin
                                                    </SelectLabel>
                                                    <SelectItem value="P">
                                                        Perempuan
                                                    </SelectItem>
                                                    <SelectItem value="L">
                                                        Laki-laki
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </form>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <DatePicker
                                        id="tgl-mulai"
                                        label="Tanggal Mulai Magang"
                                        date={startDate}
                                        setDate={setStartDate}
                                    />

                                    <DatePicker
                                        id="tgl-selesai"
                                        label="Tanggal Selesai Magang"
                                        date={endDate}
                                        setDate={setEndDate}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border-2 border-dashed border-red-300 p-4 text-center">
                                        <label
                                            htmlFor="upload-cv"
                                            className="cursor-pointer"
                                        >
                                            <div className="flex flex-col items-center">
                                                <FileText className="mb-2 h-6 w-6 text-gray-500" />
                                                <p className="text-sm text-gray-600">
                                                    Click to upload{' '}
                                                    <b>CV (PDF only)</b>
                                                </p>
                                            </div>
                                            <input
                                                id="upload-cv"
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                required
                                            />
                                        </label>
                                    </div>

                                    <div className="rounded-lg border-2 border-dashed border-red-300 p-4 text-center">
                                        <label
                                            htmlFor="upload-surat"
                                            className="cursor-pointer"
                                        >
                                            <div className="flex flex-col items-center">
                                                <FileText className="mb-2 h-6 w-6 text-gray-500" />
                                                <p className="text-sm text-gray-600">
                                                    Click to upload{' '}
                                                    <b>
                                                        Surat rekomendasi (PDF
                                                        only)
                                                    </b>
                                                </p>
                                            </div>
                                            <input
                                                id="upload-surat"
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
                                >
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <FooterSection />
        </section>
    );
}
