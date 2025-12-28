import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { guestDaftar } from '@/routes/pendaftaran';
import { router } from '@inertiajs/react';
import {
    CalendarIcon,
    CheckCircle2,
    ChevronDown,
    GraduationCap,
    School,
    Sparkles,
    UserCircle2,
    Briefcase
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import FooterSection from './LandingPage/FooterSection';
import Header from './LandingPage/Header';

// --- Komponen Styling Modern ---

// Input field dengan gaya "Apple/Modern SaaS": Clean, Shadow halus, Ring focus
const ModernInput = ({ id, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="group relative transition-all duration-300">
        <input
            id={id}
            className="peer w-full rounded-2xl border-0 bg-white px-5 py-4 text-sm font-medium text-gray-900 shadow-[0_2px_10px_rgb(0,0,0,0.03)] ring-1 ring-gray-200 transition-all placeholder:text-gray-400 focus:shadow-[0_4px_20px_rgb(0,0,0,0.06)] focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-0 disabled:opacity-50"
            {...props}
        />
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-rose-100/50 to-orange-100/50 opacity-0 transition-opacity duration-500 peer-focus:opacity-100" />
    </div>
);

// TextArea yang senada
const ModernTextArea = ({ id, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <div className="relative">
        <textarea
            id={id}
            className="peer w-full resize-none rounded-2xl border-0 bg-white px-5 py-4 text-sm font-medium text-gray-900 shadow-[0_2px_10px_rgb(0,0,0,0.03)] ring-1 ring-gray-200 transition-all placeholder:text-gray-400 focus:shadow-[0_4px_20px_rgb(0,0,0,0.06)] focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-0"
            {...props}
        />
    </div>
);

// DatePicker yang di-revamp total
const ModernDatePicker = ({ id, label, date, setDate, error }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={id} className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                {label}
            </Label>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={id}
                        className={`h-auto w-full justify-between rounded-2xl border-0 bg-white py-2.5 px-5 text-left font-medium shadow-[0_2px_10px_rgb(0,0,0,0.03)] ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900 ${
                            !date ? 'text-gray-400' : 'text-gray-900'
                        } ${error ? 'ring-red-500 ring-offset-1' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${date ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'}`}>
                                <CalendarIcon className="h-4 w-4" />
                            </div>
                            <span className="text-sm">
                                {date ? date.toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Pilih Tanggal'}
                            </span>
                        </div>
                        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-0 p-0 shadow-2xl rounded-2xl" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => { setDate(d); setIsOpen(false); }}
                        fromYear={1990}
                        toYear={new Date().getFullYear() + 5}
                        captionLayout="dropdown"
                        className="rounded-2xl bg-white p-4 font-sans"
                    />
                </PopoverContent>
            </Popover>
            {error && <p className="text-[10px] font-medium text-rose-500 ml-2 animate-pulse">{error}</p>}
        </div>
    );
};

export default function Pendaftaran() {
    const [jenjang, setJenjang] = useState<'universitas' | 'smk'>('universitas');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // State form (sama seperti logic asli)
    const [formData, setFormData] = useState({
        nim: '', nama_univ: '', jurusan: '', semester: '',
        nis: '', nama_sekolah: '', kelas: '',
        nama_lengkap: '', email: '', phone: '', tempat_lahir: '',
        tanggal_lahir: undefined as Date | undefined,
        jenis_kelamin: '', alamat: '', kota: '', provinsi: '',
        nama_pembimbing: '', no_hp_pembimbing: '',
        tanggal_mulai: undefined as Date | undefined,
        tanggal_selesai: undefined as Date | undefined,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (errors[id]) setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        
        // Logic pengisian FormData (tetap sama)
        data.append('jenjang', jenjang);
        if (jenjang === 'universitas') {
            data.append('nim', formData.nim); data.append('nama_univ', formData.nama_univ);
        } else {
            data.append('nis', formData.nis); data.append('nama_sekolah', formData.nama_sekolah);
            data.append('kelas', formData.kelas); data.append('nama_pembimbing', formData.nama_pembimbing);
            data.append('no_hp_pembimbing', formData.no_hp_pembimbing);
        }
        data.append('jurusan', formData.jurusan); data.append('semester', formData.semester);
        data.append('nama_lengkap', formData.nama_lengkap); data.append('email', formData.email);
        data.append('phone', formData.phone); data.append('tempat_lahir', formData.tempat_lahir);
        data.append('alamat', formData.alamat); data.append('kota', formData.kota);
        data.append('provinsi', formData.provinsi); data.append('jenis_kelamin', formData.jenis_kelamin);
        if (formData.tanggal_lahir) data.append('tanggal_lahir', formData.tanggal_lahir.toISOString().split('T')[0]);
        if (formData.tanggal_mulai) data.append('tanggal_mulai', formData.tanggal_mulai.toISOString().split('T')[0]);
        if (formData.tanggal_selesai) data.append('tanggal_selesai', formData.tanggal_selesai.toISOString().split('T')[0]);

        router.post(guestDaftar().url, data, {
            onSuccess: () => Swal.fire({ 
                icon: 'success', title: 'Berhasil! 🚀', text: 'Pendaftaranmu berhasil dikirim.', 
                confirmButtonColor: '#f43f5e', customClass: { popup: 'rounded-3xl' } 
            }),
            onError: (errs) => {
                setErrors(errs);
                Swal.fire({ 
                    icon: 'error', title: 'Oops!', text: 'Cek kembali data yang merah ya.', 
                    confirmButtonColor: '#f43f5e', customClass: { popup: 'rounded-3xl' } 
                });
            },
        });
    };

    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-[#F4F6F9] font-sans text-slate-800">
            {/* --- Background Aesthetics (Aurora Gradients) --- */}
            <div className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-rose-200/40 blur-[100px] mix-blend-multiply" />
            <div className="absolute -right-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-[100px] mix-blend-multiply" />
            <div className="absolute bottom-0 left-[20%] h-[400px] w-[400px] rounded-full bg-orange-100/50 blur-[80px]" />

            <div className="relative z-10 mx-auto flex w-full flex-col items-center gap-6 px-4 py-6 md:px-8">
                <Header />

                {/* --- Main Card Container --- */}
                <div className="mt-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] backdrop-blur-xl ring-1 ring-white/50">
                        
                        {/* Header Banner */}
                        <div className="relative px-8 pt-12 pb-8 text-center md:px-16">
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-rose-600 ring-1 ring-rose-100">
                                <Sparkles className="h-3 w-3" /> Program Magang 2025
                            </span>
                            <h1 className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                                Ayo Mulai Perjalanan Anda.
                            </h1>
                            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-500">
                                Isi formulir di bawah ini dengan data yang valid untuk bergabung bersama kami.
                            </p>
                        </div>

                        {/* Interactive Toggle Switch */}
                        <div className="mx-auto flex w-full max-w-[340px] items-center rounded-full bg-slate-100/80 p-1.5 ring-1 ring-slate-200">
                            {['universitas', 'smk'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setJenjang(type as any)}
                                    className={`relative flex-1 rounded-full py-3 text-sm font-bold transition-all duration-300 ${
                                        jenjang === type 
                                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {type === 'universitas' ? <GraduationCap className="h-4 w-4" /> : <School className="h-4 w-4" />}
                                        {type === 'universitas' ? 'Mahasiswa' : 'Siswa SMK'}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-10 md:px-16 md:py-14">
                            <div className="space-y-12">
                                
                                {/* --- SECTION 1: Academic Info --- */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                            <Briefcase className="h-5 w-5 text-rose-500" />
                                            Data Institusi
                                        </h3>
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        {jenjang === 'universitas' ? (
                                            <>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">NIM</Label>
                                                    <ModernInput id="nim" placeholder="Nomor Induk Mahasiswa" value={formData.nim} onChange={handleInputChange} required />
                                                </div>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Universitas</Label>
                                                    <ModernInput id="nama_univ" placeholder="Nama Kampus" value={formData.nama_univ} onChange={handleInputChange} required />
                                                </div>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Jurusan</Label>
                                                    <ModernInput id="jurusan" placeholder="Program Studi" value={formData.jurusan} onChange={handleInputChange} required />
                                                </div>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Semester</Label>
                                                    <ModernInput id="semester" type="number" placeholder="Semester" max={14} min={1} step={1} value={formData.semester} onChange={handleInputChange} required />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">NIS</Label>
                                                    <ModernInput id="nis" placeholder="Nomor Induk Siswa" value={formData.nis} onChange={handleInputChange} required />
                                                </div>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Sekolah</Label>
                                                    <ModernInput id="nama_sekolah" placeholder="Nama SMK" value={formData.nama_sekolah} onChange={handleInputChange} required />
                                                </div>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Kelas</Label>
                                                    <ModernInput id="kelas" placeholder="Contoh: XII RPL 2" value={formData.kelas} maxLength={10    } onChange={handleInputChange} required />
                                                </div>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Jurusan</Label>
                                                    <ModernInput id="jurusan" placeholder="Contoh: Rekayasa Perangkat Lunak" value={formData.jurusan} onChange={handleInputChange} required />
                                                </div>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Pembimbing Sekolah</Label>
                                                    <ModernInput id="nama_pembimbing" placeholder="Nama Guru" value={formData.nama_pembimbing} onChange={handleInputChange} required />
                                                </div>
                                                <div>
                                                    <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Whatsapp Guru Pembimbing</Label>
                                                    <ModernInput id="no_hp_pembimbing" type="tel" placeholder="08..." value={formData.no_hp_pembimbing} onChange={handleInputChange} required />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* --- SECTION 2: Personal Info --- */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                            <UserCircle2 className="h-5 w-5 text-rose-500" />
                                            Data Pribadi
                                        </h3>
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Nama Lengkap</Label>
                                            <ModernInput id="nama_lengkap" placeholder="Sesuai kartu identitas" value={formData.nama_lengkap} onChange={handleInputChange} required />
                                            {errors.nama_lengkap && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.nama_lengkap}</p>}
                                        </div>

                                        <div>
                                            <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Email</Label>
                                            <ModernInput id="email" type="email" placeholder="email@address.com" value={formData.email} onChange={handleInputChange} required />
                                            {errors.email && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">WhatsApp</Label>
                                            <ModernInput id="phone" type="tel" placeholder="08..." value={formData.phone} onChange={handleInputChange} required />
                                            {errors.phone && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.phone}</p>}
                                        </div>

                                        <div>
                                            <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Tempat Lahir</Label>
                                            <ModernInput id="tempat_lahir" placeholder="Kota Kelahiran" value={formData.tempat_lahir} onChange={handleInputChange} required />
                                        </div>

                                        <ModernDatePicker 
                                            id="tanggal_lahir" 
                                            label="Tanggal Lahir"
                                            date={formData.tanggal_lahir} 
                                            setDate={(d: Date) => setFormData(p => ({ ...p, tanggal_lahir: d }))}
                                            error={errors.tanggal_lahir}
                                            />

                                        <div className="md:col-span-2">
                                            <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Jenis Kelamin</Label>
                                            <Select value={formData.jenis_kelamin} onValueChange={(v) => setFormData(p => ({ ...p, jenis_kelamin: v }))}>
                                                <SelectTrigger className={`w-full rounded-2xl border-0 bg-white py-4 px-5 h-auto shadow-[0_2px_10px_rgb(0,0,0,0.03)] ring-1 ring-gray-200 focus:ring-2 focus:ring-rose-500/20 ${errors.jenis_kelamin ? 'ring-rose-500' : ''}`}>
                                                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-0 shadow-xl">
                                                    <SelectGroup>
                                                        <SelectItem value="L">Laki-laki</SelectItem>
                                                        <SelectItem value="P">Perempuan</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Alamat Lengkap</Label>
                                            <ModernTextArea id="alamat" rows={3} placeholder="Nama jalan, nomor rumah, RT/RW..." value={formData.alamat} onChange={handleInputChange} required />
                                        </div>

                                        <div>
                                            <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Kota</Label>
                                            <ModernInput id="kota" placeholder="Kota Domisili" value={formData.kota} onChange={handleInputChange} required />
                                        </div>
                                        <div>
                                            <Label className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500">Provinsi</Label>
                                            <ModernInput id="provinsi" placeholder="Provinsi" value={formData.provinsi} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </div>

                                {/* --- SECTION 3: Duration --- */}
                                <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-100">
                                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                        <CalendarIcon className="h-4 w-4" /> Durasi Magang
                                    </h3>
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <ModernDatePicker 
                                            id="tanggal_mulai" 
                                            label="Mulai Magang"
                                            date={formData.tanggal_mulai} 
                                            setDate={(d: Date) => setFormData(p => ({ ...p, tanggal_mulai: d }))}
                                            error={errors.tanggal_mulai}
                                        />
                                        <ModernDatePicker 
                                            id="tanggal_selesai" 
                                            label="Selesai Magang"
                                            date={formData.tanggal_selesai} 
                                            setDate={(d: Date) => setFormData(p => ({ ...p, tanggal_selesai: d }))}
                                            error={errors.tanggal_selesai}
                                        />
                                    </div>
                                </div>

                                {/* Submit Area */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="group relative w-full overflow-hidden rounded-2xl bg-rose-600 px-8 py-5 text-lg font-bold text-white shadow-xl shadow-rose-500/30 transition-all duration-300 hover:scale-[1.01] hover:bg-rose-500 active:scale-[0.98]"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            Kirim Lamaran Sekarang
                                            <CheckCircle2 className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                        {/* Shine effect */}
                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                                    </button>
                                    <p className="mt-4 text-center text-xs text-gray-400">
                                        Dengan mengirimkan form ini, data Anda akan diproses oleh tim seleksi.
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <FooterSection />
        </section>
    );
}