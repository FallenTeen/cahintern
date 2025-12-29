import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Camera, Edit, Loader2, Save, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import Swal from 'sweetalert2';
import fotoprofile from '../../../../public/profile.png';

type ProfileProps = {
    profile: any;
};

export default function Profile({ profile }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAvatarDeleted, setIsAvatarDeleted] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: profile.user.name ?? '',
        email: profile.user.email ?? '',
        phone: profile.user.phone ?? '',
        jenis_kelamin: profile.jenis_kelamin ?? '',
        tempat_lahir: profile.tempat_lahir ?? '',
        tanggal_lahir: profile.tanggal_lahir ?? '',
        avatar: null as File | null,
        delete_avatar: false,
        jenis_peserta: profile.jenis_peserta ?? 'siswa',
        nim_nisn: profile.nim_nisn ?? '',
        jurusan: profile.jurusan ?? '',
        asal_instansi: profile.asal_instansi ?? '',
        semester_kelas: profile.semester_kelas ?? '',
        nama_pembimbing_sekolah: profile.nama_pembimbing_sekolah ?? '',
        no_hp_pembimbing_sekolah: profile.no_hp_pembimbing_sekolah ?? '',
        alamat: profile.alamat ?? '',
        kota: profile.kota ?? '',
        provinsi: profile.provinsi ?? '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi tipe file
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'File tidak valid',
                    text: 'File harus berupa jpg, jpeg, png, webp',
                });
                return;
            }

            // Validasi ukuran file (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ukuran file terlalu besar',
                    text: 'Ukuran file maksimal 2MB',
                });
                return;
            }

            setData('avatar', file);
            setData('delete_avatar', false);
            setIsAvatarDeleted(false);

            // Buat preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteAvatar = (e: React.MouseEvent) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Foto profil akan dihapus!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                setData('avatar', null);
                setData('delete_avatar', true);
                setPreviewUrl(null);
                setIsAvatarDeleted(true);
                if (fileRef.current) {
                    fileRef.current.value = '';
                }
                Swal.fire({
                    title: 'Terhapus!',
                    text: 'Foto profil telah dihapus.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                setPreviewUrl(null);
                setIsAvatarDeleted(false);
                Swal.fire({
                    showConfirmButton: false,
                    timer: 1500,
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Profil berhasil diperbarui!',
                });
            },
            onError: (errors) => {
                console.error('Upload error:', errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Terjadi kesalahan saat memperbarui profil.',
                });
            },
        });
    };

    const handleCancel = () => {
        reset();
        setPreviewUrl(null);
        setIsAvatarDeleted(false);
        setIsEditing(false);
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const formatDate = (tanggal: string | Date): string => {
        const date = new Date(tanggal);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Profile', href: '/profile' },
    ];

    // Tentukan URL avatar yang akan ditampilkan
    const getAvatarUrl = () => {
        if (isAvatarDeleted) return fotoprofile;
        if (previewUrl) return previewUrl;
        if (profile.user.avatar) return `/storage/${profile.user.avatar}`;
        return fotoprofile;
    };
    const hasAvatar = !isAvatarDeleted && (previewUrl || profile.user.avatar);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Saya" />

            <form onSubmit={submit}>
                {/* === HEADER PROFILE === */}
                <div className="relative mb-24">
                    <div className="h-40 w-full rounded-2xl bg-gradient-to-r from-red-500 to-red-600" />

                    <div className="absolute right-6 -bottom-16 left-6 flex items-end gap-6">
                        {/* AVATAR UPLOAD */}
                        <div className="relative">
                            <img
                                src={getAvatarUrl()}
                                alt="Profile Avatar"
                                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
                            />
                            <input
                                type="file"
                                ref={fileRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                disabled={!isEditing}
                            />
                            {isEditing && (
                                <div className="absolute right-2 bottom-2 flex gap-2">
                                    {hasAvatar && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteAvatar}
                                            className="rounded-full bg-gray-800 p-2 text-white shadow transition hover:bg-gray-900"
                                            title="Hapus foto profil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="rounded-full bg-red-500 p-2 text-white shadow transition hover:bg-red-600"
                                        title="Upload foto profil"
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex w-full items-end justify-between pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {profile.user.name}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {profile.jenis_peserta?.toUpperCase()} •{' '}
                                    {profile.asal_instansi}
                                </p>
                            </div>

                            <span
                                className={`mb-4 rounded-full px-4 py-1 text-sm font-semibold ${
                                    profile.user.status === 'diterima'
                                        ? 'bg-green-400 text-white'
                                        : 'bg-yellow-400 text-black'
                                }`}
                            >
                                <p style={{ textTransform: 'capitalize' }}>
                                    {profile.user.status}
                                </p>
                            </span>
                        </div>
                    </div>

                    <div className="absolute right-6 bottom-4">
                        <Button
                            type="button"
                            onClick={() =>
                                isEditing ? handleCancel() : setIsEditing(true)
                            }
                            variant="secondary"
                            className="flex gap-2 bg-white text-red-500 shadow hover:bg-gray-100"
                        >
                            {isEditing ? <X size={16} /> : <Edit size={16} />}
                            {isEditing ? 'Batal' : 'Edit Profil'}
                        </Button>
                    </div>
                </div>

                {/* Error message untuk avatar */}
                {errors.avatar && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                        {errors.avatar}
                    </div>
                )}

                {/* === CONTENT === */}
                <Card className="rounded-2xl shadow-sm">
                    <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                        <Field
                            label="Nama Lengkap"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            editable={isEditing}
                            error={errors.name}
                        />
                        <Field
                            label="Email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            editable={isEditing}
                            error={errors.email}
                        />
                        <Field
                            label="No. Telepon"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            editable={isEditing}
                            error={errors.phone}
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                            {isEditing ? (
                                <Select
                                    value={data.jenis_kelamin}
                                    onValueChange={(val) => setData('jenis_kelamin', val)}
                                >
                                    <SelectTrigger className={errors.jenis_kelamin ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                                        <SelectValue placeholder="Pilih Jenis Kelamin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="L">Laki-laki</SelectItem>
                                        <SelectItem value="P">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    disabled
                                    value={data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                />
                            )}
                            {errors.jenis_kelamin && (
                                <p className="text-xs font-medium text-red-500">{errors.jenis_kelamin}</p>
                            )}
                        </div>
                        <Field
                            label="Temapat Lahir"
                            value={data.tempat_lahir}
                            onChange={(e) =>
                                setData('tempat_lahir', e.target.value)
                            }
                            editable={isEditing}
                            error={errors.tempat_lahir}
                        />
                        <Field
                            label="Tanggal Lahir"
                            value={formatDate(data.tanggal_lahir)}
                            onChange={(e) =>
                                setData('tanggal_lahir', e.target.value)
                            }
                            editable={isEditing}
                            error={errors.tanggal_lahir}
                        />
                        <Field
                            label="Asal Instansi"
                            value={data.asal_instansi}
                            onChange={(e) =>
                                setData('asal_instansi', e.target.value)
                            }
                            editable={isEditing}
                            error={errors.asal_instansi}
                        />

                        {/* Kondisional Field berdasarkan jenis peserta */}
                        <Field
                            label={
                                data.jenis_peserta === 'siswa' ? 'NISN' : 'NIM'
                            }
                            value={data.nim_nisn}
                            onChange={(e) =>
                                setData('nim_nisn', e.target.value)
                            }
                            editable={isEditing}
                            error={errors.nim_nisn}
                        />
                        <Field
                            label={
                                data.jenis_peserta === 'siswa'
                                    ? 'Kelas'
                                    : 'Semester'
                            }
                            value={data.semester_kelas}
                            onChange={(e) =>
                                setData('semester_kelas', e.target.value)
                            }
                            editable={isEditing}
                            error={errors.semester_kelas}
                        />

                        <Field
                            label="Jurusan"
                            value={data.jurusan}
                            onChange={(e) => setData('jurusan', e.target.value)}
                            editable={isEditing}
                            error={errors.jurusan}
                        />

                        {data.jenis_peserta === 'siswa' && (
                            <>
                                <Field
                                    label="Pembimbing Sekolah"
                                    value={data.nama_pembimbing_sekolah}
                                    onChange={(e) =>
                                        setData(
                                            'nama_pembimbing_sekolah',
                                            e.target.value,
                                        )
                                    }
                                    editable={isEditing}
                                />
                                <Field
                                    label="WA Pembimbing"
                                    value={data.no_hp_pembimbing_sekolah}
                                    onChange={(e) =>
                                        setData(
                                            'no_hp_pembimbing_sekolah',
                                            e.target.value,
                                        )
                                    }
                                    editable={isEditing}
                                />
                            </>
                        )}

                        <div className="flex h-full flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm font-medium text-gray-600">
                                Alamat
                            </label>
                            <Textarea
                                disabled={!isEditing}
                                value={data.alamat}
                                onChange={(e) =>
                                    setData('alamat', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                            <Field
                                label="Kota"
                                value={data.kota}
                                onChange={(e) =>
                                    setData('kota', e.target.value)
                                }
                                editable={isEditing}
                            />
                            <Field
                                label="Provinsi"
                                value={data.provinsi}
                                onChange={(e) =>
                                    setData('provinsi', e.target.value)
                                }
                                editable={isEditing}
                            />
                        </div>

                        <div className="grid gap-6 border-t pt-4 md:col-span-2 md:grid-cols-2">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-600">
                                    Tanggal Mulai Magang
                                </span>
                                <span className="font-semibold text-gray-700">
                                    {formatDate(profile.tanggal_mulai)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-600">
                                    Tanggal Selesai Magang
                                </span>
                                <span className="font-semibold text-gray-700">
                                    {formatDate(profile.tanggal_selesai)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isEditing && (
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            disabled={processing}
                            type="submit"
                            className="min-w-[150px] bg-red-500 text-white hover:bg-red-600"
                        >
                            {processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save size={16} className="mr-1" />
                            )}
                            Simpan Perubahan
                        </Button>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}

function Field({
    label,
    value,
    onChange,
    editable = false,
    error,
}: {
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    editable?: boolean;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">{label}</label>
            <Input
                disabled={!editable}
                value={value || ''}
                onChange={onChange}
                className={
                    error ? 'border-red-500 focus-visible:ring-red-500' : ''
                }
            />
            {error && (
                <p className="text-xs font-medium text-red-500">{error}</p>
            )}
        </div>
    );
}
