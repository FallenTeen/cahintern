import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { penilaianDanSertifikat } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

type Status = 'belum' | 'proses' | 'terbit';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

type PenilaianData = {
    id: number;
    nama_peserta: string;
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

type Row = {
    id: number;
    nama_peserta: string;
    tanggal: string;
    status: Status;
    file_path: string | null;
    approval_status?: ApprovalStatus;
    nilai_total?: number;
};

type Props = {
    penilaianData: {
        data: PenilaianData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    viewMode?: 'certificate' | 'penilaian';
    sertifikatData?: {
        data: Array<{
            id: number;
            nama_peserta: string;
            tanggal_terbit: string;
            nomor_sertifikat: string | null;
            file_path: string | null;
            status: Status;
            approval_status: ApprovalStatus;
            can_approve?: boolean;
            can_download?: boolean;
        }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penilaian & Sertifikat', href: penilaianDanSertifikat().url },
];

type PageProps = SharedData & Props;

export default function PenilaianSertifikat() {
    const props = usePage<PageProps>().props;
    const isCertificateView = Boolean(props.sertifikatData) || props.viewMode === 'certificate';
    const [selected, setSelected] = useState<number[]>([]);
    const [page1Template, setPage1Template] = useState<File | null>(null);
    const [page2Template, setPage2Template] = useState<File | null>(null);
    const [templateName, setTemplateName] = useState<string>('');
    const prefix =
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/pic')
            ? '/pic'
            : '/admin';

            
    // Confirmation dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
    const [pendingGenerateIds, setPendingGenerateIds] = useState<number[]>([]);
    const [pendingGenerateType, setPendingGenerateType] = useState<'individual' | 'batch'>('individual');

    const { flash } = props;
    const [showFlash, setShowFlash] = useState(false);
    const [flashMessage, setFlashMessage] = useState('');
    const [flashType, setFlashType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setFlashMessage(flash.success || flash.error);
            setFlashType(flash.success ? 'success' : 'error');
            setShowFlash(true);
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                setShowFlash(false);
            }, 5000);
        }
    }, [flash]);

    const rows: Row[] = useMemo(() => {
        if (isCertificateView) {
            return props.sertifikatData!.data.map((s) => ({
                id: s.id,
                nama_peserta: s.nama_peserta,
                tanggal: s.tanggal_terbit,
                status: s.status,
                file_path: s.file_path,
                approval_status: s.approval_status,
            }));
        }
        return props.penilaianData.data.map((p) => ({
            id: p.id,
            nama_peserta: p.nama_peserta,
            tanggal: p.tanggal_penilaian,
            status: p.status,
            file_path: null,
            nilai_total: p.nilai_total,
        }));
    }, [props, isCertificateView]);

    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'Semua'>('Semua');

    const uploadTemplate = () => {
        if (!page1Template && !page2Template) {
            window.alert('Pilih minimal satu file template terlebih dahulu');
            return;
        }
        if (!templateName.trim()) {
            window.alert('Masukkan nama template terlebih dahulu');
            return;
        }
        const fd = new FormData();
        if (page1Template) {
            fd.append('page1_template', page1Template);
        }
        if (page2Template) {
            fd.append('page2_template', page2Template);
        }
        fd.append('template_name', templateName.trim());
        router.post(`${prefix}/sertifikat/template`, fd, {
            forceFormData: true,
            onSuccess: () => {
                setTemplateName('');
                setPage1Template(null);
                setPage2Template(null);
            },
        });
    };

    const generateIndividual = (penilaianId: number, forceGenerate = false) => {
        router.post(
            `${prefix}/penilaian/${penilaianId}/generate-sertifikat`,
            {
                force_generate: forceGenerate,
            },
            {
                onError: (errors: Record<string, string>) => {
                    const message =
                        errors.requires_confirmation ||
                        errors.logbook ||
                        errors.error;

                    if (message) {
                        setConfirmMessage(message);
                        setPendingGenerateIds([penilaianId]);
                        setPendingGenerateType('individual');
                        setConfirmAction(
                            () => () => generateIndividual(penilaianId, true),
                        );
                        setShowConfirmDialog(true);
                    }
                },
            },
        );
    };

    const batchGenerate = (forceGenerate = false) => {
        if (selected.length === 0) {
            window.alert('Pilih minimal satu sertifikat untuk digenerate');
            return;
        }
        
        router.post(
            `${prefix}/sertifikat/batch-generate`,
            {
                sertifikat_ids: selected,
                force_generate: forceGenerate,
            },
            {
                onSuccess: () => {
                    setSelected([]);
                },
                onError: (errors: Record<string, string>) => {
                    const message =
                        errors.requires_confirmation ||
                        errors.logbook ||
                        errors.error;

                    if (message) {
                        setConfirmMessage(message);
                        setPendingGenerateIds(selected);
                        setPendingGenerateType('batch');
                        setConfirmAction(() => () => batchGenerate(true));
                        setShowConfirmDialog(true);
                    }
                },
            },
        );
    };
    const batchApprove = (action: 'approve' | 'reject') => {
        if (selected.length === 0) {
            window.alert('Pilih minimal satu sertifikat untuk di' + (action === 'approve' ? 'setujui' : 'tolak'));
            return;
        }
        
        const confirmMessage = action === 'approve' 
            ? 'Apakah Anda yakin ingin menyetujui sertifikat yang dipilih?' 
            : 'Apakah Anda yakin ingin menolak sertifikat yang dipilih?';
        
        if (!window.confirm(confirmMessage)) {
            return;
        }
        
        router.post(`${prefix}/sertifikat/batch-approve`, {
            sertifikat_ids: selected,
            action: action,
        }, {
            onSuccess: () => {
                // Flash message akan ditampilkan otomatis
                setSelected([]);
            },
        });
    };

    const approveCertificate = (sertifikatId: number, action: 'approve' | 'reject') => {
        const confirmMessage = action === 'approve' 
            ? 'Apakah Anda yakin ingin menyetujui sertifikat ini?' 
            : 'Apakah Anda yakin ingin menolak sertifikat ini?';
        
        if (!window.confirm(confirmMessage)) {
            return;
        }
        
        router.post(`${prefix}/sertifikat/${sertifikatId}/approve`, {
            action: action,
        }, {
            onSuccess: () => {
                // Flash message akan ditampilkan otomatis oleh component
                // Tidak perlu alert lagi
            },
        });
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rows.filter((d) => {
            if (statusFilter !== 'Semua' && d.status !== statusFilter)
                return false;
            if (!q) return true;
            return d.nama_peserta.toLowerCase().includes(q) || false;
        });
    }, [rows, query, statusFilter]);

    const getStatusBadgeClass = (status: Status): string => {
        switch (status) {
            case 'terbit':
                return 'bg-green-500 text-white';
            case 'proses':
                return 'bg-blue-400 text-white';
            case 'belum':
                return 'bg-gray-300 text-black';
            default:
                return 'bg-gray-300 text-black';
        }
    };

    const getApprovalBadgeClass = (status: ApprovalStatus): string => {
        switch (status) {
            case 'approved':
                return 'bg-green-500 text-white';
            case 'rejected':
                return 'bg-red-500 text-white';
            case 'pending':
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-gray-300 text-black';
        }
    };

    const getApprovalBadgeText = (status: ApprovalStatus): string => {
        switch (status) {
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            case 'pending':
                return 'Menunggu';
            default:
                return 'Unknown';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penilaian & Sertifikat" />
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Generate Sertifikat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                            {confirmMessage ||
                                'Logbook &lt;80%, apakah tetap generate sertifikat?'}
                        </p>
                        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                            {pendingGenerateType === 'individual'
                                ? 'Sertifikat akan digenerate untuk 1 peserta ini meskipun logbook belum mencapai 80%.'
                                : `Sertifikat akan digenerate untuk ${pendingGenerateIds.length} peserta terpilih meskipun ada yang logbook-nya belum mencapai 80%.`}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                                const action = confirmAction;
                                setShowConfirmDialog(false);
                                action();
                            }}
                        >
                            Tetap Generate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Flash Messages */}
            {showFlash && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                    flashType === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                }`}>
                    <div className="flex items-center justify-between">
                        <span>{flashMessage}</span>
                        <button
                            onClick={() => setShowFlash(false)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Penilaian & Sertifikat
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola penilaian mahasiswa dan penerbitan sertifikat
                        </p>
                    </div>
                    {isCertificateView ? (
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                disabled={selected.length === 0}
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            'Logbook peserta mungkin belum mencapai 80%. Apakah Anda yakin ingin meregenerasi sertifikat untuk peserta yang dipilih?',
                                        )
                                    ) {
                                        selected.forEach((id) =>
                                            router.post(
                                                `${prefix}/sertifikat/${id}/regenerate`,
                                            ),
                                        );
                                    }
                                }}
                            >
                                Regenerate Batch
                            </Button>
                            <Button
                                variant="default"
                                className="bg-purple-600 text-white hover:bg-purple-700"
                                disabled={selected.length === 0}
                                onClick={() => batchGenerate()}
                            >
                                Generate Batch
                            </Button>
                            <Button
                                variant="default"
                                className="bg-green-600 text-white hover:bg-green-700"
                                disabled={selected.length === 0}
                                onClick={() => {
                                    selected.forEach((id) =>
                                        router.post(
                                            `${prefix}/sertifikat/${id}/validate`,
                                        ),
                                    );
                                }}
                            >
                                Publish Batch
                            </Button>
                            <Button
                                variant="default"
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                disabled={selected.length === 0}
                                onClick={() => batchApprove('approve')}
                            >
                                Approve Batch
                            </Button>
                            <Button
                                variant="default"
                                className="bg-red-600 text-white hover:bg-red-700"
                                disabled={selected.length === 0}
                                onClick={() => batchApprove('reject')}
                            >
                                Reject Batch
                            </Button>
                            <Button
                                variant="default"
                                className="bg-gray-700 text-white hover:bg-gray-800"
                                disabled={selected.length === 0}
                                onClick={() => {
                                    const generatedSertifikats = props.sertifikatData?.data.filter(
                                        s => selected.includes(s.id) && s.file_path
                                    ) || [];
                                    generatedSertifikats.forEach((s) =>
                                        window.open(
                                            `${prefix}/sertifikat/${s.id}/download`,
                                            '_blank',
                                        ),
                                    );
                                }}
                            >
                                Download Batch
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                                filtered.forEach((d) =>
                                    generateIndividual(d.id),
                                );
                            }}
                        >
                            + Generate Sertifikat
                        </Button>
                    )}
                </div>
                {prefix === '/admin' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Sertifikat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Unggah template sertifikat halaman 1 dan 2 dalam
                                format PNG. Template ini akan digunakan untuk
                                semua sertifikat yang digenerate.
                            </p>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Nama Template
                                </p>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama template"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Template Halaman 1
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/png"
                                        onChange={(e) =>
                                            setPage1Template(
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Template Halaman 2
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/png"
                                        onChange={(e) =>
                                            setPage2Template(
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={uploadTemplate}
                                >
                                    Simpan Template
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        window.open(
                                            `${prefix}/sertifikat/template/preview`,
                                            '_blank',
                                        )
                                    }
                                >
                                    Preview Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Mahasiswa Selesai</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-gray-700">
                            5
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sertifikat Terbit</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-green-500">
                            3
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Rata-Rata Nilai</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-blue-600">
                            85
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardContent className="space-y-4 p-4">
                        <Input
                            placeholder="Cari berdasarkan nama..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />

                        <div className="flex flex-wrap gap-2">
                            {['Semua', 'belum', 'proses', 'terbit'].map(
                                (status) => (
                                    <Button
                                        key={status}
                                        variant={
                                            statusFilter === status
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setStatusFilter(
                                                status as Status | 'Semua',
                                            )
                                        }
                                    >
                                        {status === 'belum'
                                            ? 'Belum'
                                            : status === 'proses'
                                              ? 'Proses'
                                              : status === 'terbit'
                                                ? 'Terbit'
                                                : status}
                                    </Button>
                                ),
                            )}
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
                                    {isCertificateView && (
                                        <TableHead>
                                            <Checkbox
                                                checked={
                                                    selected.length ===
                                                        filtered.length &&
                                                    filtered.length > 0
                                                }
                                                onCheckedChange={(checked) => {
                                                    if (checked)
                                                        setSelected(
                                                            filtered.map(
                                                                (d) => d.id,
                                                            ),
                                                        );
                                                    else setSelected([]);
                                                }}
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead>Nama Mahasiswa</TableHead>

                                    <TableHead>
                                        {isCertificateView
                                            ? 'Tanggal Terbit'
                                            : 'Tanggal Penilaian'}
                                    </TableHead>
                                    <TableHead>Nilai Akhir</TableHead>
                                    <TableHead>Status Sertifikat</TableHead>
                                    {isCertificateView && (
                                        <TableHead>Status Approval</TableHead>
                                    )}
                                    <TableHead className="text-center">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((d) => (
                                    <TableRow key={d.id}>
                                        {isCertificateView && (
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.includes(
                                                        d.id,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
                                                        setSelected((prev) =>
                                                            checked
                                                                ? [
                                                                      ...prev,
                                                                      d.id,
                                                                  ]
                                                                : prev.filter(
                                                                      (x) =>
                                                                          x !==
                                                                          d.id,
                                                                  ),
                                                        );
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>{d.nama_peserta}</TableCell>

                                        <TableCell>{d.tanggal}</TableCell>
                                        <TableCell>
                                            {d.nilai_total ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getStatusBadgeClass(d.status)}
                                            >
                                                {d.status === 'belum'
                                                    ? 'Belum'
                                                    : d.status === 'proses'
                                                      ? 'Proses'
                                                      : d.status === 'terbit'
                                                        ? 'Terbit'
                                                        : d.status}
                                            </Badge>
                                        </TableCell>
                                        {isCertificateView && (
                                            <TableCell>
                                                <Badge
                                                    className={getApprovalBadgeClass(d.approval_status || 'pending')}
                                                >
                                                    {getApprovalBadgeText(d.approval_status || 'pending')}
                                                </Badge>
                                            </TableCell>
                                        )}
                                        <TableCell className="flex justify-center gap-2">
                                            {isCertificateView ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    'Logbook peserta ini mungkin belum mencapai 80%. Apakah Anda yakin ingin meregenerasi sertifikat?',
                                                                )
                                                            ) {
                                                                router.post(
                                                                    `${prefix}/sertifikat/${d.id}/regenerate`,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 text-orange-500"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M16.862 4.487l1.651 1.651a1.5 1.5 0 010 2.122l-9.193 9.193-3.764.418a.375.375 0 01-.414-.414l.418-3.764 9.193-9.193a1.5 1.5 0 012.122 0z"
                                                            />
                                                        </svg>
                                                    </Button>
                                                    {d.file_path && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                window.open(
                                                                    `${prefix}/sertifikat/${d.id}/download`,
                                                                    '_blank',
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5 text-purple-600"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                            </svg>
                                                        </Button>
                                                    )}
                                                    {d.file_path && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                window.open(
                                                                    `${prefix}/sertifikat/${d.id}/download`,
                                                                    '_blank',
                                                                )
                                                            }
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={2}
                                                                stroke="currentColor"
                                                                className="h-5 w-5 text-blue-600"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                                                />
                                                            </svg>
                                                        </Button>
                                                    )}
                                                    {d.approval_status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    approveCertificate(
                                                                        d.id,
                                                                        'approve',
                                                                    )
                                                                }
                                                                className="text-green-600 hover:text-green-700"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="h-5 w-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M4.5 12.75l6 6 9-13.5"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    approveCertificate(
                                                                        d.id,
                                                                        'reject',
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={2}
                                                                    stroke="currentColor"
                                                                    className="h-5 w-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            router.post(
                                                                `${prefix}/sertifikat/${d.id}/validate`,
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 text-green-600"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M9 12l2 2 4-4"
                                                            />
                                                        </svg>
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            generateIndividual(
                                                                d.id,
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 text-orange-500"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M16.862 4.487l1.651 1.651a1.5 1.5 0 010 2.122l-9.193 9.193-3.764.418a.375.375 0 01-.414-.414l.418-3.764 9.193-9.193a1.5 1.5 0 012.122 0z"
                                                            />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            generateIndividual(
                                                                d.id,
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-5 w-5 text-blue-600"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                                            />
                                                        </svg>
                                                    </Button>
                                                </>
                                            )}
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
