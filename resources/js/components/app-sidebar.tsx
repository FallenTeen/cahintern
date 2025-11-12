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
import { dashboard, dataPendaftaran } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    Clock,
    FileText,
    House,
    LayoutGrid,
    Medal,
    Megaphone,
    NotebookPen,
    NotebookText,
    Undo2,
    User,
    Users,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import AppLogo from './app-logo';

const commonNavItems: NavItem[] = [
    {
        title: 'Dashboard Utama',
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
        href: '#',
        icon: Users,
    },
    {
        title: 'Data PIC',
        href: '#',
        icon: User,
    },
    {
        title: 'Absensi Mahasiswa',
        href: '/absen-mahasiswa',
        icon: Clock,
    },
    {
        title: 'Logbook Mahasiswa',
        href: '/logbook-mahasiswa',
        icon: NotebookText,
    },
    {
        title: 'Penilaian & Sertifikat',
        href: '/penilaian-dan-sertifikat',
        icon: NotebookPen,
    },
    {
        title: 'Pengumuman & Konten',
        href: '#',
        icon: Megaphone,
    },
];

const userNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '#',
        icon: House,
    },
    {
        title: 'LogBook',
        href: '#',
        icon: NotebookText,
    },
    {
        title: 'Absensi',
        href: '#',
        icon: CalendarCheck,
    },
    {
        title: 'Sertifikat',
        href: '#',
        icon: Medal,
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

    useEffect(() => {
        console.log('Auth data in AppSidebar:', auth);
    }, [auth]);

    const navItems = useMemo(() => {
        let items = [...commonNavItems];
        if (auth && auth.role === 'admin') {
            items = [...items, ...adminNavItems];
        } else if (auth && auth.role === 'user') {
            items = [...items, ...userNavItems];
        }
        return items;
    }, [auth]);

    useEffect(() => {
        console.log('Navigation items selected:', navItems);
    }, [navItems]);
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
