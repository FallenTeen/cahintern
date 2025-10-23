import { CirclePlay, UserPlus } from 'lucide-react';
import heroImage from '../../../../public/img.png';

const HeroSection = () => {
    return (
        <section className="bg-white py-20 text-gray-800 mb-19">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 md:flex-row mt-8">
                {/* Kiri: Teks */}
                <div className="flex-1">
                    <h1
                        className="mb-4 text-5xl leading-tight font-bold text-gray-900"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Portal Magang <br />
                        <span className="text-red-600">Terpadu</span>
                    </h1>

                    <p className="mb-8 max-w-lg text-lg text-gray-600">
                        Bergabunglah dengan program magang unggulan Dinas
                        Pendidikan Kabupaten Banyumas. Kembangkan skill dan
                        pengalaman profesional Anda bersama kami.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
                         onClick={() => { window.location.href = '/register'; }}
                        >
                            <UserPlus />
                            Daftar Sekarang
                        </button>

                        <button className="flex items-center gap-2 rounded-full border border-red-600 px-6 py-3 text-red-600 transition hover:bg-red-600 hover:text-white">
                            <CirclePlay />
                            Lihat Video
                        </button>
                    </div>
                </div>

                {/* Kanan: Gambar */}
                <div className="flex flex-1 justify-center">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-7">
                        <img
                            src={heroImage}
                            alt="Mahasiswa magang"
                            className="h-[300px] w-full rounded-xl object-cover md:h-[400px]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
