import anyquestion from '../../../../public/anyquestion.webp';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../components/ui/accordion';

export default function TentangProgram() {
    return (
        <section className="flex flex-col items-center justify-between gap-8 py-12 md:flex-row">
            {/* ILUSTRASI DENGAN TULISAN DI ATAS GAMBAR */}
            <div className="flex flex-1 justify-center gap-5">
                <div className="relative w-80 md:w-96 py-15">
                    <img
                        src={anyquestion}
                        alt="Ilustrasi Program Magang"
                        className="w-full rounded-md"
                    />
                    <div className="absolute inset-x-0 top-4 px-4 text-start">
                        <h2 className="mb-1 text-xl font-semibold text-black drop-shadow-md">
                            Tentang Program
                        </h2>
                        <p className="text-sm text-black/50">
                            Program Pemagangan Lulusan Perguruan Tinggi.
                        </p>
                    </div>
                </div>
            </div>

            {/* KANAN: TEKS DAN ACCORDION */}
            <div className="flex-1">
                <Accordion type="single" collapsible className="space-y-3">
                    <AccordionItem
                        value="item-1"
                        className="rounded-lg border shadow-sm"
                    >
                        <AccordionTrigger className="px-4 py-3 text-base font-medium">
                            Tentang Program
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-gray-600">
                            Program ini bertujuan memberikan pengalaman kerja
                            nyata kepada mahasiswa melalui kolaborasi antara
                            institusi pendidikan dan perusahaan.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                        value="item-2"
                        className="rounded-lg border shadow-sm"
                    >
                        <AccordionTrigger className="px-4 py-3 text-base font-medium">
                            Peserta Pemagangan
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-gray-600">
                            Peserta adalah mahasiswa aktif atau lulusan baru
                            yang ingin mengembangkan keterampilan profesional
                            melalui pengalaman langsung di dunia industri.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                        value="item-3"
                        className="rounded-lg border shadow-sm"
                    >
                        <AccordionTrigger className="px-4 py-3 text-base font-medium">
                            Penyelenggara Pemagangan
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-gray-600">
                            Penyelenggara adalah perusahaan, instansi, atau
                            lembaga yang bersedia memberikan kesempatan magang
                            dengan bimbingan mentor berpengalaman.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    );
}
