<?php

namespace App\Http\Controllers;

use App\Models\Sertifikat;
use App\Models\CertificateTemplate;
use App\Models\Logbook;
use App\Models\User;
use App\Models\PenilaianAkhir;
use App\Models\PesertaProfile;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use NumberFormatter;

class SertifikatController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $pesertaProfile = $user->pesertaProfile;

        $sertifikat = null;
        $progress = 0;
        $total_hari = 40;
        $hari_selesai = 0;

        if ($pesertaProfile) {
            $total_hari = $pesertaProfile->tanggal_selesai
                ? $pesertaProfile->tanggal_mulai->diffInDays($pesertaProfile->tanggal_selesai)
                : 40;

            $hari_selesai = $pesertaProfile->tanggal_mulai->diffInDays(now());
            $progress = min(100, ($hari_selesai / $total_hari) * 100);

            $sertifikatData = $pesertaProfile->sertifikat;
            if ($sertifikatData) {
                $sertifikat = [
                    'id' => $sertifikatData->id,
                    'nomor_sertifikat' => $sertifikatData->nomor_sertifikat,
                    'tanggal_terbit' => $sertifikatData->tanggal_terbit,
                    'file_path' => $sertifikatData->file_path,
                    'approval_status' => $sertifikatData->approval_status,
                    'is_published' => $sertifikatData->is_published,
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
        // PERUBAHAN: Ambil SEMUA peserta, bukan hanya yang sudah ada sertifikat
        $pesertaProfiles = PesertaProfile::with(['user', 'sertifikat.approvedBy', 'penilaianAkhir'])
            ->paginate(10)
            ->through(function ($profile) {
                $sertifikat = $profile->sertifikat;
                $penilaian = $profile->penilaianAkhir;

                // Hitung completion logbook
                $logbookCompletion = $this->calculateLogbookCompletion($profile->id);

                $status = 'belum';
                if ($sertifikat && $sertifikat->file_path) {
                    $status = $sertifikat->is_published ? 'terbit' : 'proses';
                }

                return [
                    'id' => $sertifikat ? $sertifikat->id : $profile->id,
                    'peserta_profile_id' => $profile->id,
                    'nama_peserta' => $profile->user->name ?? '',
                    'tanggal_terbit' => $sertifikat && $sertifikat->tanggal_terbit
                        ? $sertifikat->tanggal_terbit->format('d F Y')
                        : '-',
                    'nomor_sertifikat' => $sertifikat ? $sertifikat->nomor_sertifikat : '-',
                    'file_path' => $sertifikat ? $sertifikat->file_path : null,
                    'status' => $status,
                    'approval_status' => $sertifikat ? $sertifikat->approval_status : 'pending',
                    'approved_at' => $sertifikat && $sertifikat->approved_at
                        ? $sertifikat->approved_at->format('d F Y H:i')
                        : null,
                    'approved_by' => $sertifikat && $sertifikat->approvedBy
                        ? $sertifikat->approvedBy->name
                        : null,
                    'can_approve' => $sertifikat && $sertifikat->file_path && $sertifikat->approval_status === 'pending',
                    'can_download' => $sertifikat && $sertifikat->file_path,
                    'nilai_total' => $penilaian ? $penilaian->nilai_total : null,
                    'logbook_completion' => $logbookCompletion,
                    'has_sertifikat' => $sertifikat !== null,
                    'generation_disabled' => $sertifikat ? $sertifikat->generation_disabled : false,
                    'is_published' => $sertifikat ? $sertifikat->is_published : false,
                ];
            });

        $activeTemplate = CertificateTemplate::where('is_active', true)->first();
        $activeTemplateUrl = null;
        if ($activeTemplate && $activeTemplate->page1_template_path) {
            $activeTemplateUrl = asset('storage/' . $activeTemplate->page1_template_path);
        }
        return Inertia::render('penilaianSertifikat/index', [
            'sertifikatData' => $pesertaProfiles,
            'viewMode' => 'certificate',
            'activeTemplateUrl' => $activeTemplateUrl,
            'activeTemplateName' => $activeTemplate ? $activeTemplate->name : null,
        ]);
    }

    public function picIndex()
    {
        // PERUBAHAN: Sama seperti adminIndex
        $pesertaProfiles = PesertaProfile::with(['user', 'sertifikat.approvedBy', 'penilaianAkhir'])
            ->paginate(10)
            ->through(function ($profile) {
                $sertifikat = $profile->sertifikat;
                $penilaian = $profile->penilaianAkhir;

                $logbookCompletion = $this->calculateLogbookCompletion($profile->id);

                $status = 'belum';
                if ($sertifikat && $sertifikat->file_path) {
                    $status = $sertifikat->is_published ? 'terbit' : 'proses';
                }

                return [
                    'id' => $sertifikat ? $sertifikat->id : $profile->id,
                    'peserta_profile_id' => $profile->id,
                    'nama_peserta' => $profile->user->name ?? '',
                    'tanggal_terbit' => $sertifikat && $sertifikat->tanggal_terbit
                        ? $sertifikat->tanggal_terbit->format('d F Y')
                        : '-',
                    'nomor_sertifikat' => $sertifikat ? $sertifikat->nomor_sertifikat : '-',
                    'file_path' => $sertifikat ? $sertifikat->file_path : null,
                    'status' => $status,
                    'approval_status' => $sertifikat ? $sertifikat->approval_status : 'pending',
                    'approved_at' => $sertifikat && $sertifikat->approved_at
                        ? $sertifikat->approved_at->format('d F Y H:i')
                        : null,
                    'approved_by' => $sertifikat && $sertifikat->approvedBy
                        ? $sertifikat->approvedBy->name
                        : null,
                    'can_approve' => $sertifikat && $sertifikat->file_path && $sertifikat->approval_status === 'pending',
                    'can_download' => $sertifikat && $sertifikat->file_path,
                    'nilai_total' => $penilaian ? $penilaian->nilai_total : null,
                    'logbook_completion' => $logbookCompletion,
                    'has_sertifikat' => $sertifikat !== null,
                    'generation_disabled' => $sertifikat ? $sertifikat->generation_disabled : false,
                    'is_published' => $sertifikat ? $sertifikat->is_published : false,
                ];
            });

        return Inertia::render('penilaianSertifikat/index', [
            'sertifikatData' => $pesertaProfiles,
            'viewMode' => 'certificate',
        ]);
    }

    public function uploadTemplate(Request $request)
    {
        $request->validate([
            'page1_template' => 'required|file|mimes:png,jpg,jpeg|max:5120',
            'template_name' => 'required|string|max:255',
        ]);

        CertificateTemplate::where('is_active', true)->update(['is_active' => false]);

        $page1Path = null;

        if ($request->hasFile('page1_template')) {
            $page1File = $request->file('page1_template');
            $page1Path = $page1File->store('certificate_templates', 'public');
        }

        $template = CertificateTemplate::create([
            'name' => $request->template_name,
            'page1_template_path' => $page1Path,
            'page2_template_path' => null,
            'is_active' => true,
            'config' => $request->config ?? null,
        ]);

        return back()->with('success', 'Template sertifikat berhasil disimpan.');
    }

    public function previewTemplate()
    {
        $activeTemplate = CertificateTemplate::where('is_active', true)->first();

        $page1Background = null;

        if ($activeTemplate && $activeTemplate->page1_template_path) {
            $page1Background = storage_path('app/public/' . $activeTemplate->page1_template_path);
        }

        $data = [
            'certificate_number' => '001/PKL-DISDIK-BMS/XII/2025',
            'participant_name' => 'Lorem Ipsum Dolor Sit Amet',
            'internship_duration' => 'Januari 2025 - Maret 2025 (3 Bulan)',
            'page1Background' => $page1Background,
            'result' => 92,
            'date_signed' => now()->translatedFormat('d F Y'),
        ];

        $pdf = $this->buildCertificatePdf($data);

        return $pdf->stream('preview-sertifikat.pdf');
    }

    public function generateFromPenilaian(Request $request, PenilaianAkhir $penilaian)
    {
        $profile = $penilaian->pesertaProfile;
        if (!$profile) {
            abort(404, 'Profil peserta tidak ditemukan.');
        }

        if ($profile->sertifikat && $profile->sertifikat->generation_disabled) {
            throw ValidationException::withMessages([
                'error' => 'Sertifikat final sudah diupload, generate otomatis tidak tersedia.',
            ]);
        }

        $logbookCompletion = $this->calculateLogbookCompletion($profile->id);
        $forceGenerate = $request->input('force_generate', false);

        // PERUBAHAN: Hanya warning, tidak block
        if ($logbookCompletion < 80 && !$forceGenerate) {
            throw ValidationException::withMessages([
                'requires_confirmation' => "Peserta memiliki logbook {$logbookCompletion}% (kurang dari 80%). Apakah tetap generate sertifikat?",
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
        $sertifikat->generation_disabled = false;
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

        if (!in_array($user->role, ['admin', 'pic'], true)) {
            if (!$sertifikat->pesertaProfile || $sertifikat->pesertaProfile->user_id !== $user->id) {
                abort(403, 'Anda tidak berhak mengakses sertifikat ini.');
            }
            if (!$sertifikat->is_published) {
                abort(403, 'Sertifikat belum dipublikasikan.');
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

    public function downloadTemplateExample()
    {
        $relativePath = 'template/template-template-sertifikat.png';

        if (!Storage::disk('public')->exists($relativePath)) {
            abort(404, 'File template sertifikat contoh tidak ditemukan.');
        }

        $fullPath = Storage::disk('public')->path($relativePath);

        return response()->download($fullPath, 'template-template.sertifikat.png');
    }

    public function previewCertificate(Sertifikat $sertifikat)
    {
        $user = auth()->user();
        if (!$user) {
            abort(401, 'Unauthorized');
        }

        if (!in_array($user->role, ['admin', 'pic'], true)) {
            if (!$sertifikat->pesertaProfile || $sertifikat->pesertaProfile->user_id !== $user->id) {
                abort(403, 'Anda tidak berhak mengakses sertifikat ini.');
            }
            if (!$sertifikat->is_published) {
                abort(403, 'Sertifikat belum dipublikasikan.');
            }
        }

        $path = $sertifikat->file_path;
        if (!$path) {
            return redirect()->back()->with('error', 'Sertifikat belum digenerate.');
        }

        $fullPath = storage_path('app/public/' . $path);
        if (!file_exists($fullPath)) {
            return redirect()->back()->with('error', 'File sertifikat tidak ditemukan.');
        }

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . basename($fullPath) . '"',
        ]);
    }

    public function regenerate(Request $request, Sertifikat $sertifikat)
    {
        if ($sertifikat->generation_disabled) {
            return redirect()->back()->with('error', 'Sertifikat final sudah diupload, generate otomatis tidak tersedia.');
        }

        $sertifikat->nomor_sertifikat = Sertifikat::generateNomorSertifikat();
        $sertifikat->tanggal_terbit = now()->toDateString();
        $sertifikat->is_published = false;
        $sertifikat->approval_status = 'pending';
        $sertifikat->file_path = 'certificates/' . $sertifikat->peserta_profile_id . '_' . time() . '.pdf';
        $sertifikat->generation_disabled = false;
        $sertifikat->save();

        $this->generateCertificatePdf($sertifikat);

        return redirect()->back()->with('success', 'Sertifikat berhasil diregenerasi dan menunggu persetujuan.');
    }

    public function destroy(Sertifikat $sertifikat)
    {
        if ($sertifikat->file_path) {
            Storage::disk('public')->delete($sertifikat->file_path);
        }

        $sertifikat->delete();

        return redirect()->back()->with('success', 'Sertifikat berhasil dihapus. Anda dapat generate ulang dari penilaian.');
    }

    public function validateCertificate(Request $request, Sertifikat $sertifikat)
    {
        $user = auth()->user();

        if (!$sertifikat->file_path) {
            return redirect()->back()->with('error', 'Sertifikat belum tersedia.');
        }

        if ($sertifikat->is_published) {
            $sertifikat->is_published = false;
            $sertifikat->approval_status = 'pending';
            $sertifikat->approved_at = null;
            $sertifikat->approved_by = null;
            $sertifikat->save();

            return redirect()->back()->with('success', 'Publikasi sertifikat dinonaktifkan dan status dikembalikan menjadi belum disetujui.');
        }

        if ($sertifikat->approval_status !== 'approved') {
            if ($user instanceof User) {
                $sertifikat->approve($user);
            } else {
                $sertifikat->is_published = true;
                $sertifikat->approval_status = 'approved';
                $sertifikat->approved_at = now();
                $sertifikat->save();
            }
        }

        $sertifikat->is_published = true;
        $sertifikat->save();

        return redirect()->back()->with('success', 'Sertifikat berhasil disetujui dan dipublikasikan.');
    }

    public function uploadSignedCertificate(Request $request, Sertifikat $sertifikat)
    {
        $request->validate([
            'signed_certificate' => 'required|file|mimes:pdf|max:10240',
        ]);

        if ($sertifikat->file_path) {
            Storage::disk('public')->delete($sertifikat->file_path);
        }

        $file = $request->file('signed_certificate');
        $path = $file->store('signed_certificates', 'public');

        $user = auth()->user();

        $sertifikat->file_path = $path;
        $sertifikat->generation_disabled = true;
        if ($sertifikat->approval_status !== 'approved') {
            if ($user instanceof User) {
                $sertifikat->approve($user);
            } else {
                $sertifikat->approval_status = 'approved';
                $sertifikat->approved_at = now();
            }
        }
        $sertifikat->is_published = false;
        $sertifikat->save();

        return redirect()->back()->with('success', 'Sertifikat bertanda tangan berhasil diupload. Gunakan toggle untuk mengatur publikasi.');
    }

    protected function calculateLogbookCompletion($pesertaProfileId): float
    {
        $totalLogbook = Logbook::where('peserta_profile_id', $pesertaProfileId)->count();

        if ($totalLogbook === 0) {
            return 0;
        }

        $completedLogbook = Logbook::where('peserta_profile_id', $pesertaProfileId)
            ->where('status', 'disetujui')
            ->count();

        return round(($completedLogbook / $totalLogbook) * 100, 2);
    }

    protected function validateLogbookCompletion($pesertaProfileId): bool
    {
        // PERUBAHAN: Method ini sekarang hanya mengembalikan status, tidak memblock
        return $this->calculateLogbookCompletion($pesertaProfileId) >= 80;
    }

    protected function numberToWords(int $number): string
    {
        $fmt = new NumberFormatter('id', NumberFormatter::SPELLOUT);
        return $fmt->format($number);
    }


    protected function generateCertificatePdf(Sertifikat $sertifikat): void
    {
        $profile = $sertifikat->pesertaProfile;
        $user = $profile ? $profile->user : null;
        $penilaian = $profile ? $profile->penilaianAkhir : null;

        $startDate = $profile ? Carbon::parse($profile->tanggal_mulai) : null;
        $endDate   = $profile ? Carbon::parse($profile->tanggal_selesai) : null;

        // =============================
        // DURASI RESMI (BULAN + HARI)
        // =============================
        $durationLabel = '';

        if ($startDate && $endDate) {
            $diff = $startDate->diff($endDate);

            $months = ($diff->y * 12) + $diff->m;
            $days   = $diff->d;

            $bulanText = $months > 0
                ? $this->numberToWords($months) . ' bulan'
                : '';

            $hariText = $days > 0
                ? $this->numberToWords($days) . ' hari'
                : '';

            $durationText = trim($bulanText . ' ' . $hariText);

            $startFormatted = $startDate->translatedFormat('d F');
            $endFormatted   = $endDate->translatedFormat('d F Y');

            $durationLabel =
                $durationText .
                ' sejak tanggal ' .
                $startFormatted .
                ' sampai dengan ' .
                $endFormatted;
        }

        // =============================
        // HASIL PENILAIAN
        // =============================
        $result = null;
        if ($penilaian && $penilaian->nilai_total !== null) {
            $result = (float) $penilaian->nilai_total;
        }

        // =============================
        // TANGGAL TTD
        // =============================
        $dateSigned = null;
        if ($sertifikat->approved_at) {
            $dateSigned = $sertifikat->approved_at->translatedFormat('d F Y');
        }

        // =============================
        // TEMPLATE AKTIF
        // =============================
        $activeTemplate = CertificateTemplate::where('is_active', true)->first();

        $page1Background = null;
        if ($activeTemplate && $activeTemplate->page1_template_path) {
            $page1Background = storage_path('app/public/' . $activeTemplate->page1_template_path);
        }

        // =============================
        // DATA KE PDF
        // =============================
        $data = [
            'certificate_number'   => $sertifikat->nomor_sertifikat,
            'participant_name'     => $user ? $user->name : '',
            'internship_duration'  => $durationLabel,
            'page1Background'      => $page1Background,
            'result'               => $result,
            'date_signed'          => $dateSigned,
        ];

        // =============================
        // GENERATE PDF
        // =============================
        $pdf = $this->buildCertificatePdf($data);

        Storage::disk('public')->put($sertifikat->file_path, $pdf->output());
    }


    protected function buildCertificatePdf(array $data)
    {
        return Pdf::loadView('certificates.certificate', $data)
            ->setPaper('a4', 'landscape')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('enable_php', true)
            ->setOption('dpi', 150);
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
            'sertifikat_ids.*' => 'exists:peserta_profiles,id', // PERUBAHAN: Validate peserta_profile_id
            'force_generate' => 'nullable|boolean',
        ]);

        $generated = [];
        $failed = [];
        $requiresConfirmation = [];
        $forceGenerate = $request->input('force_generate', false);

        foreach ($request->sertifikat_ids as $profileId) {
            try {
                $profile = PesertaProfile::find($profileId);
                if (!$profile) {
                    $failed[] = ['id' => $profileId, 'reason' => 'Profil peserta tidak ditemukan'];
                    continue;
                }

                if ($profile->sertifikat && $profile->sertifikat->generation_disabled) {
                    $failed[] = ['id' => $profileId, 'reason' => 'Sertifikat final sudah diupload'];
                    continue;
                }

                $logbookCompletion = $this->calculateLogbookCompletion($profileId);

                if ($logbookCompletion < 80 && !$forceGenerate) {
                    $requiresConfirmation[] = $profileId;
                    continue;
                }

                // Generate atau regenerate sertifikat
                $sertifikat = $profile->sertifikat ?: new Sertifikat();
                $sertifikat->peserta_profile_id = $profileId;

                if (!$sertifikat->exists) {
                    $sertifikat->nomor_sertifikat = Sertifikat::generateNomorSertifikat();
                }

                $sertifikat->tanggal_terbit = now()->toDateString();
                $sertifikat->is_published = false;
                $sertifikat->approval_status = 'pending';
                $sertifikat->file_path = 'certificates/' . $profileId . '_' . time() . '.pdf';
                $sertifikat->save();

                $this->generateCertificatePdf($sertifikat);
                $generated[] = $profileId;
            } catch (\Exception $e) {
                $failed[] = ['id' => $profileId, 'reason' => $e->getMessage()];
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
