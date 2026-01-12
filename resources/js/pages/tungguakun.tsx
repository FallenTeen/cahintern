import { Head } from '@inertiajs/react';
import FooterSection from './LandingPage/FooterSection';
import Header from './LandingPage/Header';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function TungguAkun() {
    return (
        <>
            <Header />
            <Head title="Tunggu Verifikasi Akun" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-16">
                <div className="w-full max-w-md">
                    <div className="relative rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
                        {/* Icon */}
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <Clock className="h-8 w-8 text-red-600 animate-pulse" />
                        </div>

                        {/* Title */}
                        <h2 className="text-center text-3xl font-bold text-gray-900">
                            Akun Sedang Diverifikasi
                        </h2>

                        {/* Description */}
                        <p className="mt-4 text-center text-gray-600 leading-relaxed">
                            Terima kasih telah mendaftar,
                            Akun Anda sedang dalam proses <span className="font-medium text-gray-800">verifikasi oleh admin</span>.
                        </p>

                        {/* Info Box */}
                        <div className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>
                                    Konfirmasi akan dikirim melalui
                                    <strong> WhatsApp </strong>
                                    maksimal <strong>1x24 jam kerja</strong>.
                                </span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-8">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-500"></div>
                            </div>
                            <p className="mt-3 text-center text-sm text-gray-500">
                                Status: Menunggu verifikasi
                            </p>
                        </div>

                        {/* Footer Text */}
                        <p className="mt-8 text-center text-xs text-gray-400">
                            Silakan hubungi admin jika membutuhkan bantuan lebih lanjut.
                        </p>
                    </div>
                </div>
            </div>

            <FooterSection />
        </>
    );
}
