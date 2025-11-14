import { Head } from '@inertiajs/react';
import FooterSection from './LandingPage/FooterSection';
import Header from './LandingPage/Header';

export default function TungguAkun() {
    return (
        <>
            <Header />
            <Head title="Tunggu Verifikasi Akun" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Terima Kasih Telah Mendaftar!
                    </h2>
                    <p className="mt-4 text-center text-gray-600">
                        Akun Anda sedang dalam proses verifikasi. Silakan tunggu
                        konfirmasi melalui email dalam 1x24 jam kerja.
                    </p>
                </div>
            </div>

            <FooterSection />
        </>
    );
}
