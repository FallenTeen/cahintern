import AppLayout from '@/layouts/app-layout';
import { dashboard, logbookMahasiswa } from '@/routes';
import { detail as logbookDetail } from '@/routes/logbook';
import { show as showLogbookMahasiswa } from '@/routes/logbook/mahasiswa';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Eye, Users, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Status = "pending" | "disetujui" | "ditolak" | "revision";

type LogbookData = {
  id: number;
  nama_peserta: string;
  peserta_profile_id: number;
  tanggal: string;
  kegiatan: string;
  deskripsi: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  durasi: string;
  status: Status;
  status_label: string;
  catatan_pembimbing: string | null;
  dokumentasi: string | null;
};

type GroupedLogbook = {
  nama_peserta: string;
  peserta_profile_id: number;
  logbooks: LogbookData[];
  total_logbook: number;
  pending: number;
  disetujui: number;
  revision: number;
  ditolak: number;
};

type Props = {
  logbookData: {
    data: LogbookData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboard().url },
  { title: "Logbook Mahasiswa", href: logbookMahasiswa().url},
];

export default function LogbookMahasiswa() {
  const { logbookData } = usePage<Props>().props;
  const [data] = useState<LogbookData[]>(logbookData.data);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "Semua">("Semua");
  const [viewMode, setViewMode] = useState<"list" | "grouped">("list");
  const [sortBy, setSortBy] = useState<"tanggal" | "nama" | "status">("tanggal");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      if (statusFilter !== "Semua" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.nama_peserta.toLowerCase().includes(q) ||
        d.kegiatan.toLowerCase().includes(q)
      );
    });
  }, [data, query, statusFilter]);

  const sorted = useMemo(() => {
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "nama") {
        comparison = a.nama_peserta.localeCompare(b.nama_peserta);
      } else if (sortBy === "tanggal") {
        comparison = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filtered, sortBy, sortOrder]);

  const groupedData = useMemo(() => {
    const groups: Record<number, GroupedLogbook> = {};

    sorted.forEach((logbook) => {
      const id = logbook.peserta_profile_id;
      if (!groups[id]) {
        groups[id] = {
          nama_peserta: logbook.nama_peserta,
          peserta_profile_id: logbook.peserta_profile_id,
          logbooks: [],
          total_logbook: 0,
          pending: 0,
          disetujui: 0,
          revision: 0,
          ditolak: 0,
        };
      }

      groups[id].logbooks.push(logbook);
      groups[id].total_logbook++;

      if (logbook.status === 'pending') groups[id].pending++;
      if (logbook.status === 'disetujui') groups[id].disetujui++;
      if (logbook.status === 'revision') groups[id].revision++;
      if (logbook.status === 'ditolak') groups[id].ditolak++;
    });

    return Object.values(groups);
  }, [sorted]);

  const badgeColor = (status: Status) => {
    switch (status) {
      case "disetujui":
        return "bg-green-500 text-white hover:bg-green-600";
      case "pending":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "revision":
        return "bg-orange-500 text-white hover:bg-orange-600";
      case "ditolak":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const handleViewLogbook = (pesertaProfileId: number) => {
    router.visit(showLogbookMahasiswa(pesertaProfileId).url);
  };

  const handleViewDetail = (logbookId: number) => {
    router.visit(logbookDetail(logbookId).url);
  };

  const toggleSort = (field: "tanggal" | "nama" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: "tanggal" | "nama" | "status" }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? <ChevronUp className="w-4 h-4 inline ml-1" /> : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Logbook Mahasiswa" />

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Logbook Mahasiswa</h1>
          <p className="text-muted-foreground">
            Lihat dan validasi logbook harian mahasiswa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Menunggu Validasi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-yellow-500">
              {data.filter(d => d.status === 'pending').length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Sudah Divalidasi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-green-500">
              {data.filter(d => d.status === 'disetujui').length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Diminta Revisi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-orange-500">
              {data.filter(d => d.status === 'revision').length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Ditolak
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-red-500">
              {data.filter(d => d.status === 'ditolak').length}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Cari logbook (nama atau judul kegiatan)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />

              <Select value={viewMode} onValueChange={(value: "list" | "grouped") => setViewMode(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tampilan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="grouped">Group by Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Semua", "pending", "disetujui", "revision", "ditolak"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status as Status | "Semua")}
                >
                  {status === "pending" ? "Menunggu" :
                   status === "disetujui" ? "Valid" :
                   status === "revision" ? "Revisi" :
                   status === "ditolak" ? "Ditolak" : status}
                </Button>
              ))}
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-40" />
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40" />
              <Button variant="outline" onClick={() => router.get('/logbook', { status: statusFilter === 'Semua' ? undefined : statusFilter, start, end })}>Terapkan Periode</Button>
              <Button onClick={() => {
                const url = `/logbook/export?${new URLSearchParams({ status: statusFilter === 'Semua' ? '' : statusFilter, start, end }).toString()}`;
                window.location.href = url;
              }}>Export CSV</Button>
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground">
              Menampilkan {viewMode === "list" ? sorted.length : groupedData.length} {viewMode === "list" ? "logbook" : "mahasiswa"}
            </p>
          </CardContent>
        </Card>

        {viewMode === "list" ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort("nama")}
                    >
                      Nama Mahasiswa <SortIcon field="nama" />
                    </TableHead>
                    
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort("tanggal")}
                    >
                      Tanggal <SortIcon field="tanggal" />
                    </TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Deskripsi Singkat</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort("status")}
                    >
                      Status <SortIcon field="status" />
                    </TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{d.nama_peserta}</TableCell>
                      
                      <TableCell>{d.tanggal}</TableCell>
                      <TableCell>{d.durasi}</TableCell>
                      <TableCell>{d.deskripsi ? `${d.deskripsi.slice(0, 80)}${d.deskripsi.length > 80 ? '...' : ''}` : '-'}</TableCell>
                      <TableCell>
                        <Badge className={badgeColor(d.status)}>{d.status_label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(d.id)}
                          >
                            <Eye className="w-5 h-5 text-blue-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const note = window.prompt('Catatan/verifikasi (opsional)') || '';
                              router.post(`/logbook/${d.id}/approve`, { catatan_pembimbing: note });
                            }}
                          >
                            Verifikasi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const note = window.prompt('Alasan penolakan (min 10 karakter)') || '';
                              if (note.trim().length < 10) {
                                window.alert('Alasan terlalu singkat');
                                return;
                              }
                              router.post(`/logbook/${d.id}/reject`, { catatan_pembimbing: note });
                            }}
                          >
                            Tolak
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const note = window.prompt('Catatan revisi (min 10 karakter)') || '';
                              if (note.trim().length < 10) {
                                window.alert('Catatan terlalu singkat');
                                return;
                              }
                              router.post(`/logbook/${d.id}/revision`, { catatan_pembimbing: note });
                            }}
                          >
                            Revisi
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedData.map((group) => (
              <Card key={group.peserta_profile_id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{group.nama_peserta}</CardTitle>
                        
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleViewLogbook(group.peserta_profile_id)}
                    >
                      Lihat Semua Logbook
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{group.total_logbook}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{group.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{group.disetujui}</p>
                      <p className="text-xs text-muted-foreground">Disetujui</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{group.revision}</p>
                      <p className="text-xs text-muted-foreground">Revisi</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{group.ditolak}</p>
                      <p className="text-xs text-muted-foreground">Ditolak</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Logbook Terbaru:</p>
                    {group.logbooks.slice(0, 3).map((logbook) => (
                      <div
                        key={logbook.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted cursor-pointer"
                        onClick={() => handleViewDetail(logbook.id)}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{logbook.kegiatan}</p>
                          <p className="text-xs text-muted-foreground">{logbook.tanggal} • {logbook.durasi}</p>
                        </div>
                        <Badge className={badgeColor(logbook.status)} variant="secondary">
                          {logbook.status_label}
                        </Badge>
                      </div>
                    ))}
                    {group.logbooks.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Dan {group.logbooks.length - 3} logbook lainnya...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
