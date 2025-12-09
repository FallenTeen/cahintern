import AppLayout from '@/layouts/app-layout';
import { dashboard, logbookMahasiswa } from '@/routes';
import { detail as logbookDetail } from '@/routes/logbook';
import { show as showLogbookMahasiswa } from '@/routes/logbook/mahasiswa';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Eye,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Building2,
  CalendarDays,
  BarChart3,
  FileText,
  X,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Status = "pending" | "disetujui" | "ditolak" | "revision";

type LogbookData = {
  id: number;
  tanggal: string;
  tanggal_raw: string;
  kegiatan: string;
  deskripsi: string;
  jam_mulai: string | null;
  jam_selesai: string | null;
  durasi: string;
  status: Status;
  status_label: string;
  status_badge_class: string;
  has_dokumentasi: boolean;
  has_catatan: boolean;
};

type PesertaProfile = {
  id: number;
  nama: string;
  nim_nisn: string;
  asal_instansi: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  status: string;
};

type Statistics = {
  total_entries: number;
  approved_entries: number;
  pending_entries: number;
  rejected_entries: number;
  revision_entries: number;
  total_hours: number;
  approval_rate: number;
};

type WeekGroup = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  logbooks: LogbookData[];
};

type Props = {
  pesertaProfile: PesertaProfile;
  logbooks: {
    data: LogbookData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  statistics: Statistics;
  filters: {
    search: string | null;
    status: string | null;
    bulan: string | null;
    tahun: string | null;
  };
};

export default function ShowLogbookMahasiswa() {
  const { pesertaProfile, logbooks, statistics, filters } = usePage<Props>().props;
  const [query, setQuery] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState<Status | "semua">(filters.status as Status || "semua");
  const [bulanFilter, setBulanFilter] = useState<string | undefined>(filters.bulan || undefined);
  const [tahunFilter, setTahunFilter] = useState(filters.tahun || new Date().getFullYear().toString());
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([0]));
  const [isLoading, setIsLoading] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const isFirstRender = useRef(true);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: dashboard().url },
    { title: "Logbook Mahasiswa", href: logbookMahasiswa().url },
    { title: pesertaProfile.nama },
  ];

  const applyFilter = (newFilters: {
    search?: string;
    status?: string;
    bulan?: string | undefined;
    tahun?: string;
  }) => {
    const params: Record<string, string> = {};

    const finalSearch = newFilters.search !== undefined ? newFilters.search : query;
    const finalStatus = newFilters.status !== undefined ? newFilters.status : statusFilter;
    const finalBulan = newFilters.bulan !== undefined ? newFilters.bulan : bulanFilter;
    const finalTahun = newFilters.tahun !== undefined ? newFilters.tahun : tahunFilter;

    if (finalSearch) params.search = finalSearch;
    if (finalStatus !== "semua") params.status = finalStatus;
    if (finalBulan) params.bulan = finalBulan;
    if (finalTahun) params.tahun = finalTahun;

    setIsLoading(true);
    router.get(showLogbookMahasiswa(pesertaProfile.id).url, params, {
      preserveState: true,
      preserveScroll: true,
      only: ['logbooks', 'statistics', 'filters'],
      onFinish: () => setIsLoading(false),
    });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      applyFilter({ search: query });
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleStatusChange = (status: Status | "semua") => {
    setStatusFilter(status);
    applyFilter({ status });
  };

  const handleBulanChange = (bulan: string | undefined) => {
    setBulanFilter(bulan);
    applyFilter({ bulan });
  };

  const handleTahunChange = (tahun: string) => {
    setTahunFilter(tahun);
    applyFilter({ tahun });
  };

  const handleResetFilter = () => {
    setQuery("");
    setStatusFilter("semua");
    setBulanFilter(undefined);
    setTahunFilter(new Date().getFullYear().toString());

    setIsLoading(true);
    router.get(showLogbookMahasiswa(pesertaProfile.id).url, {}, {
      preserveState: true,
      preserveScroll: true,
      only: ['logbooks', 'statistics', 'filters'],
      onFinish: () => setIsLoading(false),
    });
  };

  const weeklyGroups = useMemo(() => {
    const groups: WeekGroup[] = [];
    const logbooksByWeek: Record<string, LogbookData[]> = {};

    logbooks.data.forEach((logbook) => {
      const date = new Date(logbook.tanggal_raw);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekKey = `${weekStart.toISOString().split('T')[0]}`;

      if (!logbooksByWeek[weekKey]) {
        logbooksByWeek[weekKey] = [];
      }
      logbooksByWeek[weekKey].push(logbook);
    });

    Object.entries(logbooksByWeek).forEach(([weekKey, weekLogbooks], index) => {
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      groups.push({
        weekNumber: index + 1,
        weekStart: weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        weekEnd: weekEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        logbooks: weekLogbooks.sort((a, b) =>
          new Date(b.tanggal_raw).getTime() - new Date(a.tanggal_raw).getTime()
        ),
      });
    });

    return groups.sort((a, b) => b.weekNumber - a.weekNumber);
  }, [logbooks.data]);

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

  const handleViewDetail = (logbookId: number) => {
    router.visit(logbookDetail(logbookId).url);
  };

  const toggleWeek = (weekNumber: number) => {
    setOpenWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const bulanOptions = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const hasActiveFilter = query || statusFilter !== "semua" || bulanFilter !== undefined || tahunFilter !== new Date().getFullYear().toString();

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Logbook ${pesertaProfile.nama}`} />

      <div className="p-6 space-y-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{pesertaProfile.nama}</h1>
                    <p className="text-blue-100">{pesertaProfile.nim_nisn}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <div>
                      <p className="text-blue-100">Asal Instansi</p>
                      <p className="font-medium">{pesertaProfile.asal_instansi}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <div>
                      <p className="text-blue-100">Periode Magang</p>
                      <p className="font-medium">
                        {pesertaProfile.tanggal_mulai} - {pesertaProfile.tanggal_selesai}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Badge className="bg-white text-blue-600 hover:bg-blue-50">
                {pesertaProfile.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <p className="text-2xl font-bold">{statistics.total_entries}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Jam</p>
              </div>
              <p className="text-2xl font-bold">{statistics.total_hours.toFixed(1)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{statistics.pending_entries}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Disetujui</p>
              <p className="text-2xl font-bold text-green-500">{statistics.approved_entries}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Revisi</p>
              <p className="text-2xl font-bold text-orange-500">{statistics.revision_entries}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Approval Rate</p>
              </div>
              <p className="text-2xl font-bold text-blue-500">{statistics.approval_rate}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Input
                  placeholder="Cari kegiatan atau deskripsi..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>

              <div className="relative">
                <Select
                  value={bulanFilter}
                  onValueChange={handleBulanChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {bulanOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bulanFilter && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBulanChange(undefined);
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <Select
                value={tahunFilter}
                onValueChange={handleTahunChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {["semua", "pending", "disetujui", "revision", "ditolak"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(status as Status | "semua")}
                  disabled={isLoading}
                >
                  {status === "semua" ? "Semua" :
                   status === "pending" ? "Pending" :
                   status === "disetujui" ? "Disetujui" :
                   status === "revision" ? "Revisi" : "Ditolak"}
                  {status !== "semua" && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                      {status === "pending" ? statistics.pending_entries :
                       status === "disetujui" ? statistics.approved_entries :
                       status === "revision" ? statistics.revision_entries :
                       statistics.rejected_entries}
                    </span>
                  )}
                </Button>
              ))}

              {hasActiveFilter && (
                <Button
                  onClick={handleResetFilter}
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset Filter
                </Button>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan {logbooks.data.length} logbook dalam {weeklyGroups.length} minggu
                {isLoading && <span className="ml-2 text-blue-500">(memuat...)</span>}
              </p>

              {hasActiveFilter && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {query && (
                    <Badge variant="secondary">
                      Pencarian: "{query}"
                    </Badge>
                  )}
                  {bulanFilter && (
                    <Badge variant="secondary">
                      Bulan: {bulanOptions.find(b => b.value === bulanFilter)?.label}
                    </Badge>
                  )}
                  {tahunFilter && tahunFilter !== new Date().getFullYear().toString() && (
                    <Badge variant="secondary">
                      Tahun: {tahunFilter}
                    </Badge>
                  )}
                  {statusFilter !== "semua" && (
                    <Badge variant="secondary">
                      Status: {statusFilter === "pending" ? "Pending" :
                       statusFilter === "disetujui" ? "Disetujui" :
                       statusFilter === "revision" ? "Revisi" : "Ditolak"}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-sm font-medium">Memuat data...</span>
              </div>
            </div>
          )}

          {weeklyGroups.map((week) => (
            <Card key={week.weekNumber}>
              <Collapsible
                open={openWeeks.has(week.weekNumber)}
                onOpenChange={() => toggleWeek(week.weekNumber)}
              >
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {openWeeks.has(week.weekNumber) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div className="text-left">
                          <CardTitle className="text-lg">
                            Minggu {week.weekNumber}
                          </CardTitle>
                          <CardDescription>
                            {week.weekStart} - {week.weekEnd} • {week.logbooks.length} logbook
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {week.logbooks.filter(l => l.status === 'pending').length} Pending
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {week.logbooks.filter(l => l.status === 'disetujui').length} Disetujui
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-3">
                    {week.logbooks.map((logbook) => (
                      <div
                        key={logbook.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-card"
                        onClick={() => handleViewDetail(logbook.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{logbook.tanggal}</span>
                              <Badge className={badgeColor(logbook.status)}>
                                {logbook.status_label}
                              </Badge>
                            </div>

                            <h4 className="font-semibold text-base">{logbook.kegiatan}</h4>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {logbook.deskripsi}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{logbook.jam_mulai} - {logbook.jam_selesai}</span>
                              </div>
                              <span>•</span>
                              <span className="font-medium">{logbook.durasi}</span>
                              {logbook.has_dokumentasi && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    Ada Dokumentasi
                                  </Badge>
                                </>
                              )}
                              {logbook.has_catatan && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    Ada Catatan
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>

                          <Button variant="ghost" size="icon">
                            <Eye className="w-5 h-5 text-blue-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {weeklyGroups.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada logbook</h3>
              <p className="text-muted-foreground mb-4">
                Belum ada logbook yang diinputkan untuk filter yang dipilih.
              </p>
              {hasActiveFilter && (
                <Button onClick={handleResetFilter} variant="outline">
                  Reset Filter
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
