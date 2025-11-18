import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type PengumumanData = {
    id: number;
    judul: string;
    isi: string;
    status: string;
    published_at: string | null;
    created_at: string;
    tipe: string;
};

type KontenData = {
    id: number;
    judul: string;
    deskripsi: string;
    slug: string;
    created_at: string;
    tipe: string;
};

type Props = {
    pengumumanData: {
        data: PengumumanData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    kontenData: {
        data: KontenData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function PengumumanKonten() {
    const { pengumumanData, kontenData } = usePage<Props>().props;
    const [tab, setTab] = useState('pengumuman');
    const [filter, setFilter] = useState('Semua');

    const pengumumanList = pengumumanData.data.map(item => ({
        title: item.judul,
        content: item.isi,
        status: item.status === 'published' ? 'Tayang' : 'Draft',
        updatedAt: item.created_at,
    }));

    const filteredPengumuman =
        filter === 'Semua'
            ? pengumumanList
            : pengumumanList.filter((item) => item.status === filter);

    const kontenList = kontenData.data.map(item => ({
        title: item.judul,
        description: item.deskripsi,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pendaftaran" />
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Pengumuman & Konten
                        </h2>
                        <p className="text-sm text-gray-500">
                            Kelola pengumuman dan konten halaman website
                        </p>
                    </div>
                    <Button className="self-start bg-red-600 text-white hover:bg-red-700 sm:self-auto">
                        <Plus className="mr-2 h-4 w-4" /> Buat Pengumuman
                    </Button>
                </div>
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="w-full justify-start border-b bg-transparent p-0">
                        <TabsTrigger
                            value="pengumuman"
                            className={`relative rounded-none px-4 py-2 text-sm font-medium ${
                                tab === 'pengumuman'
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-gray-600'
                            }`}
                        >
                            Pengumuman
                        </TabsTrigger>
                        <TabsTrigger
                            value="konten"
                            className={`relative rounded-none px-4 py-2 text-sm font-medium ${
                                tab === 'konten'
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-gray-600'
                            }`}
                        >
                            Konten Halaman
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pengumuman" className="mt-4 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {['Tayang', 'Draft', 'Semua'].map((status) => (
                                <Button
                                    key={status}
                                    variant={
                                        filter === status
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => setFilter(status)}
                                    className={
                                        filter === status
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'text-gray-700'
                                    }
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {filteredPengumuman.map((item, i) => (
                                <Card
                                    key={i}
                                    className="rounded-lg border transition hover:shadow-sm"
                                >
                                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex-1">
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">
                                                    {item.title}
                                                </h3>
                                                <Badge
                                                    className={`text-xs ${
                                                        item.status === 'Tayang'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {item.content}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-400">
                                                Diperbarui: {item.updatedAt}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 self-end sm:self-start">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-600 hover:text-blue-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-600 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="konten" className="mt-4 space-y-3">
                        {kontenList.map((item, i) => (
                            <Card
                                key={i}
                                className="rounded-lg border hover:shadow-sm"
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <h3 className="font-semibold">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {item.description}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-600 hover:text-red-600"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
