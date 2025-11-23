import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

type User = {
    name: string;
};

type PageProps = {
    auth?: {
        user: User;
    };
};

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="space-y-6 px-6 py-6">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard Utama User</h1>
                    <p className="mt-2 text-gray-600">
                        Selamat datang{' '}
                        <span className="font-medium">
                            {auth?.user?.name ?? 'Pengguna'}
                        </span>
                        {', '}Berikut ringkasan aktivitas magang hari ini.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
