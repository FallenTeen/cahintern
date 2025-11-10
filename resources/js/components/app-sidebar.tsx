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
import { Link } from '@inertiajs/react';
import { Clock, FileText, LayoutGrid, Megaphone, NotebookPen, NotebookText, Undo2, User, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard Utama',
        href: dashboard(),
        icon: LayoutGrid,
    },
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
        href: '#',
        icon: Clock,
    },
    {
        title: 'Logbook Mahasiswa',
        href: '#',
        icon: NotebookText,
    },
    {
        title: 'Penilaian & Sertifikat',
        href: '#',
        icon: NotebookPen,
    },
    {
        title: 'Pengumuman & Konten',
        href: '#',
        icon: Megaphone,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'HomePage',
        href: '/',
        icon: Undo2,
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
