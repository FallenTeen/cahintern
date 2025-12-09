import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type IzinItem = {
  id: number;
  nama_peserta: string;
  tanggal: string;
  jenis: 'dinas_luar' | 'sakit' | 'terlambat' | 'lainnya';
  keterangan: string | null;
  status: 'pending' | 'disetujui' | 'ditolak';
  lokasi?: string | null;
  waktu_mulai?: string | null;
  waktu_selesai?: string | null;
  project_url?: string | null;
  surat_tugas?: string | null;
};

type Participant = { id: number; nama: string };

type Props = {
  izins: { data: IzinItem[] };
  participants: Participant[];
  rekap: { peserta_profile_id: number; nama: string; total: number }[];
};

export default function IzinAdminPage() {
  const { izins, participants, rekap } = usePage<Props>().props;
  const [search, setSearch] = useState('');
  const [jenis, setJenis] = useState<'semua' | IzinItem['jenis']>('semua');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    jenis: 'dinas_luar' as IzinItem['jenis'],
    keterangan: '',
    status: 'pending' as IzinItem['status'],
    lokasi: '',
    waktu_mulai: '',
    waktu_selesai: '',
    project_url: '',
    surat_tugas: null as File | null,
  });

  const filtered = useMemo(() => {
    return (izins?.data ?? []).filter((i) => {
      const matchName = i.nama_peserta.toLowerCase().includes(search.toLowerCase());
      const matchJenis = jenis === 'semua' ? true : i.jenis === jenis;
      const matchStart = start ? i.tanggal >= start : true;
      const matchEnd = end ? i.tanggal <= end : true;
      return matchName && matchJenis && matchStart && matchEnd;
    });
  }, [izins, search, jenis, start, end]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submitIzin = () => {
    if (selected.length === 0) {
      window.alert('Pilih minimal satu peserta');
      return;
    }
    const fd = new FormData();
    selected.forEach((id) => fd.append('peserta_ids[]', String(id)));
    fd.append('tanggal', form.tanggal);
    fd.append('jenis', form.jenis);
    if (form.keterangan) fd.append('keterangan', form.keterangan);
    fd.append('status', form.status);
    if (form.jenis === 'dinas_luar') {
      if (form.lokasi) fd.append('lokasi', form.lokasi);
      if (form.waktu_mulai) fd.append('waktu_mulai', form.waktu_mulai);
      if (form.waktu_selesai) fd.append('waktu_selesai', form.waktu_selesai);
      if (form.project_url) fd.append('project_url', form.project_url);
      if (form.surat_tugas) fd.append('surat_tugas', form.surat_tugas);
    }
    router.post('/izin', fd, { forceFormData: true });
  };

  return (
    <AppLayout>
      <Head title="Kelola Izin" />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Kelola Izin</h1>
          <div className="flex gap-2">
            <Input placeholder="Cari nama" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="border px-2 py-2" value={jenis} onChange={(e) => setJenis(e.target.value as 'semua' | IzinItem['jenis'])}>
              <option value="semua">Semua</option>
              <option value="dinas_luar">Dinas Luar</option>
              <option value="sakit">Sakit</option>
              <option value="terlambat">Terlambat</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Input Izin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Tanggal</label>
                  <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm">Jenis</label>
                  <select className="w-full border px-2 py-2" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as IzinItem['jenis'] })}>
                    <option value="dinas_luar">Dinas Luar</option>
                    <option value="sakit">Sakit</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm">Status</label>
                  <select className="w-full border px-2 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as IzinItem['status'] })}>
                    <option value="pending">Pending</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm">Keterangan</label>
                  <Input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
                </div>
              </div>

              {form.jenis === 'dinas_luar' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm">Lokasi</label>
                    <Input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm">Waktu Mulai</label>
                    <Input type="time" value={form.waktu_mulai} onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm">Waktu Selesai</label>
                    <Input type="time" value={form.waktu_selesai} onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm">Tautan Proyek</label>
                    <Input type="url" value={form.project_url} onChange={(e) => setForm({ ...form, project_url: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm">Surat Tugas</label>
                    <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setForm({ ...form, surat_tugas: e.target.files?.[0] ?? null })} />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button className="bg-red-600 text-white hover:bg-red-700" onClick={submitIzin}>Simpan Izin</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pilih Peserta (Massal)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants.map((p) => (
                  <label key={p.id} className="flex items-center gap-2">
                    <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                    <span>{p.nama}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Izin</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.nama_peserta}</TableCell>
                    <TableCell>{i.tanggal}</TableCell>
                    <TableCell>{i.jenis}</TableCell>
                    <TableCell>{i.status}</TableCell>
                    <TableCell>{i.keterangan ?? '-'}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.post(`/izin/${i.id}/approve`)}>Setujui</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        const ket = window.prompt('Alasan penolakan');
                        if (!ket) return;
                        router.post(`/izin/${i.id}/reject`, { keterangan: ket });
                      }}>Tolak</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {rekap.map((r) => (
            <Card key={r.peserta_profile_id}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{r.nama}</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{r.total}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
