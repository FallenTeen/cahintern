import AppLayout from "@/layouts/app-layout";
import { dashboard, penilaianDanSertifikat } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
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

type Status = "belum" | "proses" | "terbit";

type PenilaianData = {
  id: number;
  nama_peserta: string;
  bidang_magang: string;
  tanggal_penilaian: string;
  nilai_disiplin: number;
  nilai_kerjasama: number;
  nilai_inisiatif: number;
  nilai_komunikasi: number;
  nilai_teknis: number;
  nilai_kreativitas: number;
  nilai_tanggung_jawab: number;
  nilai_kehadiran: number;
  nilai_total: number;
  predikat: string;
  komentar: string | null;
  status: Status;
};

type Props = {
  penilaianData: {
    data: PenilaianData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboard().url },
  { title: "Penilaian & Sertifikat",href: penilaianDanSertifikat().url},
];

export default function PenilaianSertifikat() {
  const { penilaianData } = usePage<Props>().props;
  const [data] = useState<PenilaianData[]>(penilaianData.data);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "Semua">("Semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      if (statusFilter !== "Semua" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.nama_peserta.toLowerCase().includes(q) ||
        d.bidang_magang.toLowerCase().includes(q)
      );
    });
  }, [data, query, statusFilter]);

  const badgeColor = (status: Status) => {
    switch (status) {
      case "terbit":
        return "bg-green-500 text-white";
      case "proses":
        return "bg-blue-400 text-white";
      case "belum":
        return "bg-gray-300 text-black";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Penilaian & Sertifikat" />
      <div className="p-6 space-y-6">
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
        <Card>
          <CardContent className="p-4 space-y-4">
            <Input
              placeholder="Cari berdasarkan nama atau bidang..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              {["Semua", "belum", "proses", "terbit"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status as Status | "Semua")}
                >
                  {status === "belum" ? "Belum" : status === "proses" ? "Proses" : status === "terbit" ? "Terbit" : status}
                </Button>
              ))}
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground">
              Menampilkan {filtered.length} mahasiswa
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
                  <TableHead>Tanggal Penilaian</TableHead>
                  <TableHead>Nilai Akhir</TableHead>
                  <TableHead>Status Sertifikat</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.nama_peserta}</TableCell>
                    <TableCell>{d.bidang_magang}</TableCell>
                    <TableCell>{d.tanggal_penilaian}</TableCell>
                    <TableCell>{d.nilai_total}</TableCell>
                    <TableCell>
                      <Badge className={badgeColor(d.status)}>{d.status === "belum" ? "Belum" : d.status === "proses" ? "Proses" : d.status === "terbit" ? "Terbit" : d.status}</Badge>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
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
