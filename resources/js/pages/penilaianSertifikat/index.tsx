import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { penilaianDanSertifikat } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    CircleCheckBig,
    Download,
    Eye,
    FilePlus,
    Globe,
    Inbox,
    MoreHorizontal,
    RefreshCw,
    Trash,
    Upload,
    X,
    XCircle,
} from 'lucide-react';
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
    generation_disabled?: boolean;
    is_published?: boolean;
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
    generation_disabled?: boolean;
    is_published?: boolean;
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
    activeTemplateUrl?: string | null;
    activeTemplateName?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penilaian & Sertifikat', href: penilaianDanSertifikat().url },
];

type PageProps = SharedData & Props;

export default function PenilaianSertifikat() {
    const props = usePage<PageProps>().props;
    const isCertificateView =
        Boolean(props.sertifikatData) || props.viewMode === 'certificate';
    const [selected, setSelected] = useState<number[]>([]);
    const [page1Template, setPage1Template] = useState<File | null>(null);
    const [templateName, setTemplateName] = useState<string>('');
    const role = (props.auth.user as any).role as string | undefined;
    const prefix = role === 'pic' ? '/pic' : '/admin';

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
    const [pendingGenerateIds, setPendingGenerateIds] = useState<number[]>([]);
    const [pendingGenerateType, setPendingGenerateType] = useState<
        'individual' | 'batch'
    >('individual');

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
                generation_disabled: s.generation_disabled,
                is_published: s.is_published,
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
        const profileIds = selected.map((id) => {
            const row = rows.find((r) => r.id === id);
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
            window.alert(
                'Pilih minimal satu sertifikat untuk di' +
                    (action === 'approve' ? 'setujui' : 'tolak'),
            );
            return;
        }

        // Filter hanya yang has_sertifikat = true
        const sertifikatIds = selected.filter((id) => {
            const row = rows.find((r) => r.id === id);
            return row?.has_sertifikat;
        });

        if (sertifikatIds.length === 0) {
            window.alert(
                'Tidak ada sertifikat yang dapat di' +
                    (action === 'approve' ? 'setujui' : 'tolak'),
            );
            return;
        }

        const confirmMessage =
            action === 'approve'
                ? 'Apakah Anda yakin ingin menyetujui sertifikat yang dipilih?'
                : 'Apakah Anda yakin ingin menolak sertifikat yang dipilih?';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        router.post(
            `${prefix}/sertifikat/batch-approve`,
            {
                sertifikat_ids: sertifikatIds,
                action: action,
            },
            {
                onSuccess: () => {
                    setSelected([]);
                },
            },
        );
    };

    const togglePublish = (sertifikatId: number) => {
        router.post(`${prefix}/sertifikat/${sertifikatId}/validate`);
    };

    const uploadSigned = (sertifikatId: number, file: File) => {
        const fd = new FormData();
        fd.append('signed_certificate', file);
        router.post(`${prefix}/sertifikat/${sertifikatId}/upload-signed`, fd, {
            forceFormData: true,
        });
    };

    const deleteCertificate = (sertifikatId: number) => {
        if (
            !window.confirm(
                'Apakah Anda yakin ingin menghapus sertifikat ini? Sertifikat dapat digenerate ulang dari penilaian.',
            )
        ) {
            return;
        }

        router.delete(`${prefix}/sertifikat/${sertifikatId}`);
    };

    const approveCertificate = (
        sertifikatId: number,
        action: 'approve' | 'reject',
    ) => {
        const confirmMessage =
            action === 'approve'
                ? 'Apakah Anda yakin ingin menyetujui sertifikat ini?'
                : 'Apakah Anda yakin ingin menolak sertifikat ini?';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        router.post(`${prefix}/sertifikat/${sertifikatId}/approve`, {
            action: action,
        });
    };

    const regenerateIndividual = (
        sertifikatId: number,
        hasSertifikat: boolean,
    ) => {
        if (!hasSertifikat) {
            window.alert('Belum ada sertifikat untuk diregenerasi');
            return;
        }

        if (
            !window.confirm(
                'Apakah Anda yakin ingin meregenerasi sertifikat ini?',
            )
        ) {
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
            if (statusFilter !== 'Semua' && d.status !== statusFilter)
                return false;
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
            <Dialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Konfirmasi Generate Sertifikat
                        </DialogTitle>
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
                <div
                    className={`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg ${
                        flashType === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}
                >
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
                </div>

                {prefix === '/admin' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
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
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                    />
                                </svg>
                                Template Sertifikat
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                                {/* Kolom Kiri - Form & Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                                        <p className="mb-1 font-medium">
                                            Informasi Template
                                        </p>
                                        <p className="text-xs leading-relaxed">
                                            Format: PNG/JPG • Ukuran: A4
                                            Landscape (297×210mm) • Resolusi:
                                            300 DPI (3508×2480px)
                                        </p>
                                        <div className="mt-3">
                                            <a
                                                href={`${prefix}/sertifikat/template/example-download`}
                                                className="inline-flex"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-blue-300 text-blue-800 hover:bg-blue-100"
                                                    type="button"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="mr-2 h-4 w-4"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                                        />
                                                    </svg>
                                                    Download Safepoint Template
                                                    Sertifikat
                                                </Button>
                                            </a>
                                        </div>
                                    </div>

                                    {props.activeTemplateUrl ||
                                    props.activeTemplateName ? (
                                        <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2.5}
                                                            stroke="currentColor"
                                                            className="h-4 w-4 text-white"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M4.5 12.75l6 6 9-13.5"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-green-700">
                                                            Template Aktif
                                                        </p>
                                                        <p className="text-sm font-semibold text-green-900">
                                                            {props.activeTemplateName ||
                                                                'Tanpa nama'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-green-300 text-green-700 hover:bg-green-100"
                                                    onClick={() =>
                                                        window.open(
                                                            `${prefix}/sertifikat/template/preview`,
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
                                                        className="mr-1 h-4 w-4"
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
                                                    Full Size
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="h-5 w-5 flex-shrink-0 text-yellow-600"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                                    />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-800">
                                                        Belum ada template
                                                    </p>
                                                    <p className="text-xs text-yellow-700">
                                                        Unggah template untuk
                                                        mulai generate
                                                        sertifikat
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-700">
                                            Upload Template Baru
                                        </h3>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Nama Template
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="Contoh: Template Sertifikat 2025"
                                                value={templateName}
                                                onChange={(e) =>
                                                    setTemplateName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-gray-300"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                File Template
                                            </label>
                                            <div className="flex flex-col gap-2">
                                                <Input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg"
                                                    onChange={(e) =>
                                                        setPage1Template(
                                                            e.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                    className="border-gray-300"
                                                />
                                                {page1Template && (
                                                    <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M4.5 12.75l6 6 9-13.5"
                                                            />
                                                        </svg>
                                                        <span className="font-medium">
                                                            {page1Template.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                            onClick={uploadTemplate}
                                            disabled={
                                                !page1Template ||
                                                !templateName.trim()
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="mr-2 h-4 w-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                                />
                                            </svg>
                                            Upload & Aktifkan Template
                                        </Button>
                                    </div>
                                </div>

                                {/* Kolom Kanan - Preview */}
                                <div className="flex-shrink-0 lg:w-130">
                                    <div className="sticky top-4 space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-700">
                                            Preview Template
                                        </h3>
                                        {props.activeTemplateUrl ? (
                                            <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 shadow-md">
                                                <img
                                                    src={
                                                        props.activeTemplateUrl
                                                    }
                                                    alt="Template preview"
                                                    className="h-auto w-full"
                                                    style={{ display: 'block' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                                                <div className="text-center">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="mx-auto h-12 w-12 text-gray-400"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                        />
                                                    </svg>
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Preview akan muncul di
                                                        sini
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                            {rows.filter((r) => r.status === 'terbit').length}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Menunggu Approval</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold text-yellow-600">
                            {
                                rows.filter(
                                    (r) =>
                                        r.approval_status === 'pending' &&
                                        r.has_sertifikat,
                                ).length
                            }
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

                        <div className="flex flex-wrap items-center gap-2">
                            <Tabs
                                value={statusFilter}
                                onValueChange={(val) =>
                                    setStatusFilter(val as Status | 'Semua')
                                }
                            >
                                <TabsList>
                                    <TabsTrigger value="Semua">
                                        Semua
                                    </TabsTrigger>
                                    <TabsTrigger value="belum">
                                        Belum
                                    </TabsTrigger>
                                    <TabsTrigger value="proses">
                                        Proses
                                    </TabsTrigger>
                                    <TabsTrigger value="terbit">
                                        Terbit
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                            {isCertificateView && (
                                <div className="flex flex-1 justify-end">
                                    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                                        <Button
                                            variant="default"
                                            disabled={selected.length === 0}
                                            onClick={() => batchGenerate()}
                                            className="w-full md:w-auto"
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4 text-yellow-500" />
                                            Generate Batch
                                        </Button>

                                        <Button
                                            variant="default"
                                            disabled={selected.length === 0}
                                            onClick={() =>
                                                batchApprove('approve')
                                            }
                                            className="w-full bg-green-600 hover:bg-green-700 md:w-auto"
                                        >
                                            <CircleCheckBig className="mr-2 h-4 w-4 text-white" />
                                            Approve Batch
                                        </Button>

                                        <Button
                                            variant="default"
                                            disabled={selected.length === 0}
                                            onClick={() =>
                                                batchApprove('reject')
                                            }
                                            className="w-full bg-red-600 hover:bg-red-700 md:w-auto"
                                        >
                                            <X className="mr-2 h-4 w-4 text-white" />
                                            Reject Batch
                                        </Button>
                                    </div>
                                </div>
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
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-4 rounded-full bg-gray-50 p-6">
                                    <Inbox className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Belum ada data sertifikat
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Data sertifikat akan muncul di sini.
                                </p>
                            </div>
                        ) : (
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
                                                    onCheckedChange={(
                                                        checked,
                                                    ) => {
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
                                            <TableHead>
                                                Status Approval
                                            </TableHead>
                                        )}
                                        {isCertificateView && (
                                            <TableHead>Publikasi</TableHead>
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
                                                            setSelected(
                                                                (prev) =>
                                                                    checked
                                                                        ? [
                                                                              ...prev,
                                                                              d.id,
                                                                          ]
                                                                        : prev.filter(
                                                                              (
                                                                                  x,
                                                                              ) =>
                                                                                  x !==
                                                                                  d.id,
                                                                          ),
                                                            );
                                                        }}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                {d.nama_peserta}
                                            </TableCell>
                                            <TableCell>{d.tanggal}</TableCell>
                                            <TableCell>
                                                {d.nilai_total ?? '-'}
                                            </TableCell>
                                            {isCertificateView && (
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            (d.logbook_completion ||
                                                                0) >= 80
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-orange-500 text-white'
                                                        }
                                                    >
                                                        {d.logbook_completion?.toFixed(
                                                            0,
                                                        ) || 0}
                                                        %
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <Badge
                                                    className={getStatusBadgeClass(
                                                        d.status,
                                                    )}
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
                                                        className={getApprovalBadgeClass(
                                                            d.approval_status ||
                                                                'pending',
                                                        )}
                                                    >
                                                        {getApprovalBadgeText(
                                                            d.approval_status ||
                                                                'pending',
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            {isCertificateView && (
                                                <TableCell>
                                                    {d.has_sertifikat &&
                                                    d.file_path ? (
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={Boolean(
                                                                    d.is_published,
                                                                )}
                                                                onCheckedChange={() =>
                                                                    togglePublish(
                                                                        d.id,
                                                                    )
                                                                }
                                                                aria-label="Toggle Publikasi Sertifikat"
                                                            />
                                                            <Label className="text-xs">
                                                                {d.is_published ? (
                                                                    <span className="font-medium text-green-600">
                                                                        Terbitkan
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-500">
                                                                        Batal Terbitkan
                                                                    </span>
                                                                )}
                                                            </Label>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Belum ada sertifikat
                                                        </span>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-center">
                                                {isCertificateView &&
                                                    d.has_sertifikat && (
                                                        <input
                                                            id={`upload-signed-${d.id}`}
                                                            type="file"
                                                            accept="application/pdf"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file =
                                                                    e.target
                                                                        .files?.[0];
                                                                if (file) {
                                                                    uploadSigned(
                                                                        d.id,
                                                                        file,
                                                                    );
                                                                    e.target.value =
                                                                        '';
                                                                }
                                                            }}
                                                        />
                                                    )}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <span className="sr-only">
                                                                Open menu
                                                            </span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-56"
                                                    >
                                                        <DropdownMenuLabel>
                                                            Aksi Sertifikat
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        {/* KONDISI 1: Tampilan Utama Certificate View */}
                                                        {isCertificateView ? (
                                                            <>
                                                                {/* Regenerate */}
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        regenerateIndividual(
                                                                            d.id,
                                                                            d.has_sertifikat ||
                                                                                false,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !d.has_sertifikat ||
                                                                        d.generation_disabled
                                                                    }
                                                                >
                                                                    <RefreshCw className="mr-2 h-4 w-4 text-orange-500" />
                                                                    <span>
                                                                        Regenerate
                                                                    </span>
                                                                </DropdownMenuItem>

                                                                {/* Download */}
                                                                {d.file_path && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            window.open(
                                                                                `${prefix}/sertifikat/${d.id}/download`,
                                                                                '_blank',
                                                                            )
                                                                        }
                                                                    >
                                                                        <Download className="mr-2 h-4 w-4 text-blue-600" />
                                                                        <span>
                                                                            Download
                                                                            Sertifikat
                                                                        </span>
                                                                    </DropdownMenuItem>
                                                                )}

                                                                {/* Preview */}
                                                                {d.has_sertifikat && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            window.open(
                                                                                `${prefix}/sertifikat/${d.id}/preview`,
                                                                                '_blank',
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        <span>
                                                                            Preview
                                                                        </span>
                                                                    </DropdownMenuItem>
                                                                )}

                                                                <DropdownMenuSeparator />

                                                                {/* Upload Signed */}
                                                                {d.has_sertifikat && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            document
                                                                                .getElementById(
                                                                                    `upload-signed-${d.id}`,
                                                                                )
                                                                                ?.click()
                                                                        }
                                                                    >
                                                                        <Upload className="mr-2 h-4 w-4 text-purple-600" />
                                                                        <span>
                                                                            Upload
                                                                            Sertifikat
                                                                        </span>
                                                                    </DropdownMenuItem>
                                                                )}

                                                                {/* Toggle Publish */}
                                                                {d.has_sertifikat &&
                                                                    d.file_path && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                togglePublish(
                                                                                    d.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Globe
                                                                                className={`mr-2 h-4 w-4 ${d.is_published ? 'text-green-600' : 'text-gray-500'}`}
                                                                            />
                                                                            <span>
                                                                                {d.is_published
                                                                                    ? 'Batalkan terbitkan'
                                                                                    : 'Terbitkan'}
                                                                            </span>
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                {/* Approve / Reject (Pending Approval) */}
                                                                {d.has_sertifikat &&
                                                                    d.file_path &&
                                                                    d.approval_status ===
                                                                        'pending' && (
                                                                        <>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    approveCertificate(
                                                                                        d.id,
                                                                                        'approve',
                                                                                    )
                                                                                }
                                                                            >
                                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                                <span>
                                                                                    Disetujui
                                                                                </span>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    approveCertificate(
                                                                                        d.id,
                                                                                        'reject',
                                                                                    )
                                                                                }
                                                                            >
                                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                                <span>
                                                                                    Ditolak
                                                                                </span>
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}

                                                                {/* Delete */}
                                                                {d.has_sertifikat && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                deleteCertificate(
                                                                                    d.id,
                                                                                )
                                                                            }
                                                                            className="text-red-600 focus:text-red-600"
                                                                        >
                                                                            <Trash className="mr-2 h-4 w-4" />
                                                                            <span>
                                                                                Hapus
                                                                                Sertifikat
                                                                            </span>
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            /* KONDISI 2: Bukan Certificate View (Tombol Generate Awal) */
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    generateIndividual(
                                                                        d.id,
                                                                    )
                                                                }
                                                            >
                                                                <FilePlus className="mr-2 h-4 w-4 text-blue-600" />
                                                                <span>
                                                                    Generate
                                                                    Sertifikat
                                                                </span>
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
