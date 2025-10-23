import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
    Send,
    Upload,
    User,
} from 'lucide-react';
import { useState } from 'react';
import Header from './LandingPage/Header';
import FooterSection from './LandingPage/FooterSection';

export default function Pendaftaran() {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((s) => Math.min(s + 1, 4));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const steps = [
        { id: 1, title: 'Data Diri', icon: <User size={18} /> },
        { id: 2, title: 'Data Pendidikan', icon: <FileText size={18} /> },
        { id: 3, title: 'Upload Berkas', icon: <Upload size={18} /> },
        { id: 4, title: 'Konfirmasi', icon: <Send size={18} /> },
    ];

    return (
        <section className="bg-white py-8 text-gray-800">
            <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center gap-12 px-4 md:flex-row">
                <Header />

                <div className="relative mx-auto mt-8 max-w-4xl px-4 pb-16">
                    {/* Main Card */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-sm">
                        {/* Header Section */}
                        <div className="bg-gray-600 p-8 text-center text-white">
                            <h1 className="mb-2 text-3xl font-bold">
                                Formulir Pendaftaran Magang
                            </h1>
                            <p className="text-blue-100 opacity-90">
                                Lengkapi data diri Anda untuk proses pendaftaran
                                yang lebih mudah
                            </p>
                        </div>

                        <div className="p-8">
                            {/* STEP INDICATOR - Improved Design */}
                            <div className="relative mb-12">
                                <div className="flex items-center justify-between">
                                    {steps.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="z-10 flex flex-col items-center"
                                        >
                                            {/* Step Circle */}
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                                    step === item.id
                                                        ? 'scale-110 border-blue-600 bg-blue-600 shadow-lg'
                                                        : step > item.id
                                                          ? 'border-red-500 bg-red-500'
                                                          : 'border-gray-300 bg-white'
                                                } `}
                                            >
                                                {step > item.id ? (
                                                    <CheckCircle className="h-6 w-6 text-white" />
                                                ) : (
                                                    <div
                                                        className={
                                                            step === item.id
                                                                ? 'text-white'
                                                                : 'text-gray-500'
                                                        }
                                                    >
                                                        {item.icon}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step Title */}
                                            <p
                                                className={`hidden md:block mt-3 text-sm font-semibold transition-colors ${
                                                    step === item.id ? 'text-blue-600' : step > item.id ? 'text-red-600' : 'text-gray-500'
                                                }`}
                                            >
                                                {item.title}
                                            </p>

                                            {/* Step Number */}
                                            <div
                                                className={`absolute -bottom-8 text-xs font-medium transition-colors ${
                                                    step === item.id
                                                        ? 'text-blue-600'
                                                        : step > item.id
                                                          ? 'text-red-600'
                                                          : 'text-gray-400'
                                                } `}
                                            >
                                                Step {item.id}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress Bar */}
                                <div className="absolute top-6 right-0 left-0 -z-10 h-2 rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-red-500 transition-all duration-500 ease-out"
                                        style={{
                                            width: `${((step - 1) / (steps.length - 1)) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* STEP FORM - Enhanced Design */}
                            <div className="min-h-[300px] transition-all duration-300">
                                {step === 1 && (
                                    <div className="animate-fade-in space-y-6">
                                        <div className="mb-8 text-center">
                                            <h2 className="mb-2 text-2xl font-bold text-gray-800">
                                                Data Diri
                                            </h2>
                                            <p className="text-gray-600">
                                                Isi informasi pribadi Anda
                                                dengan benar
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {[
                                                {
                                                    placeholder: 'Nama Lengkap',
                                                    type: 'text',
                                                },
                                                {
                                                    placeholder: 'NIM / NIS',
                                                    type: 'text',
                                                },
                                                {
                                                    placeholder: 'Email',
                                                    type: 'email',
                                                },
                                                {
                                                    placeholder:
                                                        'Nomor Telepon',
                                                    type: 'tel',
                                                },
                                            ].map((field, index) => (
                                                <div
                                                    key={index}
                                                    className="space-y-2"
                                                >
                                                    <label className="text-sm font-medium text-gray-700">
                                                        {field.placeholder}
                                                    </label>{" "}
                                                    <span className="text-red-600">*</span>
                                                    <input
                                                        type={field.type}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                        placeholder={`Masukkan ${field.placeholder.toLowerCase()}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="animate-fade-in space-y-6">
                                        <div className="mb-8 text-center">
                                            <h2 className="mb-2 text-2xl font-bold text-gray-800">
                                                Data Pendidikan
                                            </h2>
                                            <p className="text-gray-600">
                                                Informasi mengenai latar
                                                belakang pendidikan Anda
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {[
                                                {
                                                    placeholder:
                                                        'Asal Kampus / Sekolah',
                                                    type: 'text',
                                                },
                                                {
                                                    placeholder:
                                                        'Program Studi / Jurusan',
                                                    type: 'text',
                                                },
                                                {
                                                    placeholder: 'Semester',
                                                    type: 'number',
                                                },
                                                {
                                                    placeholder: 'IPK Terakhir',
                                                    type: 'number',
                                                    step: '0.01',
                                                },
                                            ].map((field, index) => (
                                                <div
                                                    key={index}
                                                    className="space-y-2"
                                                >
                                                    <label className="text-sm font-medium text-gray-700">
                                                        {field.placeholder}
                                                    </label>{" "}
                                                    <span className="text-red-600">*</span>
                                                    <input
                                                        type={field.type}
                                                        step={field.step}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                        placeholder={`Masukkan ${field.placeholder.toLowerCase()}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="animate-fade-in space-y-6">
                                        <div className="mb-8 text-center">
                                            <h2 className="mb-2 text-2xl font-bold text-gray-800">
                                                Upload Berkas
                                            </h2>
                                            <p className="text-gray-600">
                                                Unggah dokumen yang diperlukan
                                                untuk pendaftaran
                                            </p>
                                        </div>
                                        <div className="space-y-6">
                                            {[
                                                'CV/Resume (PDF, max 2MB)',
                                                'Transkrip Nilai (PDF, max 2MB)',
                                                'Surat Pengantar (PDF, max 2MB)',
                                                'Portfolio (Opsional, PDF/ZIP, max 5MB)',
                                            ].map((label, index) => (
                                                <div
                                                    key={index}
                                                    className="space-y-3"
                                                >
                                                    <label className="text-sm font-medium text-gray-700">
                                                        {label}
                                                    </label>{" "}
                                                    {!label.toLowerCase().includes('opsional') && (
                                                        <span className="text-red-600">*</span>
                                                    )}
                                                    <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors duration-200 hover:border-blue-400">
                                                        <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                        <p className="mb-2 text-sm text-gray-600">
                                                            Drag & drop file
                                                            atau klik untuk
                                                            memilih
                                                        </p>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            id={`file-${index}`}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                document
                                                                    .getElementById(
                                                                        `file-${index}`,
                                                                    )
                                                                    ?.click()
                                                            }
                                                        >
                                                            Pilih File
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="animate-fade-in py-8 text-center">
                                        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                            <CheckCircle className="h-10 w-10 text-green-600" />
                                        </div>
                                        <h2 className="mb-3 text-2xl font-bold text-gray-800">
                                            Konfirmasi Data
                                        </h2>
                                        <p className="mx-auto mb-8 max-w-md leading-relaxed text-gray-600">
                                            Selamat! Data pendaftaran Anda sudah
                                            lengkap. Pastikan seluruh informasi
                                            yang Anda berikan sudah benar
                                            sebelum mengirimkan formulir.
                                        </p>
                                        <Button className="rounded-xl bg-blue-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:bg-blue-700">
                                            <Send className="mr-2 h-4 w-4" />
                                            Kirim Pendaftaran
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* NAVIGATION - Enhanced Buttons */}
                            <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
                                {step > 1 ? (
                                    <Button
                                        onClick={prevStep}
                                        variant="outline"
                                        className="flex items-center gap-2 rounded-xl border-2 px-6 py-2 transition-all duration-200 hover:scale-105"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Kembali
                                    </Button>
                                ) : (
                                    <div></div>
                                )}

                                {step < 4 && (
                                    <Button
                                        onClick={nextStep}
                                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2 text-white hover:bg-blue-700"
                                    >
                                        Lanjut
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterSection />
        </section>
    );
}
