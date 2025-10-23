import { Link } from "@inertiajs/react";
import ilustrasi from "../../../../public/ilustrasi.webp"

const RegistNow = () => {
    return (
        <section className="bg-white py-10 sm:py-20 text-gray-800">
            <div className="flex flex-wrap justify-center gap-6 px-4">
                <div className="flex flex-col sm:flex-row w-full sm:w-[48%] md:w-1/2 items-center gap-4 sm:gap-6 rounded-2xl bg-blue-50 p-6 sm:p-4 shadow-sm">
                    <div className="w-full sm:max-w-[500px] sm:pl-9 text-center sm:text-left">
                        <h2 className="mb-2 text-lg sm:text-xl font-semibold text-blue-700">
                            Sedang mencari Tempat Magang?
                        </h2>
                        <p className="mb-4 text-sm text-gray-600">
                            Daftar dan temukan program magang pilihan Anda.
                        </p>
                        <div className="flex justify-center sm:justify-start">
                            <Link
                                href="/login"
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700"
                            >
                                Daftar Sekarang
                            </Link>
                        </div>
                    </div>

                    <img
                        src={ilustrasi}
                        alt="Ilustrasi magang"
                        className="h-40 w-auto flex-shrink-0 object-contain mt-4 sm:mt-0"
                    />
                </div>
            </div>
        </section>
    );
};

export default RegistNow;
