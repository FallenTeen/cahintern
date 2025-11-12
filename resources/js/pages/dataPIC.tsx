import React, { useState, useEffect, useMemo } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Pencil, Trash } from "lucide-react";

interface PIC {
  nama: string;
  bidang: string;
  jabatan: string;
  email: string;
  telepon: string;
  mahasiswa: number;
}

const dataPIC: PIC[] = [
  {
    nama: "Ibu Hartati",
    bidang: "Sapras",
    jabatan: "Kepala Sapras",
    email: "hartati@pendidikan.go.id",
    telepon: "082112345678",
    mahasiswa: 8,
  },
  {
    nama: "Bapak Supriyanto",
    bidang: "PGTK",
    jabatan: "Koordinator PGTK",
    email: "supriyanto@pendidikan.go.id",
    telepon: "082112345679",
    mahasiswa: 12,
  },
  {
    nama: "Ibu Dewi",
    bidang: "Umum",
    jabatan: "Staf Umum",
    email: "dewi@pendidikan.go.id",
    telepon: "082112345680",
    mahasiswa: 5,
  },
  {
    nama: "Bapak Haryanto",
    bidang: "Kurikulum",
    jabatan: "Kepala Kurikulum",
    email: "haryanto@pendidikan.go.id",
    telepon: "082112345681",
    mahasiswa: 10,
  },
  {
    nama: "Ibu Tri Wahyuni",
    bidang: "GTK",
    jabatan: "Koordinator GTK",
    email: "triwahyuni@pendidikan.go.id",
    telepon: "082112345682",
    mahasiswa: 7,
  },
];

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboard().url },
  { title: "Data PIC" },
];

export default function DataPICPage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBidang, setFilterBidang] = useState("Semua");

  // Deteksi ukuran layar
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter dan pencarian
  const filteredPIC = useMemo(() => {
    return dataPIC.filter((pic) => {
      const matchesSearch =
        pic.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pic.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pic.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBidang =
        filterBidang === "Semua" || pic.bidang === filterBidang;
      return matchesSearch && matchesBidang;
    });
  }, [searchTerm, filterBidang]);

  const bidangList = ["Sapras", "PGTK", "Umum", "Kurikulum", "GTK", "Semua"];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data PIC" />

      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold">Data PIC (Pembimbing Lapangan)</h1>
            <p className="text-sm text-muted-foreground">
              Kelola data pembimbing di setiap bidang magang
            </p>
          </div>
          <Button className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Tambah PIC
          </Button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama, email, atau jabatan..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {bidangList.map((f) => (
              <Button
                key={f}
                variant={filterBidang === f ? "default" : "outline"}
                className={
                  filterBidang === f ? "bg-red-500 hover:bg-red-600 text-white" : ""
                }
                onClick={() => setFilterBidang(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Data Section */}
        {filteredPIC.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Tidak ada data yang cocok dengan pencarian.
          </div>
        ) : isDesktop ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Nama PIC</th>
                  <th className="p-3 text-left">Bidang</th>
                  <th className="p-3 text-left">Jabatan / Posisi</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Nomor Telepon</th>
                  <th className="p-3 text-left">Mahasiswa Dibimbing</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPIC.map((pic, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="p-3">{pic.nama}</td>
                    <td className="p-3">{pic.bidang}</td>
                    <td className="p-3">{pic.jabatan}</td>
                    <td className="p-3">{pic.email}</td>
                    <td className="p-3">{pic.telepon}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{pic.mahasiswa} orang</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPIC.map((pic, i) => (
              <Card key={i} className="shadow-md rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">{pic.nama}</CardTitle>
                  <p className="text-sm text-muted-foreground">{pic.jabatan}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Bidang:</span>
                    <Badge>{pic.bidang}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="truncate text-right">{pic.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Telepon:</span>
                    <span>{pic.telepon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Mahasiswa:</span>
                    <Badge variant="secondary">{pic.mahasiswa} orang</Badge>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" size="icon">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash size={16} />
                    </Button>
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
