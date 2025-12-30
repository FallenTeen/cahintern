import { Phone } from 'lucide-react';

export default function FloatingWhatsapp() {

    return (
        <a
            href={`https://wa.me/6281325648518?text=`}
            target="_blank"
            rel="noopener noreferrer"
            className="
                mb-10 mr-5
                fixed bottom-6 right-6 z-50
                flex items-center justify-center
                h-14 w-14
                rounded-full
                bg-green-600
                shadow-lg
                transition-all duration-300
                hover:scale-110 hover:bg-green-700
            "
            aria-label="Hubungi CS via WhatsApp"
        >
            <Phone className="h-7 w-7 text-white" />
        </a>
    );
}
