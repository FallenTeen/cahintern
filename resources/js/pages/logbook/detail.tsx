import AppLayout from '@/layouts/app-layout';
import { dashboard, logbookMahasiswa } from '@/routes';
import { detail as logbookDetail, approve as logbookApprove, reject as logbookReject, revision as logbookRevision } from '@/routes/logbook';
import { show as showLogbookMahasiswa } from '@/routes/logbook/mahasiswa';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Timer,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  XCircle,
  Image,
  CreditCard,
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

type Status = "pending" | "disetujui" | "ditolak" | "revision";

type Peserta = {
  id: number;
  nama: string;
  nim_nisn: string;
  email: string;
  asal_instansi: string;
};

type ApprovedBy = {
  nama: string;
  email: string;
};

type LogbookDetail = {
  id: number;
  peserta: Peserta;
  tanggal: string;
  tanggal_raw: string;
  hari: string;
  kegiatan: string;
  deskripsi: string;
  jam_mulai: string | null;
  jam_selesai: string | null;
  durasi: string;
  durasi_jam: number;
  status: Status;
  status_label: string;
  status_badge_class: string;
  catatan_pembimbing: string | null;
  masalah: string | null;
  solusi: string | null;
  dokumentasi: string | null;
  is_editable: boolean;
  needs_approval: boolean;
  is_overdue: boolean;
  approved_by: ApprovedBy | null;
  disetujui_pada: string | null;
  created_at: string;
  updated_at: string;
};

type Navigation = {
  previous: {
    id: number;
    tanggal: string;
    kegiatan: string;
  } | null;
  next: {
    id: number;
    tanggal: string;
    kegiatan: string;
  } | null;
};

type Props = {
  logbook: LogbookDetail;
  navigation: Navigation;
  canManage: boolean;
};

export default function DetailLogbook() {
  const { logbook, navigation, canManage } = usePage<Props>().props;
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [revisionDialog, setRevisionDialog] = useState(false);

  const approveForm = useForm({
    catatan_pembimbing: '',
  });

  const rejectForm = useForm({
    catatan_pembimbing: '',
  });

  const revisionForm = useForm({
    catatan_pembimbing: '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: dashboard().url },
    { title: "Logbook Mahasiswa", href: logbookMahasiswa().url },
    { title: logbook.peserta.nama, href: showLogbookMahasiswa(logbook.peserta.id).url },
    { title: "Detail Logbook" },
  ];

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

  const handleNavigate = (logbookId: number) => {
    router.visit(logbookDetail(logbookId).url);
  };

  const handleBack = () => {
    router.visit(showLogbookMahasiswa(logbook.peserta.id).url);
  };

  const handleApprove = () => {
    approveForm.post(logbookApprove(logbook.id).url, {
      preserveScroll: true,
      onSuccess: () => {
        setApproveDialog(false);
        approveForm.reset();
      },
    });
  };

  const handleReject = () => {
    rejectForm.post(logbookReject(logbook.id).url, {
      preserveScroll: true,
      onSuccess: () => {
        setRejectDialog(false);
        rejectForm.reset();
      },
    });
  };

  const handleRequestRevision = () => {
    revisionForm.post(logbookRevision(logbook.id).url, {
      preserveScroll: true,
      onSuccess: () => {
        setRevisionDialog(false);
        revisionForm.reset();
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Detail Logbook - ${logbook.kegiatan}`} />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Logbook
          </Button>

          <div className="flex items-center gap-2">
            {navigation.previous && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(navigation.previous!.id)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Sebelumnya
              </Button>
            )}
            {navigation.next && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(navigation.next!.id)}
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {logbook.is_overdue && logbook.status === 'pending' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Logbook ini sudah melewati batas waktu pengajuan (2 hari setelah tanggal kegiatan)
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={badgeColor(logbook.status)}>
                        {logbook.status_label}
                      </Badge>
                      {logbook.is_editable && (
                        <Badge variant="outline">Dapat Diedit</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{logbook.kegiatan}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-base">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {logbook.hari}, {logbook.tanggal}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {logbook.jam_mulai} - {logbook.jam_selesai}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <Timer className="w-4 h-4" />
                        {logbook.durasi}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    DESKRIPSI KEGIATAN
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {logbook.deskripsi}
                    </p>
                  </div>
                </div>

                {logbook.masalah && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        MASALAH YANG DIHADAPI
                      </h3>
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {logbook.masalah}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {logbook.solusi && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-green-500" />
                        SOLUSI YANG DITERAPKAN
                      </h3>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {logbook.solusi}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {logbook.dokumentasi && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        DOKUMENTASI
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={logbook.dokumentasi}
                          alt="Dokumentasi kegiatan"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </>
                )}

                {logbook.catatan_pembimbing && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        CATATAN PEMBIMBING
                      </h3>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {logbook.catatan_pembimbing}
                        </p>
                        {logbook.approved_by && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs text-muted-foreground">
                              Oleh: <span className="font-medium">{logbook.approved_by.nama}</span>
                              {logbook.disetujui_pada && (
                                <> • {logbook.disetujui_pada}</>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {canManage && logbook.needs_approval && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Tindakan Pembimbing</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setApproveDialog(true)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Setujui Logbook
                    </Button>
                    <Button
                      onClick={() => setRevisionDialog(true)}
                      variant="outline"
                      className="border-orange-500 text-orange-500 hover:bg-orange-50"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Minta Revisi
                    </Button>
                    <Button
                      onClick={() => setRejectDialog(true)}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Tolak Logbook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informasi Peserta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nama Lengkap</p>
                  <p className="font-semibold">{logbook.peserta.nama}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    NIM/NISN
                  </p>
                  <p className="font-mono text-sm">{logbook.peserta.nim_nisn}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </p>
                  <p className="text-sm">{logbook.peserta.email}</p>
                </div>
                <Separator />
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Asal Instansi
                  </p>
                  <p className="text-sm">{logbook.peserta.asal_instansi}</p>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.visit(showLogbookMahasiswa(logbook.peserta.id).url)}
                >
                  Lihat Semua Logbook
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Detail Waktu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Jam Mulai</span>
                  <span className="font-semibold">{logbook.jam_mulai}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Jam Selesai</span>
                  <span className="font-semibold">{logbook.jam_selesai}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Durasi</span>
                  <span className="font-semibold text-primary">{logbook.durasi}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Durasi (Jam)</span>
                  <span className="font-semibold">{logbook.durasi_jam} jam</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Dibuat pada</p>
                  <p>{logbook.created_at}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Terakhir diupdate</p>
                  <p>{logbook.updated_at}</p>
                </div>
                {logbook.disetujui_pada && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Disetujui pada</p>
                      <p>{logbook.disetujui_pada}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Setujui Logbook
            </DialogTitle>
            <DialogDescription>
              Anda akan menyetujui logbook "{logbook.kegiatan}". Catatan pembimbing bersifat opsional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Catatan Pembimbing (Opsional)
              </label>
              <Textarea
                value={approveForm.data.catatan_pembimbing}
                onChange={(e) => approveForm.setData('catatan_pembimbing', e.target.value)}
                placeholder="Berikan catatan atau feedback positif..."
                rows={4}
                className={approveForm.errors.catatan_pembimbing ? 'border-red-500' : ''}
              />
              {approveForm.errors.catatan_pembimbing && (
                <p className="text-sm text-red-500 mt-1">{approveForm.errors.catatan_pembimbing}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialog(false)}
              disabled={approveForm.processing}
            >
              Batal
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600"
              disabled={approveForm.processing}
            >
              {approveForm.processing ? 'Menyetujui...' : 'Setujui Logbook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revisionDialog} onOpenChange={setRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Minta Revisi Logbook
            </DialogTitle>
            <DialogDescription>
              Berikan catatan yang jelas tentang apa yang perlu diperbaiki oleh mahasiswa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Catatan Revisi <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={revisionForm.data.catatan_pembimbing}
                onChange={(e) => revisionForm.setData('catatan_pembimbing', e.target.value)}
                placeholder="Jelaskan bagian mana yang perlu direvisi dan bagaimana seharusnya..."
                rows={5}
                className={revisionForm.errors.catatan_pembimbing ? 'border-red-500' : ''}
              />
              {revisionForm.errors.catatan_pembimbing && (
                <p className="text-sm text-red-500 mt-1">{revisionForm.errors.catatan_pembimbing}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Minimal 10 karakter</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevisionDialog(false)}
              disabled={revisionForm.processing}
            >
              Batal
            </Button>
            <Button
              onClick={handleRequestRevision}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={revisionForm.processing}
            >
              {revisionForm.processing ? 'Mengirim...' : 'Kirim Permintaan Revisi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Tolak Logbook
            </DialogTitle>
            <DialogDescription>
              Tindakan ini akan menolak logbook. Berikan alasan yang jelas kepada mahasiswa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Logbook yang ditolak tidak dapat diubah lagi oleh mahasiswa. Pastikan keputusan Anda sudah tepat.
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectForm.data.catatan_pembimbing}
                onChange={(e) => rejectForm.setData('catatan_pembimbing', e.target.value)}
                placeholder="Jelaskan alasan penolakan logbook ini..."
                rows={5}
                className={rejectForm.errors.catatan_pembimbing ? 'border-red-500' : ''}
              />
              {rejectForm.errors.catatan_pembimbing && (
                <p className="text-sm text-red-500 mt-1">{rejectForm.errors.catatan_pembimbing}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Minimal 10 karakter</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(false)}
              disabled={rejectForm.processing}
            >
              Batal
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              disabled={rejectForm.processing}
            >
              {rejectForm.processing ? 'Menolak...' : 'Tolak Logbook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
