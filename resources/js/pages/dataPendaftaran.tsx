import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Select } from '@radix-ui/react-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Pendaftaran',
        href: dashboard().url,
    },
];

export default function DataPendaftaran({ breadcrumbs }: { breadcrumbs?: any }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data Pendaftaran" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Data Pendaftaran</h1>
          <span className="text-gray-500">
            Kelola data pendaftar magang ke Dinas Pendidikan Banyumas
          </span>
        </div>

        {/* Search & Filter */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border flex items-center justify-between p-4">
            <Input
              placeholder="Cari nama pendaftar..."
              className="w-full md:w-2/3"
            />

            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua</SelectItem>
                <SelectItem value="diterima">Diterima</SelectItem>
                <SelectItem value="proses">Proses</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end text-sm text-gray-600 col-span-2 md:col-span-1">
            Menampilkan <span className="mx-1 font-semibold text-gray-900">10</span> dari{" "}
            <span className="mx-1 font-semibold text-gray-900">100</span> data pendaftar
          </div>
        </div>

        {/* Table */}
        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border p-4 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Asal Instansi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>Febri Nur Hidayat</TableCell>
                  <TableCell>Universitas Jenderal Soedirman</TableCell>
                  <TableCell>
                    <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Diterima
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
    );
}
