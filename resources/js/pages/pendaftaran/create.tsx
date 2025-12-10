import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { dashboard, dataPendaftaran } from '@/routes';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { Calendar, GraduationCap, School, Upload, User } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        jenjang: 'universitas',

        // Mahasiswa
        nim: '',
        nama_univ: '',
        jurusan: '',
        semester: '',

        // SMK
        nis: '',
        nama_sekolah: '',
        kelas: '',
        nama_pembimbing: '',
        no_hp_pembimbing: '',

        // Umum
        nama_lengkap: '',
        email: '',
        phone: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L',
        alamat: '',
        kota: '',
        provinsi: '',

        // Tanggal magang
        tanggal_mulai: '',
        tanggal_selesai: '',

        // File
        cv: null,
        surat_pengantar: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/pendaftaran');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Data Pendaftaran',
            href: dataPendaftaran().url,
        },
        {
            title: 'Tambah Pendaftaran',
            href: dataPendaftaran().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pendaftaran" />

            <div className="min-h-screen p-6">
                <div className="mx-auto space-y-6">

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Card: Jenjang Pendidikan */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2">
                                        <GraduationCap className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>
                                            Jenjang Pendidikan
                                        </CardTitle>
                                        <CardDescription>
                                            Pilih jenjang pendidikan Anda saat
                                            ini
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label>Jenjang</Label><span className='text-red-600'>*</span>
                                    <Select
                                        value={data.jenjang}
                                        onValueChange={(v) =>
                                            setData('jenjang', v)
                                        }
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Pilih jenjang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="universitas">
                                                Mahasiswa Universitas
                                            </SelectItem>
                                            <SelectItem value="smk">
                                                Siswa SMK
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.jenjang && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.jenjang}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card: Data Akademik */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-100 p-2">
                                        <School className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Data Akademik</CardTitle>
                                        <CardDescription>
                                            Informasi tentang institusi
                                            pendidikan Anda
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {data.jenjang === 'universitas' ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>NIM</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    placeholder="Masukkan NIM"
                                                    value={data.nim}
                                                    onChange={(e) =>
                                                        setData(
                                                            'nim',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.nim && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.nim}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Nama Universitas</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    placeholder="Contoh: Universitas Indonesia"
                                                    value={data.nama_univ}
                                                    onChange={(e) =>
                                                        setData(
                                                            'nama_univ',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.nama_univ && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.nama_univ}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Jurusan</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    placeholder="Contoh: Teknik Informatika"
                                                    value={data.jurusan}
                                                    onChange={(e) =>
                                                        setData(
                                                            'jurusan',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.jurusan && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.jurusan}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Semester</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    type="number"
                                                    placeholder="Contoh: 5"
                                                    value={data.semester}
                                                    onChange={(e) =>
                                                        setData(
                                                            'semester',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.semester && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.semester}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label>NIS</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    placeholder="Masukkan NIS"
                                                    value={data.nis}
                                                    onChange={(e) =>
                                                        setData(
                                                            'nis',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.nis && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.nis}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Nama Sekolah</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    placeholder="Contoh: SMK Negeri 1 Jakarta"
                                                    value={data.nama_sekolah}
                                                    onChange={(e) =>
                                                        setData(
                                                            'nama_sekolah',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.nama_sekolah && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.nama_sekolah}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Kelas</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    placeholder="Contoh: XII RPL 1"
                                                    value={data.kelas}
                                                    onChange={(e) =>
                                                        setData(
                                                            'kelas',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.kelas && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.kelas}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Nama Pembimbing</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    placeholder="Nama guru pembimbing"
                                                    value={data.nama_pembimbing}
                                                    onChange={(e) =>
                                                        setData(
                                                            'nama_pembimbing',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.nama_pembimbing && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.nama_pembimbing}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label>No HP Pembimbing</Label><span className='text-red-600'>*</span>
                                                <Input
                                                    className="h-12"
                                                    placeholder="08xxxxxxxxxx"
                                                    value={
                                                        data.no_hp_pembimbing
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'no_hp_pembimbing',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                {errors.no_hp_pembimbing && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            errors.no_hp_pembimbing
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card: Data Pribadi */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-100 p-2">
                                        <User className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Data Pribadi</CardTitle>
                                        <CardDescription>
                                            Informasi identitas dan kontak Anda
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Nama Lengkap</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            placeholder="Masukkan nama lengkap sesuai KTP"
                                            value={data.nama_lengkap}
                                            onChange={(e) =>
                                                setData(
                                                    'nama_lengkap',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.nama_lengkap && (
                                            <p className="text-sm text-red-500">
                                                {errors.nama_lengkap}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Email</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            type="email"
                                            placeholder="email@example.com"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Nomor Telepon</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            placeholder="08xxxxxxxxxx"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tempat Lahir</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            placeholder="Contoh: Jakarta"
                                            value={data.tempat_lahir}
                                            onChange={(e) =>
                                                setData(
                                                    'tempat_lahir',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.tempat_lahir && (
                                            <p className="text-sm text-red-500">
                                                {errors.tempat_lahir}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tanggal Lahir</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            type="date"
                                            value={data.tanggal_lahir}
                                            onChange={(e) =>
                                                setData(
                                                    'tanggal_lahir',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.tanggal_lahir && (
                                            <p className="text-sm text-red-500">
                                                {errors.tanggal_lahir}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Jenis Kelamin</Label><span className='text-red-600'>*</span>
                                        <Select
                                            value={data.jenis_kelamin}
                                            onValueChange={(v) =>
                                                setData('jenis_kelamin', v)
                                            }
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Pilih jenis kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">
                                                    Laki-laki
                                                </SelectItem>
                                                <SelectItem value="P">
                                                    Perempuan
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.jenis_kelamin && (
                                            <p className="text-sm text-red-500">
                                                {errors.jenis_kelamin}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Alamat Lengkap</Label><span className='text-red-600'>*</span>
                                        <Textarea
                                            className="min-h-24"
                                            placeholder="Masukkan alamat lengkap sesuai KTP"
                                            value={data.alamat}
                                            onChange={(e) =>
                                                setData(
                                                    'alamat',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.alamat && (
                                            <p className="text-sm text-red-500">
                                                {errors.alamat}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Kota</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            placeholder="Contoh: Jakarta"
                                            value={data.kota}
                                            onChange={(e) =>
                                                setData('kota', e.target.value)
                                            }
                                        />
                                        {errors.kota && (
                                            <p className="text-sm text-red-500">
                                                {errors.kota}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Provinsi</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            placeholder="Contoh: DKI Jakarta"
                                            value={data.provinsi}
                                            onChange={(e) =>
                                                setData(
                                                    'provinsi',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.provinsi && (
                                            <p className="text-sm text-red-500">
                                                {errors.provinsi}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card: Periode Magang */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-100 p-2">
                                        <Calendar className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Periode Magang</CardTitle>
                                        <CardDescription>
                                            Tentukan waktu pelaksanaan magang
                                            Anda
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Tanggal Mulai</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            type="date"
                                            value={data.tanggal_mulai}
                                            onChange={(e) =>
                                                setData(
                                                    'tanggal_mulai',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.tanggal_mulai && (
                                            <p className="text-sm text-red-500">
                                                {errors.tanggal_mulai}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tanggal Selesai</Label><span className='text-red-600'>*</span>
                                        <Input
                                            className="h-12"
                                            type="date"
                                            value={data.tanggal_selesai}
                                            onChange={(e) =>
                                                setData(
                                                    'tanggal_selesai',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.tanggal_selesai && (
                                            <p className="text-sm text-red-500">
                                                {errors.tanggal_selesai}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card: Upload Berkas */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-pink-100 p-2">
                                        <Upload className="h-6 w-6 text-pink-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Upload Berkas</CardTitle>
                                        <CardDescription>
                                            Unggah dokumen pendukung (format
                                            PDF, max 2MB)
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Upload CV</Label><span className='text-red-600'>*</span>
                                        <div className="relative">
                                            <Input
                                                className="h-12 cursor-pointer"
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) =>
                                                    setData(
                                                        'cv',
                                                        e.target.files[0],
                                                    )
                                                }
                                            />
                                        </div>
                                        {errors.cv && (
                                            <p className="text-sm text-red-500">
                                                {errors.cv}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Format: PDF, Maksimal 2MB
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            Surat Pengantar
                                        </Label><span className='text-red-600'>*</span>
                                        <div className="relative">
                                            <Input
                                                className="h-12 cursor-pointer"
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) =>
                                                    setData(
                                                        'surat_pengantar',
                                                        e.target.files[0],
                                                    )
                                                }
                                            />
                                        </div>
                                        {errors.surat_pengantar && (
                                            <p className="text-sm text-red-500">
                                                {errors.surat_pengantar}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Format: PDF, Maksimal 2MB
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Pendaftaran'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
