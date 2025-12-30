<?php

namespace App\Http\Controllers;

use App\Models\Sertifikat;
use App\Models\CertificateTemplate;
use App\Models\Logbook;
use App\Models\User;
use App\Models\PenilaianAkhir;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SertifikatController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $pesertaProfile = $user->pesertaProfile;

        $sertifikat = null;
        $progress = 0;
        $total_hari = 40; // Default total hari magang
        $hari_selesai = 0;

        if ($pesertaProfile) {
            // Hitung progress magang
            $total_hari = $pesertaProfile->tanggal_selesai
                ? $pesertaProfile->tanggal_mulai->diffInDays($pesertaProfile->tanggal_selesai)
                : 40;

            $hari_selesai = $pesertaProfile->tanggal_mulai->diffInDays(now());
            $progress = min(100, ($hari_selesai / $total_hari) * 100);

            // Ambil sertifikat jika ada
            $sertifikatData = $pesertaProfile->sertifikat;
            if ($sertifikatData) {
                $sertifikat = [
                    'id' => $sertifikatData->id,
                    'nomor_sertifikat' => $sertifikatData->nomor_sertifikat,
                    'tanggal_terbit' => $sertifikatData->tanggal_terbit,
                    'file_path' => $sertifikatData->file_path,
                    'approval_status' => $sertifikatData->approval_status,
                ];
            }
        }

        return inertia::render('user/sertifikat', [
            'sertifikat' => $sertifikat,
            'progress' => round($progress),
            'total_hari' => $total_hari,
            'hari_selesai' => min($hari_selesai, $total_hari),
        ]);
    }

    public function adminIndex()
    {
        $sertifikatData = Sertifikat::with(['pesertaProfile.user', 'approvedBy'])
            ->paginate(10)
            ->through(function ($s) {
                $status = 'belum';
                if ($s->file_path) {
                    $status = $s->is_published ? 'terbit' : 'proses';
                }

                return [
                    'id' => $s->id,
                    'nama_peserta' => $s->pesertaProfile->user->name ?? '',
                    'tanggal_terbit' => $s->tanggal_terbit ? $s->tanggal_terbit->format('d F Y') : '-',
                    'nomor_sertifikat' => $s->nomor_sertifikat,
                    'file_path' => $s->file_path,
                    'status' => $status,
                    'approval_status' => $s->approval_status,
                    'approved_at' => $s->approved_at ? $s->approved_at->format('d F Y H:i') : null,
                    'approved_by' => $s->approvedBy ? $s->approvedBy->name : null,
                    'can_approve' => $s->file_path && $s->approval_status === 'pending',
                    'can_download' => $s->file_path && $s->approval_status === 'approved',
                ];
            });

        return Inertia::render('penilaianSertifikat/index', [
            'sertifikatData' => $sertifikatData,
            'viewMode' => 'certificate',
        ]);
    }

    public function picIndex()
    {
        $sertifikatData = Sertifikat::with(['pesertaProfile.user', 'approvedBy'])
            ->paginate(10)
            ->through(function ($s) {
                $status = 'belum';
                if ($s->file_path) {
                    $status = $s->is_published ? 'terbit' : 'proses';
                }

                return [
                    'id' => $s->id,
                    'nama_peserta' => $s->pesertaProfile->user->name ?? '',
                    'tanggal_terbit' => $s->tanggal_terbit ? $s->tanggal_terbit->format('d F Y') : '-',
                    'nomor_sertifikat' => $s->nomor_sertifikat,
                    'file_path' => $s->file_path,
                    'status' => $status,
                    'approval_status' => $s->approval_status,
                    'approved_at' => $s->approved_at ? $s->approved_at->format('d F Y H:i') : null,
                    'approved_by' => $s->approvedBy ? $s->approvedBy->name : null,
                    'can_approve' => $s->file_path && $s->approval_status === 'pending',
                    'can_download' => $s->file_path && $s->approval_status === 'approved',
                ];
            });

        return Inertia::render('penilaianSertifikat/index', [
            'sertifikatData' => $sertifikatData,
            'viewMode' => 'certificate',
        ]);
    }

    public function uploadTemplate(Request $request)
    {
        $request->validate([
            'page1_template' => 'nullable|file|mimes:png|max:5120',
            'page2_template' => 'nullable|file|mimes:png|max:5120',
            'template_name' => 'required|string|max:255',
        ]);

        // Nonaktifkan template yang aktif saat ini
        CertificateTemplate::where('is_active', true)->update(['is_active' => false]);

        $page1Path = null;
        $page2Path = null;

        if ($request->hasFile('page1_template')) {
            $page1File = $request->file('page1_template');
            $page1Path = $page1File->store('certificate_templates', 'public');
        }

        if ($request->hasFile('page2_template')) {
            $page2File = $request->file('page2_template');
            $page2Path = $page2File->store('certificate_templates', 'public');
        }

        // Simpan template baru ke database
        $template = CertificateTemplate::create([
            'name' => $request->template_name,
            'page1_template_path' => $page1Path,
            'page2_template_path' => $page2Path,
            'is_active' => true,
            'config' => $request->config ?? null,
        ]);

        return back()->with('success', 'Template sertifikat berhasil disimpan.');
    }

    public function previewTemplate()
    {
        // Ambil template aktif dari database
        $activeTemplate = CertificateTemplate::where('is_active', true)->first();

        $page1Background = null;
        $page2Background = null;

        if ($activeTemplate) {
            // Gunakan path absolut untuk preview
            if ($activeTemplate->page1_template_path) {
                $page1Background = storage_path('app/public/' . $activeTemplate->page1_template_path);
            }
            if ($activeTemplate->page2_template_path) {
                $page2Background = storage_path('app/public/' . $activeTemplate->page2_template_path);
            }
        }

        $data = [
            'certificate_number' => '000/LOREM/01/2025',
            'participant_name' => 'Lorem Ipsum Dolor Sit Amet',
            'internship_duration' => 'Januari 2025 - Maret 2025 (3 Bulan)',
            'start_date' => now()->subMonths(3),
            'end_date' => now(),
            'scores' => [
                'nilai_disiplin' => 90,
                'nilai_kerjasama' => 88,
                'nilai_inisiatif' => 85,
                'nilai_komunikasi' => 87,
                'nilai_teknis' => 92,
                'nilai_kreativitas' => 89,
                'nilai_tanggung_jawab' => 91,
                'nilai_kehadiran' => 95,
                'nilai_total' => 90.5,
                'predikat' => 'A',
            ],
            'page1Background' => $page1Background,
            'page2Background' => $page2Background,
        ];

        $pdf = Pdf::loadView('certificates.certificate', $data)
            ->setPaper('a4', 'landscape')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('enable_php', true);

        return $pdf->stream('preview-sertifikat.pdf');
    }

    public function generateFromPenilaian(Request $request, PenilaianAkhir $penilaian)
    {
        $profile = $penilaian->pesertaProfile;
        if (!$profile) {
            abort(404, 'Profil peserta tidak ditemukan.');
        }

        $logbookCompletion = $this->validateLogbookCompletion($profile->id);
        $forceGenerate = $request->input('force_generate', false);
        
        if (!$logbookCompletion && !$forceGenerate) {
            throw ValidationException::withMessages([
                'requires_confirmation' => 'Peserta memiliki logbook <80%. Apakah tetap generate sertifikat?',
            ]);
        }

        $sertifikat = $profile->sertifikat ?: new Sertifikat();
        $sertifikat->peserta_profile_id = $profile->id;
        if (!$sertifikat->nomor_sertifikat) {
            $sertifikat->nomor_sertifikat = Sertifikat::generateNomorSertifikat();
        }
        $sertifikat->tanggal_terbit = now()->toDateString();
        $sertifikat->is_published = false;
        $sertifikat->approval_status = 'pending';
        $sertifikat->file_path = 'certificates/' . $sertifikat->peserta_profile_id . '_' . time() . '.pdf';
        $sertifikat->save();

        $this->generateCertificatePdf($sertifikat);

        return back()->with('success', 'Sertifikat berhasil digenerate dan menunggu persetujuan.');
    }

    public function download(Sertifikat $sertifikat)
    {
        $user = auth()->user();

        if (!$user) {
            abort(401, 'Unauthorized');
        }

        // Admin/PIC bisa download kapan saja untuk keperluan preview
        if (!in_array($user->role, ['admin', 'pic'], true)) {
            // Peserta atau role lain hanya bisa download jika sudah disetujui
            if ($sertifikat->approval_status !== 'approved') {
                abort(403, 'Sertifikat belum disetujui oleh admin.');
            }
        }

        $path = $sertifikat->file_path;
        if (!$path) {
            abort(404, 'File sertifikat tidak tersedia.');
        }

        $fullPath = storage_path('app/public/' . $path);
        if (!file_exists($fullPath)) {
            abort(404, 'File sertifikat tidak ditemukan.');
        }

        return response()->download($fullPath, basename($fullPath));
    }

    public function regenerate(Request $request, Sertifikat $sertifikat)
    {
        $sertifikat->nomor_sertifikat = Sertifikat::generateNomorSertifikat();
        $sertifikat->tanggal_terbit = now()->toDateString();
        $sertifikat->is_published = false;
        $sertifikat->approval_status = 'pending';
        $sertifikat->file_path = 'certificates/' . $sertifikat->peserta_profile_id . '_' . time() . '.pdf';
        $sertifikat->save();

        $this->generateCertificatePdf($sertifikat);

        return redirect()->back()->with('success', 'Sertifikat berhasil diregenerasi dan menunggu persetujuan.');
    }

    public function validateCertificate(Request $request, Sertifikat $sertifikat)
    {
        if (!$this->validateLogbookCompletion($sertifikat->peserta_profile_id)) {
            return redirect()->back()->with('error', 'Sertifikat tidak dapat dipublish. Minimal 80% logbook harus disetujui.');
        }

        $sertifikat->is_published = true;
        $sertifikat->save();

        return redirect()->back()->with('success', 'Sertifikat berhasil divalidasi/publish.');
    }

    protected function validateLogbookCompletion($pesertaProfileId): bool
    {
        $totalLogbook = Logbook::where('peserta_profile_id', $pesertaProfileId)->count();
        $completedLogbook = Logbook::where('peserta_profile_id', $pesertaProfileId)
            ->where('status', 'disetujui')
            ->count();

        // Validasi minimal 80% logbook harus disetujui
        return $totalLogbook > 0 && ($completedLogbook / $totalLogbook) >= 0.8;
    }

    protected function generateCertificatePdf(Sertifikat $sertifikat): void
    {
        $profile = $sertifikat->pesertaProfile;
        $user = $profile ? $profile->user : null;
        $penilaian = $profile ? $profile->penilaianAkhir : null;

        $startDate = $profile ? $profile->tanggal_mulai : null;
        $endDate = $profile ? $profile->tanggal_selesai : null;

        $months = 0;
        if ($startDate && $endDate) {
            $months = max(1, (int) ceil($startDate->floatDiffInMonths($endDate)));
        }

        $startLabel = $startDate ? $startDate->translatedFormat('F Y') : '';
        $endLabel = $endDate ? $endDate->translatedFormat('F Y') : '';
        $durationLabel = '';
        if ($startLabel && $endLabel) {
            $durationLabel = $startLabel . ' - ' . $endLabel . ' (' . $months . ' Bulan)';
        }

        // Ambil template aktif dari database
        $activeTemplate = CertificateTemplate::where('is_active', true)->first();

        $page1Background = null;
        $page2Background = null;

        if ($activeTemplate) {
            // Gunakan path absolut untuk background image
            if ($activeTemplate->page1_template_path) {
                $page1Background = storage_path('app/public/' . $activeTemplate->page1_template_path);
            }
            if ($activeTemplate->page2_template_path) {
                $page2Background = storage_path('app/public/' . $activeTemplate->page2_template_path);
            }
        }

        $data = [
            'certificate_number' => $sertifikat->nomor_sertifikat,
            'participant_name' => $user ? $user->name : '',
            'internship_duration' => $durationLabel,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'scores' => [
                'nilai_disiplin' => $penilaian ? $penilaian->nilai_disiplin : null,
                'nilai_kerjasama' => $penilaian ? $penilaian->nilai_kerjasama : null,
                'nilai_inisiatif' => $penilaian ? $penilaian->nilai_inisiatif : null,
                'nilai_komunikasi' => $penilaian ? $penilaian->nilai_komunikasi : null,
                'nilai_teknis' => $penilaian ? $penilaian->nilai_teknis : null,
                'nilai_kreativitas' => $penilaian ? $penilaian->nilai_kreativitas : null,
                'nilai_tanggung_jawab' => $penilaian ? $penilaian->nilai_tanggung_jawab : null,
                'nilai_kehadiran' => $penilaian ? $penilaian->nilai_kehadiran : null,
                'nilai_total' => $penilaian ? $penilaian->nilai_total : null,
                'predikat' => $penilaian ? $penilaian->predikat : null,
            ],
            'page1Background' => $page1Background,
            'page2Background' => $page2Background,
        ];

        // PENTING: Enable image rendering
        $pdf = Pdf::loadView('certificates.certificate', $data)
            ->setPaper('a4', 'landscape')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('enable_php', true);

        Storage::disk('public')->put($sertifikat->file_path, $pdf->output());
    }

    public function getActiveTemplate()
    {
        $template = CertificateTemplate::where('is_active', true)->first();
        return response()->json([
            'template' => $template,
        ]);
    }

    public function generateBatch(Request $request)
    {
        $request->validate([
            'sertifikat_ids' => 'required|array',
            'sertifikat_ids.*' => 'exists:sertifikats,id',
            'force_generate' => 'nullable|boolean',
        ]);

        $generated = [];
        $failed = [];
        $requiresConfirmation = [];
        $forceGenerate = $request->input('force_generate', false);

        foreach ($request->sertifikat_ids as $sertifikatId) {
            try {
                $sertifikat = Sertifikat::find($sertifikatId);
                if (!$sertifikat) {
                    $failed[] = ['id' => $sertifikatId, 'reason' => 'Sertifikat tidak ditemukan'];
                    continue;
                }

                if (!$this->validateLogbookCompletion($sertifikat->peserta_profile_id) && !$forceGenerate) {
                    $requiresConfirmation[] = $sertifikatId;
                    continue;
                }

                // Regenerate sertifikat
                $sertifikat->nomor_sertifikat = Sertifikat::generateNomorSertifikat();
                $sertifikat->tanggal_terbit = now()->toDateString();
                $sertifikat->is_published = false;
                $sertifikat->approval_status = 'pending';
                $sertifikat->file_path = 'certificates/' . $sertifikat->peserta_profile_id . '_' . time() . '.pdf';
                $sertifikat->save();

                $this->generateCertificatePdf($sertifikat);
                $generated[] = $sertifikat->id;
            } catch (\Exception $e) {
                $failed[] = ['id' => $sertifikatId, 'reason' => $e->getMessage()];
            }
        }

        if (!empty($requiresConfirmation)) {
            throw ValidationException::withMessages([
                'requires_confirmation' => 'Beberapa peserta memiliki logbook <80%. Apakah tetap generate sertifikat?',
            ]);
        }

        $message = 'Batch generate selesai. ';
        if (count($generated) > 0) {
            $message .= 'Berhasil: ' . count($generated) . '. ';
        }
        if (count($failed) > 0) {
            $message .= 'Gagal: ' . count($failed) . '. ';
        }

        return redirect()->back()->with('success', trim($message));
    }

    public function approveCertificate(Request $request, Sertifikat $sertifikat)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string|max:500',
        ]);

        if (!$sertifikat->file_path) {
            return redirect()->back()->with('error', 'Sertifikat belum digenerate. Silakan generate terlebih dahulu.');
        }

        if ($sertifikat->approval_status !== 'pending') {
            return redirect()->back()->with('error', 'Sertifikat sudah diproses.');
        }

        $user = auth()->user();

        if ($request->action === 'approve') {
            $sertifikat->approve($user);
            $message = 'Sertifikat berhasil disetujui.';
        } else {
            $sertifikat->reject($user, $request->reason ?? '');
            $message = 'Sertifikat berhasil ditolak.';
        }

        return redirect()->back()->with('success', $message);
    }

    public function approveBatch(Request $request)
    {
        $request->validate([
            'sertifikat_ids' => 'required|array',
            'sertifikat_ids.*' => 'exists:sertifikats,id',
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string|max:500',
        ]);

        $approved = [];
        $rejected = [];
        $failed = [];

        $user = auth()->user();

        foreach ($request->sertifikat_ids as $sertifikatId) {
            try {
                $sertifikat = Sertifikat::find($sertifikatId);
                if (!$sertifikat) {
                    $failed[] = ['id' => $sertifikatId, 'reason' => 'Sertifikat tidak ditemukan'];
                    continue;
                }

                if (!$sertifikat->file_path) {
                    $failed[] = ['id' => $sertifikatId, 'reason' => 'Sertifikat belum digenerate'];
                    continue;
                }

                if ($sertifikat->approval_status !== 'pending') {
                    $failed[] = ['id' => $sertifikatId, 'reason' => 'Sertifikat sudah diproses'];
                    continue;
                }

                if ($request->action === 'approve') {
                    $sertifikat->approve($user);
                    $approved[] = $sertifikat->id;
                } else {
                    $sertifikat->reject($user, $request->reason ?? '');
                    $rejected[] = $sertifikat->id;
                }
            } catch (\Exception $e) {
                $failed[] = ['id' => $sertifikatId, 'reason' => $e->getMessage()];
            }
        }

        $message = 'Batch approval selesai. ';
        if (count($approved) > 0) {
            $message .= 'Disetujui: ' . count($approved) . '. ';
        }
        if (count($rejected) > 0) {
            $message .= 'Ditolak: ' . count($rejected) . '. ';
        }
        if (count($failed) > 0) {
            $message .= 'Gagal: ' . count($failed) . '. ';
        }

        return redirect()->back()->with('success', $message);
    }
}
