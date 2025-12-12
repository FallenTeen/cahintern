import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Camera, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';
import fotoprofile from '../../../../public/profile.png';
import { type BreadcrumbItem } from '@/types';
import { dashboard, profile } from '@/routes';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = () => setIsEditing(!isEditing);
    const breadcrumbs: BreadcrumbItem[] = [
  { title: "Profile", href: profile().url},
];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Magang" />

            <div className="w-full gap-6 p-6">
                <Card className="rounded-2xl shadow-md lg:col-span-2">
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Informasi Profil
                            </h2>
                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                className="flex items-center gap-2 bg-red-500 text-sm text-white hover:bg-red-600 hover:text-white"
                            >
                                <Edit size={16} />
                                {isEditing ? 'Batal' : 'Edit Profil'}
                            </Button>
                        </div>

                        <div className="flex flex-col gap-6 sm:flex-row">
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <img
                                        src={fotoprofile}
                                        alt="Foto Profil"
                                        className="h-28 w-28 rounded-full border-4 border-gray-200 object-cover"
                                    />
                                    <button className="absolute right-0 bottom-0 rounded-full bg-red-500 p-2 text-white">
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    Foto Profil
                                </p>
                            </div>

                            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">
                                        Nama
                                    </label>
                                    <Input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 focus:ring-red-400"
                                        defaultValue="Sari Indah Permata"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">
                                        NIM / NIS
                                    </label>
                                    <Input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 focus:ring-red-400"
                                        defaultValue="2021110045"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">
                                        Asal Kampus/Sekolah
                                    </label>
                                    <Input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 focus:ring-red-400"
                                        defaultValue="Universitas"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">
                                        Program Studi
                                    </label>
                                    <Input
                                        type="text"
                                        className="w-full rounded-md border-gray-300 focus:ring-red-400"
                                        defaultValue="Teknik Informatika"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex justify-end gap-3">
                                <Button className="bg-red-500 text-white hover:bg-red-600">
                                    <Save size={16} className="mr-1" />
                                    Simpan Perubahan
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-gray-300 text-gray-600 hover:bg-gray-100"
                                    onClick={handleEdit}
                                >
                                    <X size={16} className="mr-1" />
                                    Batal
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
