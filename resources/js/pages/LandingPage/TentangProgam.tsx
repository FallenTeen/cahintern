import anyquestion from '../../../../public/anyquestion.webp';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../components/ui/accordion';

export default function TentangProgram() {
    return (
        <section className="bg-white text-gray-800 flex flex-col items-center justify-between gap-8 py-12 md:flex-row">
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
            <div className="flex-1 w-full md:max-w-lg lg:max-w-none px-4">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-3"
                >
                    <AccordionItem
                        value="item-1"
                        className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow duration-200 data-[state=open]:shadow-md"
                    >
                        <AccordionTrigger className="flex w-full items-center justify-between px-4 py-4 text-base font-medium text-left md:py-3 md:px-4 hover:bg-gray-50 data-[state=open]:bg-gray-50">
                            Tentang Program
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-gray-600 text-sm md:text-base overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                            Program ini bertujuan memberikan pengalaman kerja
                            nyata kepada mahasiswa melalui kolaborasi antara
                            institusi pendidikan dan perusahaan.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                        value="item-2"
                        className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow duration-200 data-[state=open]:shadow-md"
                    >
                        <AccordionTrigger className="flex w-full items-center justify-between px-4 py-4 text-base font-medium text-left md:py-3 md:px-4 hover:bg-gray-50 data-[state=open]:bg-gray-50">
                            Peserta Pemagangan
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-gray-600 text-sm md:text-base overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                            Peserta adalah mahasiswa aktif atau lulusan baru
                            yang ingin mengembangkan keterampilan profesional
                            melalui pengalaman langsung di dunia industri.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                        value="item-3"
                        className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow duration-200 data-[state=open]:shadow-md"
                    >
                        <AccordionTrigger className="flex w-full items-center justify-between px-4 py-4 text-base font-medium text-left md:py-3 md:px-4 hover:bg-gray-50 data-[state=open]:bg-gray-50">
                            Penyelenggara Pemagangan
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-gray-600 text-sm md:text-base overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
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
