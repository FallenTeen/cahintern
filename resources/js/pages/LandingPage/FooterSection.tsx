import { Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

const FooterSection = () => {
    return (
        <footer className="bg-gray-100 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 pt-16 pb-12 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-1">
                        <div className="mb-4 text-2xl font-bold">
                            {/* Logo dan Nama */}
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-200 p-2">
                                    <GraduationCap className="h-8 w-8 text-red-600" />
                                </div>
                                <div className="text-gray-900">
                                    <h1 className="text-lg font-semibold">
                                        Dinas Pendidikan
                                    </h1>
                                    <p className="text-sm">
                                        Kabupaten Banyumas
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="mb-6 text-gray-900">
                            Program Magang Merdeka Dinas Pendidikan Banyumas.
                            Kesempatan berharga mengaplikasikan teori ke dalam
                            praktik kerja nyata di lingkungan birokrasi
                            pendidikan. Bidang Administrasi, Data, dan Teknologi
                            tersedia untuk pengembangan kompetensi.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://www.facebook.com/share/17E6W4cRLa/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-facebook"
                                >
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/dindikbanyumas/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-instagram"
                                >
                                    <rect
                                        width="20"
                                        height="20"
                                        x="2"
                                        y="2"
                                        rx="5"
                                        ry="5"
                                    ></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line
                                        x1="17.5"
                                        x2="17.51"
                                        y1="6.5"
                                        y2="6.5"
                                    ></line>
                                </svg>
                            </a>
                            <a
                                href="https://youtube.com/@dinaspendidikanbanyumas1751?si=xMBXtrSKZDm9G2ax"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-youtube"
                                >
                                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                                    <path d="m10 15 5-3-5-3z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="ml-5">
                        <h3 className="mb-4 text-lg font-semibold text-red-600">
                            Tautan Cepat
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/"
                                    className="text-gray-800 hover:underline"
                                >
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pendaftaran"
                                    className="text-gray-800 hover:underline"
                                >
                                    Program Magang
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tentang"
                                    className="text-gray-800 hover:underline"
                                >
                                    Tentang
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-red-600">
                            Program
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-800"
                                >
                                    IT & Teknologi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-800"
                                >
                                    Administrasi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-800"
                                >
                                    Hubungan Masyarakat
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-red-600">
                            Informasi Kontak
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start text-gray-800">
                                Dinas Pendidikan <br />
                                Pemerintah Kabupaten Banyumas <br />
                                Jl. Perintis Kemerdekaan 75 Purwokerto
                            </li>
                            <li className="flex items-start">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-phone mt-1 mr-3 shrink-0 text-gray-800"
                                >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <span className="text-gray-800">
                                    (0281) 635220
                                </span>
                            </li>
                            <li className="flex items-start">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-mail mt-1 mr-3 shrink-0 text-gray-800"
                                >
                                    <rect
                                        width="20"
                                        height="16"
                                        x="2"
                                        y="4"
                                        rx="2"
                                    ></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </svg>
                                <span className="text-gray-800">
                                    support@dindikbanyumas.go.id
                                </span>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="mt-4 flex items-center text-gray-400 hover:text-white"
                                >
                                    <span className="inline-block rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                                        Daftar Sekarang
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-400 py-6 text-center text-sm text-gray-500">
                    <p>
                        © {new Date().getFullYear()} Dinas Pendidikan Kabupaten
                        Banyumas. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
