import AppLayout from "@/layouts/app-layout";
import { dashboard, penilaianDanSertifikat } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Status = "Belum" | "Proses" | "Terbit";

type Mahasiswa = {
  id: number;
  nama: string;
  bidang: string;
  lamaMagang: string;
  nilaiAkhir: string;
  status: Status;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboard().url },
  { title: "Penilaian & Sertifikat",href: penilaianDanSertifikat().url},
];

const data: Mahasiswa[] = [
  { id: 1, nama: "Budi Santoso", bidang: "Sapras", lamaMagang: "2 bulan", nilaiAkhir: "85", status: "Terbit" },
  { id: 2, nama: "Siti Nurhaliza", bidang: "PGTK", lamaMagang: "3 bulan", nilaiAkhir: "90", status: "Terbit" },
  { id: 3, nama: "Ahmad Hidayat", bidang: "Umum", lamaMagang: "2 bulan", nilaiAkhir: "78", status: "Proses" },
  { id: 4, nama: "Rina Putri", bidang: "Kurikulum", lamaMagang: "3 bulan", nilaiAkhir: "-", status: "Belum" },
  { id: 5, nama: "Yudi Hermawan", bidang: "GTK", lamaMagang: "2 bulan", nilaiAkhir: "88", status: "Terbit" },
];

export default function PenilaianSertifikat() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "Semua">("Semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      if (statusFilter !== "Semua" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.nama.toLowerCase().includes(q) ||
        d.bidang.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter]);

  const badgeColor = (status: Status) => {
    switch (status) {
      case "Terbit":
        return "bg-green-500 text-white";
      case "Proses":
        return "bg-blue-400 text-white";
      case "Belum":
        return "bg-gray-300 text-black";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Penilaian & Sertifikat" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Penilaian & Sertifikat</h1>
            <p className="text-muted-foreground">
              Kelola penilaian mahasiswa dan penerbitan sertifikat
            </p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            + Generate Sertifikat
          </Button>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Mahasiswa Selesai</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-gray-700">5</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sertifikat Terbit</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-green-500">3</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rata-Rata Nilai</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-blue-600">85</CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Input
              placeholder="Cari berdasarkan nama atau bidang..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              {["Semua", "Belum", "Proses", "Terbit"].map((status) => (
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
              Menampilkan {filtered.length} mahasiswa
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
                  <TableHead>Lama Magang</TableHead>
                  <TableHead>Nilai Akhir</TableHead>
                  <TableHead>Status Sertifikat</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.nama}</TableCell>
                    <TableCell>{d.bidang}</TableCell>
                    <TableCell>{d.lamaMagang}</TableCell>
                    <TableCell>{d.nilaiAkhir}</TableCell>
                    <TableCell>
                      <Badge className={badgeColor(d.status)}>{d.status}</Badge>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      {/* Edit Icon */}
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-orange-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.651 1.651a1.5 1.5 0 010 2.122l-9.193 9.193-3.764.418a.375.375 0 01-.414-.414l.418-3.764 9.193-9.193a1.5 1.5 0 012.122 0z"
                          />
                        </svg>
                      </Button>

                      {/* Download Icon */}
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-blue-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
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
