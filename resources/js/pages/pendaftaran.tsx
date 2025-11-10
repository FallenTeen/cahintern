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
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronDown, FileText, School, University } from 'lucide-react';
import { useState } from 'react';
import FooterSection from './LandingPage/FooterSection';
import Header from './LandingPage/Header';

const DatePicker = ({ id, label, date, setDate }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id} className="font-medium text-gray-700">
                {label}
            </Label>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={id}
                        className="w-full justify-between text-left font-normal h-10"
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
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="w-full px-4 py-6 md:py-8">
                <Header />
            </div>

            {/* Main Content */}
            <div className="w-full px-4 py-6 md:py-12">
                <div className="mx-auto max-w-4xl">
                    {/* Card Container */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg md:p-8">
                        {/* Tabs */}
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:gap-0 overflow-hidden rounded-lg border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setSchoolType('university')}
                                aria-pressed={schoolType === 'university'}
                                className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 font-medium transition-colors focus:ring-2 focus:ring-red-600 focus:outline-none ${
                                    schoolType === 'university'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <University className="h-5 w-5" />
                                <span className="text-sm md:text-base">Universitas</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSchoolType('smk')}
                                aria-pressed={schoolType === 'smk'}
                                className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 font-medium transition-colors focus:ring-2 focus:ring-red-600 focus:outline-none ${
                                    schoolType === 'smk'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <School className="h-5 w-5" />
                                <span className="text-sm md:text-base">SMK</span>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-5">
                            {/* Student ID & School Name */}
                            {schoolType === 'university' ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="nim"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            NIM (Nomor Induk Mahasiswa)
                                        </label>
                                        <input
                                            id="nim"
                                            type="text"
                                            placeholder="Masukan NIM"
                                            className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="nama-univ"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            Nama Universitas
                                        </label>
                                        <input
                                            id="nama-univ"
                                            type="text"
                                            placeholder="Masukan nama universitas"
                                            className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="nis"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            NIS (Nomor Induk Siswa)
                                        </label>
                                        <input
                                            id="nis"
                                            type="text"
                                            placeholder="Masukan NIS"
                                            className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="nama-sekolah"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            Nama Sekolah
                                        </label>
                                        <input
                                            id="nama-sekolah"
                                            type="text"
                                            placeholder="Masukan nama sekolah"
                                            className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="nama-lengkap"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Nama Lengkap
                                </label>
                                <input
                                    id="nama-lengkap"
                                    type="text"
                                    placeholder="Masukan nama lengkap"
                                    className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Birth Info */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label
                                        htmlFor="tempat-lahir"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Tempat Lahir
                                    </label>
                                    <input
                                        id="tempat-lahir"
                                        type="text"
                                        placeholder="Kota"
                                        className="w-full h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-none"
                                        required
                                    />
                                </div>

                                <DatePicker
                                    id="tanggal-lahir"
                                    label="Tanggal Lahir"
                                    date={dob}
                                    setDate={setDob}
                                />

                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="jenis-kelamin"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Jenis Kelamin
                                    </label>
                                    <Select>
                                        <SelectTrigger
                                            id="jenis-kelamin"
                                            className="w-full h-10"
                                        >
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
                                </div>
                            </div>

                            {/* Internship Dates */}
                            <div className="grid gap-4 sm:grid-cols-2">
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

                            {/* File Uploads */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border-2 border-dashed border-red-300 bg-red-50/30 p-6 text-center transition hover:border-red-400 hover:bg-red-50/50">
                                    <label
                                        htmlFor="upload-cv"
                                        className="cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center">
                                            <FileText className="mb-2 h-8 w-8 text-red-500" />
                                            <p className="text-sm text-gray-600">
                                                Upload <span className="font-semibold text-gray-800">CV</span>
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                PDF only
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

                                <div className="rounded-lg border-2 border-dashed border-red-300 bg-red-50/30 p-6 text-center transition hover:border-red-400 hover:bg-red-50/50">
                                    <label
                                        htmlFor="upload-surat"
                                        className="cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center">
                                            <FileText className="mb-2 h-8 w-8 text-red-500" />
                                            <p className="text-sm text-gray-600">
                                                Upload <span className="font-semibold text-gray-800">Surat Rekomendasi</span>
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                PDF only (opsional)
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

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition-colors hover:bg-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <FooterSection />
        </div>
    );
}