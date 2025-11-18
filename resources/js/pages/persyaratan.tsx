import { Card, CardContent } from '@/components/ui/card';
import Header from './LandingPage/Header';
import FooterSection from './LandingPage/FooterSection';

const PersyaratanMagang = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8 mt-16">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Persyaratan Magang
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Sebelum mengikuti program magang di Dinas Pendidikan
                        Kabupaten Banyumas, pastikan Anda memenuhi persyaratan
                        sesuai dengan jenjang pendidikan.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:gap-10 max-w-6xl mx-auto">
                    <Card className="rounded-xl border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blue-200">
                        <CardContent className="p-6 md:p-8">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-blue-600 font-bold">M</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                    Persyaratan Magang Mahasiswa
                                </h3>
                            </div>

                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Untuk mahasiswa yang ingin melaksanakan magang di
                                Dinas Pendidikan Kabupaten Banyumas, berikut adalah
                                persyaratan yang harus dipenuhi:
                            </p>

                            <ol className="list-inside list-decimal space-y-3 text-gray-700">
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Mahasiswa aktif</span> dari perguruan tinggi negeri atau swasta
                                </li>
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Surat pengantar resmi</span> dari kampus yang masih berlaku
                                </li>
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Curriculum Vitae (CV)</span> atau riwayat hidup terbaru
                                </li>
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Transkrip nilai</span> sementara atau permanen
                                </li>
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Formulir pendaftaran</span> yang telah diisi melalui sistem online
                                </li>
                                <li className="pb-2">
                                    <span className="font-medium">Pas foto</span> terbaru ukuran 3x4 (2 lembar)
                                </li>
                            </ol>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-700 font-medium">
                                    📝 Durasi magang minimum 2 bulan dan maksimum 6 bulan
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-green-200">
                        <CardContent className="p-6 md:p-8">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-green-600 font-bold">S</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                    Persyaratan Magang Siswa SMK
                                </h3>
                            </div>

                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Untuk siswa SMK yang ingin melaksanakan Prakerin
                                (Praktik Kerja Industri) di Dinas Pendidikan
                                Kabupaten Banyumas:
                            </p>

                            <ol className="list-inside list-decimal space-y-3 text-gray-700">
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Siswa aktif</span> kelas XI atau XII dari SMK
                                </li>
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Surat pengantar</span> dari sekolah yang masih berlaku
                                </li>
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Biodata singkat</span> atau Curriculum Vitae
                                </li>
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Raport</span> semester terakhir
                                </li>
                                <li className="pb-2 border-b border-gray-100">
                                    <span className="font-medium">Formulir pendaftaran</span> melalui sistem online
                                </li>
                                <li className="pb-2">
                                    <span className="font-medium">Surat izin orang tua</span> yang telah ditandatangani
                                </li>
                            </ol>

                            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-sm text-green-700 font-medium">
                                    📚 Program magang disesuaikan dengan kompetensi keahlian siswa
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-12 mb-5 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 max-w-6xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Informasi Tambahan
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-600">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Proses Seleksi</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Pendaftaran online melalui website resmi</li>
                                <li>Verifikasi dokumen administrasi</li>
                                <li>Wawancara (jika diperlukan)</li>
                                <li>Pengumuman hasil seleksi</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Periode Magang</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Gelombang 1: Januari - Juni</li>
                                <li>Gelombang 2: Juli - Desember</li>
                                <li>Pendaftaran dibuka 2 bulan sebelumnya</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
};

export default PersyaratanMagang;
