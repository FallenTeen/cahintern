import AppLayout from '@/layouts/app-layout';
import { dashboard, logbookMahasiswa } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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

type Status = "Menunggu" | "Valid" | "Revisi";

type Logbook = {
  id: number;
  nama: string;
  bidang: string;
  tanggal: string;
  waktu: string;
  judul: string;
  status: Status;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboard().url },
  { title: "Logbook Mahasiswa", href: logbookMahasiswa().url},
];

const data: Logbook[] = [
  { id: 1, nama: "Budi Santoso", bidang: "Sapras", tanggal: "16/01/2025", waktu: "08:00", judul: "Inventaris barang di gudang sapras", status: "Menunggu" },
  { id: 2, nama: "Siti Nurhaliza", bidang: "PGTK", tanggal: "16/01/2025", waktu: "09:15", judul: "Membantu persiapan pembelajaran di kelas 1A", status: "Menunggu" },
  { id: 3, nama: "Ahmad Hidayat", bidang: "Umum", tanggal: "16/01/2025", waktu: "10:30", judul: "Verifikasi dokumen administrasi", status: "Valid" },
  { id: 4, nama: "Yudi Hermawan", bidang: "GTK", tanggal: "15/01/2025", waktu: "14:00", judul: "Koordinasi dengan guru kelas V", status: "Revisi" },
  { id: 5, nama: "Budi Santoso", bidang: "Sapras", tanggal: "15/01/2025", waktu: "13:45", judul: "Perawatan mesin fotokopi", status: "Menunggu" },
];

export default function LogbookMahasiswa() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "Semua">("Semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      if (statusFilter !== "Semua" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.nama.toLowerCase().includes(q) ||
        d.bidang.toLowerCase().includes(q) ||
        d.judul.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter]);

  const badgeColor = (status: Status) => {
    switch (status) {
      case "Valid":
        return "bg-green-500 text-white";
      case "Menunggu":
        return "bg-yellow-400 text-black";
      case "Revisi":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Logbook Mahasiswa" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Logbook Mahasiswa</h1>
          <p className="text-muted-foreground">
            Lihat dan validasi logbook harian mahasiswa
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Menunggu Validasi
                <span className="text-orange-500">🕒</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-orange-500">
              8
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sudah Divalidasi
                <span className="text-green-500">✅</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-green-500">
              142
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Diminta Revisi
                <span className="text-red-500">❌</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-red-500">
              3
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Input
              placeholder="Cari logbook (nama, bidang, atau judul kegiatan)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              {["Semua", "Menunggu", "Valid", "Revisi"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status as Status | "Semua")}
                >
                  {status}
                </Button>
              ))}
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground">
              Menampilkan {filtered.length} logbook
            </p>
          </CardContent>
        </Card>

        {/* Table Section */}
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
                    <TableCell>{d.nama}</TableCell>
                    <TableCell>{d.bidang}</TableCell>
                    <TableCell>{d.tanggal}</TableCell>
                    <TableCell>{d.waktu}</TableCell>
                    <TableCell>{d.judul}</TableCell>
                    <TableCell>
                      <Badge className={badgeColor(d.status)}>{d.status}</Badge>
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
