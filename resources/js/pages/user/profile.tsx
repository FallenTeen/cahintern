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
  { title: "Dashboard", href: dashboard().url },
  { title: "Profile", href: profile().url},
];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Magang" />

            <div className="w-full gap-6 p-6">
                {/* Kolom kiri - Informasi Profil */}
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

                        {/* Foto dan Form */}
                        <div className="flex flex-col gap-6 sm:flex-row">
                            {/* Foto profil */}
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

                            {/* Form Profil */}
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

                {/* Kolom kanan */}
                {/* <div className="space-y-6">
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informasi Magang
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Nama Instansi:</strong> Dinas Pendidikan Kabupaten Banyumas
                </li>
                <li>
                  <strong>Pembimbing Lapangan:</strong> Drs. Ahmad Santoso, M.Pd
                </li>
                <li>
                  <strong>Periode:</strong> 1 Agustus - 30 Oktober 2024 (3 bulan / 90 hari)
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-6">
              <h3 className="flex gap-2 text-lg font-semibold text-gray-800 mb-4">
                <ChartLine className='text-red-600' /> Progress Magang
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Kehadiran <span className="float-right">85%</span>
                  </p>
                  <Progress value={85} className="h-2 mt-1" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Logbook <span className="float-right">76/90</span>
                  </p>
                  <Progress value={84} className="h-2 mt-1" />  
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Waktu Tersisa <span className="float-right">14 hari</span>
                  </p>
                  <Progress value={80} className="h-2 mt-1" />
                </div>
              </div>

              <p className="mt-4 text-xs text-red-600 bg-red-50 p-2 rounded-md">
                ⚠️ Silakan lengkapi logbook harian untuk menyelesaikan program magang.
              </p>
            </CardContent>
          </Card>
        </div> */}
            </div>
        </AppLayout>
    );
}
