import { GraduationCap, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const Header = () => {
    const [activeSection, setActiveSection] = useState('beranda');
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Keep scroll-based section detection
    useEffect(() => {
        const sections = ['beranda', 'pendaftaran', 'tentang'];

        const handleScroll = () => {
            const current = sections.find((id) => {
                const el = document.getElementById(id);
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                return rect.top <= 100 && rect.bottom >= 100;
            });
            if (current) setActiveSection(current);

            // set scrolled state for shadow (applies on mobile as well)
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Ensure navlink becomes active when the route is /pendaftaran
    useEffect(() => {
        const setFromPath = () => {
            if (window.location.pathname === '/pendaftaran') {
                setActiveSection('pendaftaran');
            } else if (window.location.pathname === '/' || window.location.pathname === '') {
                setActiveSection('beranda');
            }else if (window.location.pathname === '/tentang') {
                setActiveSection('tentang');
            }
            // other routes can be handled here if needed
        };
        setFromPath();
        window.addEventListener('popstate', setFromPath);
        return () => window.removeEventListener('popstate', setFromPath);
    }, []);

    return (
        <>
            {/* Navbar Atas */}
            <header
                className={`fixed top-0 left-0 z-50 w-full bg-white/80 text-black backdrop-blur-md transition-shadow duration-200 ${
                    scrolled || menuOpen ? 'shadow-md' : ''
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    {/* Kiri: Hamburger (mobile) + Logo */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger di sebelah kiri logo (hanya mobile) */}
                        <button
                            className="rounded-lg p-2 transition hover:bg-gray-100 md:hidden"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Buka menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-2">
                                <GraduationCap className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold">
                                    Dinas Pendidikan
                                </h1>
                                <p className="text-sm opacity-80">
                                    Kabupaten Banyumas
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Desktop */}
                    <nav className="hidden items-center gap-8 md:flex">
                        {[
                            { id: 'beranda', label: 'Beranda' },
                            { id: 'pendaftaran', label: 'Pendaftaran' },
                            { id: 'tentang', label: 'Tentang' },
                        ].map((item) => (
                            <a
                                key={item.id}
                                href={
                                    item.id === 'pendaftaran'
                                        ? '/pendaftaran'
                                        : item.id === 'beranda'
                                        ? '/'
                                        : item.id === 'tentang'
                                        ? '/tentang'
                                        : `#${item.id}`
                                }
                                className={`relative pb-1 transition-colors duration-200 ${
                                    activeSection === item.id ? 'font-semibold text-red-600' : 'hover:text-red-500'
                                } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-red-600 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                                    activeSection === item.id ? 'after:scale-x-100' : ''
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}

                        <button
                            onClick={() => (window.location.href = '/login')}
                            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                        >
                            Masuk
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-login"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                                <path d="M21 12h-13l3 -3" />
                                <path d="M11 15l-3 -3" />
                            </svg>
                        </button>
                    </nav>

                    {/* Tombol Masuk (hanya mobile, tampil paling kanan) */}
                    <div className="md:hidden">
                        <button
                            onClick={() => (window.location.href = '/login')}
                            className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 font-semibold text-white transition hover:bg-red-700"
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
                                className="icon icon-tabler icons-tabler-outline icon-tabler-login"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                                <path d="M21 12h-13l3 -3" />
                                <path d="M11 15l-3 -3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar Mobile */}
            <div
                className={`fixed top-0 left-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ${
                    menuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header Sidebar */}
                <div className="flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-red-100 p-2">
                            <GraduationCap className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-base leading-none font-semibold text-gray-800">
                                Dinas Pendidikan
                            </h2>
                            <p className="text-xs text-gray-500">
                                Kabupaten Banyumas
                            </p>
                        </div>
                    </div>

                    <button onClick={() => setMenuOpen(false)} className="p-2">
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Isi Menu */}
                <nav className="flex flex-col gap-4 p-5 text-gray-700">
                    {[
                        { id: 'beranda', label: 'Beranda' },
                        { id: 'pendaftaran', label: 'Pendaftaran' },
                        { id: 'tentang', label: 'Tentang' },
                    ].map((item) => (
                        <a
                            key={item.id}
                            href={
                                item.id === 'pendaftaran'
                                    ? '/pendaftaran'
                                    : item.id === 'beranda'
                                    ? '/'
                                    : item.id === 'tentang'
                                    ? '/tentang'
                                    : `#${item.id}`
                            }
                            onClick={() => setMenuOpen(false)}
                            className={`relative pb-1 transition-colors duration-200 ${
                                activeSection === item.id
                                    ? 'font-semibold text-red-600'
                                    : 'hover:text-red-500'
                            } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-16 after:scale-x-0 after:bg-red-600 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                                activeSection === item.id ? 'after:scale-x-100' : ''
                            }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Overlay Gelap saat sidebar aktif */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40"
                    onClick={() => setMenuOpen(false)}
                />
            )}
        </>
    );
};

export default Header;
