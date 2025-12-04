import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Edit, Plus, Trash2 } from 'lucide-react';

type PicUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  bidang_magang_id?: number | null;
  bidang_magang?: string | null;
  status?: string | null;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type Props = {
  picUsers: Paginated<PicUser>;
  bidangOptions: { value: number; label: string }[];
};

export default function KelolaPICPage({ picUsers, bidangOptions }: Props) {
  const page = usePage();
  const isAdmin = useMemo(() => page.url.startsWith('/admin'), [page.url]);
  const base = isAdmin ? '/admin' : '/pic';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Kelola PIC', href: `${base}/kelola-pic` },
  ];

  const [search, setSearch] = useState<string>('');
  const [bidang, setBidang] = useState<string | undefined>(undefined);
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<PicUser | null>(null);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', bidang_magang_id: '', password: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', bidang_magang_id: '', password: '' });

  useEffect(() => {
    // Initialize filters from URL params if available
    const url = new URL(window.location.href);
    const s = url.searchParams.get('search') ?? '';
    const b = url.searchParams.get('bidang') ?? undefined;
    setSearch(s);
    setBidang(b ?? undefined);
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (bidang && bidang !== 'semua') params.bidang = bidang;
    router.get(`${base}/kelola-pic`, params, { preserveState: true });
  };

  const onResetFilters = () => {
    setSearch('');
    setBidang(undefined);
    router.get(`${base}/kelola-pic`, {}, { preserveState: true });
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(`${base}/kelola-pic`, {
      name: addForm.name,
      email: addForm.email,
      phone: addForm.phone || undefined,
      bidang_magang_id: addForm.bidang_magang_id ? Number(addForm.bidang_magang_id) : undefined,
      password: addForm.password,
    }, {
      onSuccess: () => {
        setOpenAdd(false);
        setAddForm({ name: '', email: '', phone: '', bidang_magang_id: '', password: '' });
      },
    });
  };

  const openEditDialog = (user: PicUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      bidang_magang_id: user.bidang_magang_id ? String(user.bidang_magang_id) : '',
      password: '',
    });
    setOpenEdit(true);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    router.patch(`${base}/kelola-pic/${editingUser.id}`, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || undefined,
      bidang_magang_id: editForm.bidang_magang_id ? Number(editForm.bidang_magang_id) : undefined,
      password: editForm.password || undefined,
    }, {
      onSuccess: () => {
        setOpenEdit(false);
        setEditingUser(null);
      },
    });
  };

  const submitDelete = (user: PicUser) => {
    if (!confirm(`Hapus PIC ${user.name}?`)) return;
    router.delete(`${base}/kelola-pic/${user.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kelola PIC" />

      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div>
                <h1 className="text-xl font-semibold">Kelola PIC</h1>
                <p className="text-sm text-muted-foreground">Tambah, ubah, dan hapus user dengan role PIC</p>
              </div>
              <Button className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600" onClick={() => setOpenAdd(true)}>
                <Plus size={16} />
                Tambah PIC
              </Button>
            </div>

            <form className="flex flex-col items-center gap-3 sm:flex-row" onSubmit={onSearchSubmit}>
              <div className="relative w-full sm:w-1/2">
                <Input
                  placeholder="Cari nama atau email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-1/3">
                <Select value={bidang} onValueChange={(v) => setBidang(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter Bidang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Bidang</SelectItem>
                    {bidangOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-red-500 text-white hover:bg-red-600">Terapkan</Button>
                <Button type="button" variant="outline" onClick={onResetFilters}>Reset</Button>
              </div>
            </form>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Bidang</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {picUsers.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">Tidak ada data</TableCell>
                    </TableRow>
                  )}
                  {picUsers.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.bidang_magang || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(user)} className="flex items-center gap-1">
                            <Edit size={14} /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => submitDelete(user)} className="flex items-center gap-1">
                            <Trash2 size={14} /> Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {picUsers.last_page > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href={`${base}/kelola-pic?page=${Math.max(picUsers.current_page - 1, 1)}`} />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href={`${base}/kelola-pic?page=${Math.min(picUsers.current_page + 1, picUsers.last_page)}`} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>

        {/* Dialog Tambah PIC */}
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah PIC</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitAdd} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Nama</Label>
                  <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Telepon</Label>
                  <Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Bidang</Label>
                  <Select value={addForm.bidang_magang_id} onValueChange={(v) => setAddForm({ ...addForm, bidang_magang_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Bidang (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {bidangOptions.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Password</Label>
                  <Input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Batal</Button>
                <Button type="submit" className="bg-red-500 text-white hover:bg-red-600">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Edit PIC */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit PIC</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Nama</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Telepon</Label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Bidang</Label>
                  <Select value={editForm.bidang_magang_id} onValueChange={(v) => setEditForm({ ...editForm, bidang_magang_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Bidang (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {bidangOptions.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Password (opsional)</Label>
                  <Input type="password" value={editForm.password} placeholder="Biarkan kosong jika tidak diubah" onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Batal</Button>
                <Button type="submit" className="bg-red-500 text-white hover:bg-red-600">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}