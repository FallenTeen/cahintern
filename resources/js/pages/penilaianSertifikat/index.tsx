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

type SertifikatData = {
    id: number;
    peserta_profile_id: number;
    nama_peserta: string;
    tanggal_terbit: string;
    nomor_sertifikat: string;
    file_path: string | null;
    status: Status;
    approval_status: ApprovalStatus;
    can_approve?: boolean;
    can_download?: boolean;
    nilai_total?: number;
    logbook_completion?: number;
    has_sertifikat?: boolean;
};

type Row = {
    id: number;
    peserta_profile_id?: number;
    nama_peserta: string;
    tanggal: string;
    status: Status;
    file_path: string | null;
    approval_status?: ApprovalStatus;
    nilai_total?: number;
    logbook_completion?: number;
    has_sertifikat?: boolean;
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
        data: SertifikatData[];
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
    const [templateName, setTemplateName] = useState<string>('');
    const prefix =
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/pic')
            ? '/pic'
            : '/admin';

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
            
            setTimeout(() => {
                setShowFlash(false);
            }, 5000);
        }
    }, [flash]);

    const rows: Row[] = useMemo(() => {
        if (isCertificateView) {
            return props.sertifikatData!.data.map((s) => ({
                id: s.id,
                peserta_profile_id: s.peserta_profile_id,
                nama_peserta: s.nama_peserta,
                tanggal: s.tanggal_terbit,
                status: s.status,
                file_path: s.file_path,
                approval_status: s.approval_status,
                nilai_total: s.nilai_total,
                logbook_completion: s.logbook_completion,
                has_sertifikat: s.has_sertifikat,
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
        if (!page1Template) {
            window.alert('Pilih file template terlebih dahulu');
            return;
        }
        if (!templateName.trim()) {
            window.alert('Masukkan nama template terlebih dahulu');
            return;
        }
        const fd = new FormData();
        fd.append('page1_template', page1Template);
        fd.append('template_name', templateName.trim());
        router.post(`${prefix}/sertifikat/template`, fd, {
            forceFormData: true,
            onSuccess: () => {
                setTemplateName('');
                setPage1Template(null);
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
        
        // Gunakan peserta_profile_id untuk batch generate
        const profileIds = selected.map(id => {
            const row = rows.find(r => r.id === id);
            return row?.peserta_profile_id || id;
        });
        
        router.post(
            `${prefix}/sertifikat/batch-generate`,
            {
                sertifikat_ids: profileIds,
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
        
        // Filter hanya yang has_sertifikat = true
        const sertifikatIds = selected.filter(id => {
            const row = rows.find(r => r.id === id);
            return row?.has_sertifikat;
        });
        
        if (sertifikatIds.length === 0) {
            window.alert('Tidak ada sertifikat yang dapat di' + (action === 'approve' ? 'setujui' : 'tolak'));
            return;
        }
        
        const confirmMessage = action === 'approve' 
            ? 'Apakah Anda yakin ingin menyetujui sertifikat yang dipilih?' 
            : 'Apakah Anda yakin ingin menolak sertifikat yang dipilih?';
        
        if (!window.confirm(confirmMessage)) {
            return;
        }
        
        router.post(`${prefix}/sertifikat/batch-approve`, {
            sertifikat_ids: sertifikatIds,
            action: action,
        }, {
            onSuccess: () => {
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
        });
    };

    const regenerateIndividual = (sertifikatId: number, hasSertifikat: boolean) => {
        if (!hasSertifikat) {
            window.alert('Belum ada sertifikat untuk diregenerasi');
            return;
        }
        
        if (!window.confirm('Apakah Anda yakin ingin meregenerasi sertifikat ini?')) {
            return;
        }
        
        router.post(`${prefix}/sertifikat/${sertifikatId}/regenerate`);
    };

    const filtered = useMemo(() => {
        if (isCertificateView) {
            return rows;
        }

        const q = query.trim().toLowerCase();
        return rows.filter((d) => {
            if (statusFilter !== 'Semua' && d.status !== statusFilter) return false;
            if (!q) return true;
            return d.nama_peserta.toLowerCase().includes(q) || false;
        });
    }, [rows, query, statusFilter, isCertificateView]);

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
                                'Logbook <80%, apakah tetap generate sertifikat?'}
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
                    {isCertificateView && (
                        <div className="flex gap-2">
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
                        </div>
                    )}
                </div>
                
                {prefix === '/admin' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Sertifikat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Unggah template background sertifikat dalam format PNG/JPG. 
                                Template ini akan digunakan sebagai background untuk semua sertifikat.
                                <br />
                                <strong>Ukuran rekomendasi:</strong> 297mm x 210mm (A4 Landscape) atau 3508 x 2480 pixels (300 DPI)
                            </p>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Nama Template
                                </p>
                                <Input
                                    type="text"
                                    placeholder="Masukkan nama template"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Background Template (PNG/JPG)
                                </p>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={(e) =>
                                        setPage1Template(
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="w-full"
                                />
                                {page1Template && (
                                    <p className="text-xs text-green-600">
                                        ✓ File dipilih: {page1Template.name}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={uploadTemplate}
                                    disabled={!page1Template || !templateName.trim()}
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
                            <CardTitle>Total Mahasiswa</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-gray-700">
                            {rows.length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sertifikat Terbit</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-green-500">
                            {rows.filter(r => r.status === 'terbit').length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Menunggu Approval</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-yellow-600">
                            {rows.filter(r => r.approval_status === 'pending' && r.has_sertifikat).length}
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
                                    {isCertificateView && (
                                        <TableHead>Logbook</TableHead>
                                    )}
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
                                        {isCertificateView && (
                                            <TableCell>
                                                <Badge className={
                                                    (d.logbook_completion || 0) >= 80 
                                                        ? 'bg-green-500 text-white' 
                                                        : 'bg-orange-500 text-white'
                                                }>
                                                    {d.logbook_completion?.toFixed(0) || 0}%
                                                </Badge>
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Badge
                                                className={getStatusBadgeClass(d.status)}
                                            >
                                                {d.status === 'belum'
                                                    ? 'Belum'
                                                    : d.status === 'proses'
                                                      ? 'Proses'
                                                      : 'Terbit'}
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
                                                        onClick={() => regenerateIndividual(d.id, d.has_sertifikat || false)}
                                                        disabled={!d.has_sertifikat}
                                                        title="Regenerate"
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
                                                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
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
                                                            title="Download"
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
                                                    {d.has_sertifikat && d.approval_status === 'pending' && (
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
                                                                title="Approve"
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
                                                                title="Reject"
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
                                                </>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        generateIndividual(
                                                            d.id,
                                                        )
                                                    }
                                                    title="Generate Sertifikat"
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
                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                        />
                                                    </svg>
                                                </Button>
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