import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { Edit, Camera, Save, X, ChartLine } from 'lucide-react';
import  profile  from '../../../../public/profile.png';
import { Input } from '@/components/ui/input';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(!isEditing);

  return (
    <AppLayout>
      <Head title="Profil Magang" />

      <div className="w-full gap-6 p-6">
        {/* Kolom kiri - Informasi Profil */}
        <Card className="lg:col-span-2 shadow-md rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Informasi Profil
              </h2>
              <Button
                onClick={handleEdit}
                variant="outline"
                className="flex items-center gap-2 text-sm bg-red-500 text-white hover:text-white hover:bg-red-600"
              >
                <Edit size={16} />
                {isEditing ? 'Batal' : 'Edit Profil'}
              </Button>
            </div>

            {/* Foto dan Form */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Foto profil */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={profile}
                    alt="Foto Profil"
                    className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
                  />
                  <button className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full">
                    <Camera size={16} />
                  </button>
                </div>
                <p className="mt-2 text-gray-600 text-sm">Foto Profil</p>
              </div>

              {/* Form Profil */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 font-semibold">Nama</label>
                  <Input
                    type="text"
                    className="w-full rounded-md border-gray-300 focus:ring-red-400"
                    defaultValue="Sari Indah Permata"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-semibold">NIM / NIS</label>
                  <Input
                    type="text"
                    className="w-full rounded-md border-gray-300 focus:ring-red-400"
                    defaultValue="2021110045"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-semibold">Asal Kampus/Sekolah</label>
                  <Input
                    type="text"
                    className="w-full rounded-md border-gray-300 focus:ring-red-400"
                    defaultValue="Universitas"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-semibold">Program Studi</label>
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
