import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import AppLayout from "@/layouts/app-layout";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function PengumumanKonten() {
  const [tab, setTab] = useState("pengumuman");
  const [filter, setFilter] = useState("Semua");

  const pengumumanList = [
    {
      title: "Jadwal Rapat Koordinasi Magang",
      content:
        "Rapat koordinasi akan dilaksanakan pada Jumat, 17 Januari 2025 pukul 10:00 WIB di ruang meeting lantai 2.",
      status: "Tayang",
      updatedAt: "15/01/2025",
    },
    {
      title: "Pengumuman Hari Libur Nasional",
      content:
        "Dinas Pendidikan Kabupaten Banyumas akan libur pada 28–30 Januari 2025 sesuai dengan hari libur nasional Tahun Baru Imlek.",
      status: "Tayang",
      updatedAt: "13/01/2025",
    },
    {
      title: "Update Sistem Absensi",
      content:
        "Sistem absensi telah diperbarui dengan fitur baru. Mahasiswa bisa melakukan absensi melalui aplikasi mulai Senin depan.",
      status: "Draft",
      updatedAt: "13/01/2025",
    },
  ];

  const filteredPengumuman =
    filter === "Semua"
      ? pengumumanList
      : pengumumanList.filter((item) => item.status === filter);

  const kontenList = [
    {
      title: "Informasi Slot Magang",
      description: "Edit informasi tentang slot magang yang tersedia",
    },
    {
      title: "Panduan Pendaftaran",
      description: "Edit panduan lengkap untuk proses pendaftaran",
    },
    {
      title: "Informasi Umum Dinas",
      description: "Edit informasi umum tentang Dinas Pendidikan Banyumas",
    },
    {
      title: "Informasi Libur",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    },
  ];

  return (
            <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pendaftaran" />
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Pengumuman & Konten</h2>
          <p className="text-gray-500 text-sm">
            Kelola pengumuman dan konten halaman website
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" /> Buat Pengumuman
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="border-b w-full justify-start bg-transparent p-0">
          <TabsTrigger
            value="pengumuman"
            className={`relative rounded-none px-4 py-2 text-sm font-medium ${
              tab === "pengumuman"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600"
            }`}
          >
            Pengumuman
          </TabsTrigger>
          <TabsTrigger
            value="konten"
            className={`relative rounded-none px-4 py-2 text-sm font-medium ${
              tab === "konten"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600"
            }`}
          >
            Konten Halaman
          </TabsTrigger>
        </TabsList>

        {/* --- Tab: Pengumuman --- */}
        <TabsContent value="pengumuman" className="mt-4 space-y-4">
          {/* Filter Status */}
          <div className="flex flex-wrap gap-2">
            {["Tayang", "Draft", "Semua"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className={
                  filter === status
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "text-gray-700"
                }
              >
                {status}
              </Button>
            ))}
          </div>

          {/* List Pengumuman */}
          <div className="space-y-3">
            {filteredPengumuman.map((item, i) => (
              <Card
                key={i}
                className="border rounded-lg hover:shadow-sm transition"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge
                        className={`text-xs ${
                          item.status === "Tayang"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{item.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Diperbarui: {item.updatedAt}
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-start">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* --- Tab: Konten Halaman --- */}
        <TabsContent value="konten" className="mt-4 space-y-3">
          {kontenList.map((item, i) => (
            <Card key={i} className="border rounded-lg hover:shadow-sm">
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-red-600"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
}
