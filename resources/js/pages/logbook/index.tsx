import AppLayout from '@/layouts/app-layout';
import { dashboard, logbookMahasiswa } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
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
import { Clock } from 'lucide-react';
type Status = "pending" | "disetujui" | "revision";

type LogbookData = {
  id: number;
  nama_peserta: string;
  bidang_magang: string;
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      if (statusFilter !== "Semua" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.nama_peserta.toLowerCase().includes(q) ||
        d.bidang_magang.toLowerCase().includes(q) ||
        d.kegiatan.toLowerCase().includes(q)
      );
    });
  }, [data, query, statusFilter]);

  const badgeColor = (status: Status) => {
    switch (status) {
      case "disetujui":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-400 text-black";
      case "revision":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Menunggu Validasi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-orange-500">
              {data.filter(d => d.status === 'pending').length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sudah Divalidasi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-green-500">
              {data.filter(d => d.status === 'disetujui').length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Diminta Revisi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-red-500">
              {data.filter(d => d.status === 'revision').length}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-4 space-y-4">
            <Input
              placeholder="Cari logbook (nama, bidang, atau judul kegiatan)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              {["Semua", "pending", "disetujui", "revision"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status as Status | "Semua")}
                >
                  {status === "pending" ? "Menunggu" : status === "disetujui" ? "Valid" : status === "revision" ? "Revisi" : status}
                </Button>
              ))}
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground">
              Menampilkan {filtered.length} logbook
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Mahasiswa</TableHead>
                  <TableHead>Bidang</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Judul Logbook</TableHead>
                  <TableHead>Status Validasi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.nama_peserta}</TableCell>
                    <TableCell>{d.bidang_magang}</TableCell>
                    <TableCell>{d.tanggal}</TableCell>
                    <TableCell>{d.durasi}</TableCell>
                    <TableCell>{d.kegiatan}</TableCell>
                    <TableCell>
                      <Badge className={badgeColor(d.status)}>{d.status_label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-blue-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
