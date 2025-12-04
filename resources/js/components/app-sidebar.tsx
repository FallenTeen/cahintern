import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
    dashboard,
    dataPendaftaran,
    dataMahasiswaAktif,
    dataPIC,
    absenMahasiswa,
    logbookMahasiswa,
    penilaianDanSertifikat,
    pengumumanKonten,
    logBook,
    absensi,
    sertifikat,
    formulir,
    profile,
} from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    Clock,
    FileText,
    LayoutGrid,
    Medal,
    Megaphone,
    NotebookPen,
    NotebookText,
    Undo2,
    User,
    UserCog,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const commonNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Data Pendaftaran',
        href: dataPendaftaran(),
        icon: FileText,
    },
    {
        title: 'Data Mahasiswa Aktif',
        href: dataMahasiswaAktif(),
        icon: Users,
    },
    {
        title: 'Data PIC',
        href: dataPIC(),
        icon: User,
    },
    {
        title: 'Absensi Mahasiswa',
        href: absenMahasiswa(),
        icon: Clock,
    },
    {
        title: 'Logbook Mahasiswa',
        href: logbookMahasiswa(),
        icon: NotebookText,
    },
    {
        title: 'Penilaian & Sertifikat',
        href: penilaianDanSertifikat(),
        icon: NotebookPen,
    },
    {
        title: 'Pengumuman & Konten',
        href: pengumumanKonten(),
        icon: Megaphone,
    },
];

const pesertaNavItems: NavItem[] = [
    {
        title: 'LogBook',
        href: logBook(),
        icon: NotebookText,
    },
    {
        title: 'Absensi',
        href: absensi(),
        icon: CalendarCheck,
    },
    {
        title: 'Sertifikat',
        href: sertifikat(),
        icon: Medal,
    },
    {
        title: 'Formulir',
        href: formulir(),
        icon: FileText,
    },
    {
        title: 'Profile',
        href: profile(),
        icon: User,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'HomePage',
        href: '/',
        icon: Undo2,
    },
];

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: unknown;
};

type AuthProps = {
    role: string;
    user: User;
};

type PageProps = {
    auth: AuthProps;
};

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;

    const navItems = useMemo(() => {
        let items = [...commonNavItems];
        if (auth && auth.role === 'admin') {
            items = [...items, ...adminNavItems];
        } else if (auth && auth.role === 'peserta') {
            items = [...items, ...pesertaNavItems];
        }
        return items;
    }, [auth]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
