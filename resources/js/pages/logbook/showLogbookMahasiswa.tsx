import AppLayout from '@/layouts/app-layout';
import { dashboard, logbookMahasiswa } from '@/routes';
// import { detail as logbookDetail } from '@/routes/logbook';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { show as showLogbookMahasiswa } from '@/routes/logbook/mahasiswa';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    Calendar,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    Loader2,
    User,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Status = 'pending' | 'disetujui' | 'ditolak' | 'revision';

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
    const { pesertaProfile, logbooks, statistics, filters } =
        usePage<Props>().props;
    const [query, setQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<Status | 'semua'>(
        (filters.status as Status) || 'semua',
    );
    const [bulanFilter, setBulanFilter] = useState<string | undefined>(
        filters.bulan || undefined,
    );
    const [tahunFilter, setTahunFilter] = useState(
        filters.tahun || new Date().getFullYear().toString(),
    );
    const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([0]));
    const [isLoading, setIsLoading] = useState(false);

    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const isFirstRender = useRef(true);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Logbook Mahasiswa', href: logbookMahasiswa().url },
        { title: pesertaProfile.nama },
    ];

    const applyFilter = (newFilters: {
        search?: string;
        status?: string;
        bulan?: string | undefined;
        tahun?: string;
    }) => {
        const params: Record<string, string> = {};

        const finalSearch =
            newFilters.search !== undefined ? newFilters.search : query;
        const finalStatus =
            newFilters.status !== undefined ? newFilters.status : statusFilter;
        const finalBulan =
            newFilters.bulan !== undefined ? newFilters.bulan : bulanFilter;
        const finalTahun =
            newFilters.tahun !== undefined ? newFilters.tahun : tahunFilter;

        if (finalSearch) params.search = finalSearch;
        if (finalStatus !== 'semua') params.status = finalStatus;
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

    const handleStatusChange = (status: Status | 'semua') => {
        setStatusFilter(status);
        applyFilter({ status });
    };

    const handleBulanChange = (bulan: string) => {
        setBulanFilter(bulan || '');
        applyFilter({ bulan: bulan || '' });
    };

    const handleTahunChange = (tahun: string) => {
        setTahunFilter(tahun);
        applyFilter({ tahun });
    };

    const handleResetFilter = () => {
        setQuery('');
        setStatusFilter('semua');
        setBulanFilter(undefined);
        setTahunFilter(new Date().getFullYear().toString());

        setIsLoading(true);
        router.get(
            showLogbookMahasiswa(pesertaProfile.id).url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['logbooks', 'statistics', 'filters'],
                onFinish: () => setIsLoading(false),
            },
        );
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

        Object.entries(logbooksByWeek).forEach(
            ([weekKey, weekLogbooks], index) => {
                const weekStart = new Date(weekKey);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);

                groups.push({
                    weekNumber: index + 1,
                    weekStart: weekStart.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                    }),
                    weekEnd: weekEnd.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    }),
                    logbooks: weekLogbooks.sort(
                        (a, b) =>
                            new Date(b.tanggal_raw).getTime() -
                            new Date(a.tanggal_raw).getTime(),
                    ),
                });
            },
        );

        return groups.sort((a, b) => b.weekNumber - a.weekNumber);
    }, [logbooks.data]);

    const badgeColor = (status: Status) => {
        switch (status) {
            case 'disetujui':
                return 'bg-green-500 text-white hover:bg-green-600';
            case 'pending':
                return 'bg-yellow-500 text-white hover:bg-yellow-600';
            case 'revision':
                return 'bg-orange-500 text-white hover:bg-orange-600';
            case 'ditolak':
                return 'bg-red-500 text-white hover:bg-red-600';
            default:
                return 'bg-gray-300 text-black';
        }
    };

    const handleViewDetail = (logbookId: number) => {
        router.visit(logbookDetail(logbookId).url);
    };

    const toggleWeek = (weekNumber: number) => {
        setOpenWeeks((prev) => {
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
        { value: '1', label: 'Januari' },
        { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' },
        { value: '4', label: 'April' },
        { value: '5', label: 'Mei' },
        { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' },
        { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' },
    ];

    const statusTab = [
        { value: 'semua', label: 'Semua' },
        {
            value: 'pending',
            label: 'Pending',
            count: statistics.pending_entries,
        },
        {
            value: 'disetujui',
            label: 'Disetujui',
            count: statistics.approved_entries,
        },
        {
            value: 'revision',
            label: 'Revisi',
            count: statistics.revision_entries,
        },
        {
            value: 'ditolak',
            label: 'Ditolak',
            count: statistics.rejected_entries,
        },
    ];

    const hasActiveFilter =
        query ||
        statusFilter !== 'semua' ||
        bulanFilter !== undefined ||
        tahunFilter !== new Date().getFullYear().toString();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Logbook ${pesertaProfile.nama}`} />

            <div className="space-y-6 p-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-white/20 p-3">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">
                                            {pesertaProfile.nama}
                                        </h1>
                                        <p className="text-blue-100">
                                            {pesertaProfile.nim_nisn}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 px-15 text-sm md:grid-cols-3">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <div className="flex inline-flex gap-1">
                                                <Building2 className="h-4 w-4" />
                                                <p className="text-blue-100">
                                                    Asal Instansi
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                {pesertaProfile.asal_instansi}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <div className="flex inline-flex gap-1">
                                                <CalendarDays className="h-4 w-4" />
                                                <p className="text-blue-100">
                                                    Periode Magang
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                {pesertaProfile.tanggal_mulai} -{' '}
                                                {pesertaProfile.tanggal_selesai}
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

                <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                    Total
                                </p>
                            </div>
                            <p className="text-2xl font-bold">
                                {statistics.total_entries}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                    Total Jam
                                </p>
                            </div>
                            <p className="text-2xl font-bold">
                                {statistics.total_hours.toFixed(1)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="mb-2 text-xs text-muted-foreground">
                                Pending
                            </p>
                            <p className="text-2xl font-bold text-yellow-500">
                                {statistics.pending_entries}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="mb-2 text-xs text-muted-foreground">
                                Disetujui
                            </p>
                            <p className="text-2xl font-bold text-green-500">
                                {statistics.approved_entries}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="mb-2 text-xs text-muted-foreground">
                                Revisi
                            </p>
                            <p className="text-2xl font-bold text-orange-500">
                                {statistics.revision_entries}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                    Approval Rate
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-blue-500">
                                {statistics.approval_rate}%
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="space-y-4 p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Input
                                    placeholder="Cari kegiatan atau deskripsi..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                {isLoading && (
                                    <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
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
                                        {bulanOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {bulanFilter && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1/2 right-8 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
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
                                    {[2023, 2024, 2025, 2026].map((year) => (
                                        <SelectItem
                                            key={year}
                                            value={year.toString()}
                                        >
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Tabs
                                value={statusFilter}
                                onValueChange={(value) =>
                                    handleStatusChange(
                                        value as Status | 'semua',
                                    )
                                }
                            >
                                <TabsList>
                                    {statusTab.map((tab) => (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            disabled={isLoading}
                                        >
                                            {tab.label}

                                            {tab.count !== undefined && (
                                                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                                                    {tab.count}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>

                            {hasActiveFilter && (
                                <Button
                                    onClick={handleResetFilter}
                                    size="sm"
                                    variant="outline"
                                    disabled={isLoading}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {logbooks.data.length} logbook dalam{' '}
                                {weeklyGroups.length} minggu
                                {isLoading && (
                                    <span className="ml-2 text-blue-500">
                                        (memuat...)
                                    </span>
                                )}
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
                                            Bulan:{' '}
                                            {
                                                bulanOptions.find(
                                                    (b) =>
                                                        b.value === bulanFilter,
                                                )?.label
                                            }
                                        </Badge>
                                    )}
                                    {tahunFilter &&
                                        tahunFilter !==
                                            new Date()
                                                .getFullYear()
                                                .toString() && (
                                            <Badge variant="secondary">
                                                Tahun: {tahunFilter}
                                            </Badge>
                                        )}
                                    {statusFilter !== 'semua' && (
                                        <Badge variant="secondary">
                                            Status:{' '}
                                            {statusFilter === 'pending'
                                                ? 'Pending'
                                                : statusFilter === 'disetujui'
                                                  ? 'Disetujui'
                                                  : statusFilter === 'revision'
                                                    ? 'Revisi'
                                                    : 'Ditolak'}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="relative space-y-4">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                <span className="text-sm font-medium">
                                    Memuat data...
                                </span>
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
                                    <CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {openWeeks.has(
                                                    week.weekNumber,
                                                ) ? (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                )}
                                                <div className="text-left">
                                                    <CardTitle className="text-lg">
                                                        Minggu {week.weekNumber}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {week.weekStart} -{' '}
                                                        {week.weekEnd} •{' '}
                                                        {week.logbooks.length}{' '}
                                                        logbook
                                                    </CardDescription>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="border-yellow-200 bg-yellow-50 text-yellow-700"
                                                >
                                                    {
                                                        week.logbooks.filter(
                                                            (l) =>
                                                                l.status ===
                                                                'pending',
                                                        ).length
                                                    }{' '}
                                                    Pending
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="border-green-200 bg-green-50 text-green-700"
                                                >
                                                    {
                                                        week.logbooks.filter(
                                                            (l) =>
                                                                l.status ===
                                                                'disetujui',
                                                        ).length
                                                    }{' '}
                                                    Disetujui
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="space-y-3 pt-0">
                                        {week.logbooks.map((logbook) => (
                                            <div
                                                key={logbook.id}
                                                className="cursor-pointer rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                                                onClick={() =>
                                                    router.visit(
                                                        `/logbook/detail/${logbook.id}`,
                                                    )
                                                }
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm font-medium">
                                                                {
                                                                    logbook.tanggal
                                                                }
                                                            </span>
                                                            <Badge
                                                                className={badgeColor(
                                                                    logbook.status,
                                                                )}
                                                            >
                                                                {
                                                                    logbook.status_label
                                                                }
                                                            </Badge>
                                                        </div>

                                                        <h4 className="text-base font-semibold">
                                                            {logbook.kegiatan}
                                                        </h4>

                                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                                            {logbook.deskripsi}
                                                        </p>

                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4" />
                                                                <span>
                                                                    {
                                                                        logbook.jam_mulai
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        logbook.jam_selesai
                                                                    }
                                                                </span>
                                                            </div>
                                                            <span>•</span>
                                                            <span className="font-medium">
                                                                {logbook.durasi}
                                                            </span>
                                                            {logbook.has_dokumentasi && (
                                                                <>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        Ada
                                                                        Dokumentasi
                                                                    </Badge>
                                                                </>
                                                            )}
                                                            {logbook.has_catatan && (
                                                                <>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        Ada
                                                                        Catatan
                                                                    </Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <Eye className="h-5 w-5 text-blue-500" />
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
                            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">
                                Tidak ada logbook
                            </h3>
                            <p className="mb-4 text-muted-foreground">
                                Belum ada logbook yang diinputkan untuk filter
                                yang dipilih.
                            </p>
                            {hasActiveFilter && (
                                <Button
                                    onClick={handleResetFilter}
                                    variant="outline"
                                >
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
