<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenilaianAkhir extends Model
{
    use HasFactory;

    protected $table = 'penilaian_akhir';

    protected $fillable = [
        'pengajuan_magang_id',
        'penilai_id',
        'tanggal_penilaian',
        'nilai_kedisiplinan',
        'nilai_kerjasama',
        'nilai_inisiatif',
        'nilai_komunikasi',
        'nilai_teknis',
        'nilai_kreativitas',
        'nilai_tanggung_jawab',
        'nilai_kehadiran',
        'nilai_total',
        'grade',
        'komentar',
        'rekomendasi',
        'area_improvement',
        'strengths',
        'future_potential',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'tanggal_penilaian' => 'date',
        'approved_at' => 'datetime',
        'area_improvement' => 'array',
        'strengths' => 'array',
        'nilai_kedisiplinan' => 'decimal:2',
        'nilai_kerjasama' => 'decimal:2',
        'nilai_inisiatif' => 'decimal:2',
        'nilai_komunikasi' => 'decimal:2',
        'nilai_teknis' => 'decimal:2',
        'nilai_kreativitas' => 'decimal:2',
        'nilai_tanggung_jawab' => 'decimal:2',
        'nilai_kehadiran' => 'decimal:2',
        'nilai_total' => 'decimal:2',
    ];

    /**
     * Relationship: PenilaianAkhir belongs to PengajuanMagang
     */
    public function pengajuanMagang()
    {
        return $this->belongsTo(PengajuanMagang::class);
    }

    /**
     * Relationship: PenilaianAkhir belongs to User (penilai)
     */
    public function penilai()
    {
        return $this->belongsTo(User::class, 'penilai_id');
    }

    /**
     * Relationship: PenilaianAkhir belongs to User (approved by)
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Calculate total score from individual components
     */
    public function calculateTotalScore(): float
    {
        $components = [
            'nilai_kedisiplinan' => 0.15,    // 15%
            'nilai_kerjasama' => 0.15,       // 15%
            'nilai_inisiatif' => 0.10,       // 10%
            'nilai_komunikasi' => 0.15,      // 15%
            'nilai_teknis' => 0.20,          // 20%
            'nilai_kreativitas' => 0.10,     // 10%
            'nilai_tanggung_jawab' => 0.10,  // 10%
            'nilai_kehadiran' => 0.05,       // 5%
        ];
        
        $totalScore = 0;
        foreach ($components as $component => $weight) {
            $totalScore += ($this->$component ?? 0) * $weight;
        }
        
        return round($totalScore, 2);
    }

    /**
     * Determine grade based on total score
     */
    public function determineGrade(): string
    {
        $score = $this->nilai_total ?? $this->calculateTotalScore();
        
        return match(true) {
            $score >= 90 => 'A',
            $score >= 80 => 'B',
            $score >= 70 => 'C',
            $score >= 60 => 'D',
            default => 'E'
        };
    }

    /**
     * Get grade description
     */
    public function getGradeDescriptionAttribute(): string
    {
        return match($this->grade) {
            'A' => 'Sangat Baik (90-100)',
            'B' => 'Baik (80-89)',
            'C' => 'Cukup (70-79)',
            'D' => 'Kurang (60-69)',
            'E' => 'Sangat Kurang (<60)',
            default => 'Belum Dinilai'
        };
    }

    /**
     * Get grade color class
     */
    public function getGradeColorClassAttribute(): string
    {
        return match($this->grade) {
            'A' => 'text-success',
            'B' => 'text-info',
            'C' => 'text-warning',
            'D' => 'text-orange',
            'E' => 'text-danger',
            default => 'text-muted'
        };
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute(): string
    {
        return match($this->status) {
            'draft' => 'badge-secondary',
            'submitted' => 'badge-warning',
            'approved' => 'badge-success',
            'rejected' => 'badge-danger',
            default => 'badge-light'
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'draft' => 'Draft',
            'submitted' => 'Menunggu Persetujuan',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            default => 'Tidak Diketahui'
        };
    }

    /**
     * Get performance level based on total score
     */
    public function getPerformanceLevelAttribute(): string
    {
        $score = $this->nilai_total ?? 0;
        
        return match(true) {
            $score >= 90 => 'Excellent',
            $score >= 80 => 'Good',
            $score >= 70 => 'Satisfactory',
            $score >= 60 => 'Needs Improvement',
            default => 'Unsatisfactory'
        };
    }

    /**
     * Get component scores as array
     */
    public function getComponentScoresAttribute(): array
    {
        return [
            'Kedisiplinan' => $this->nilai_kedisiplinan ?? 0,
            'Kerjasama' => $this->nilai_kerjasama ?? 0,
            'Inisiatif' => $this->nilai_inisiatif ?? 0,
            'Komunikasi' => $this->nilai_komunikasi ?? 0,
            'Teknis' => $this->nilai_teknis ?? 0,
            'Kreativitas' => $this->nilai_kreativitas ?? 0,
            'Tanggung Jawab' => $this->nilai_tanggung_jawab ?? 0,
            'Kehadiran' => $this->nilai_kehadiran ?? 0,
        ];
    }

    /**
     * Get strengths as formatted string
     */
    public function getFormattedStrengthsAttribute(): string
    {
        if (is_array($this->strengths)) {
            return implode(', ', $this->strengths);
        }
        return $this->strengths ?? '';
    }

    /**
     * Get area improvement as formatted string
     */
    public function getFormattedAreaImprovementAttribute(): string
    {
        if (is_array($this->area_improvement)) {
            return implode(', ', $this->area_improvement);
        }
        return $this->area_improvement ?? '';
    }

    /**
     * Check if evaluation is complete
     */
    public function isComplete(): bool
    {
        $requiredFields = [
            'nilai_kedisiplinan', 'nilai_kerjasama', 'nilai_inisiatif',
            'nilai_komunikasi', 'nilai_teknis', 'nilai_kreativitas',
            'nilai_tanggung_jawab', 'nilai_kehadiran'
        ];
        
        foreach ($requiredFields as $field) {
            if (is_null($this->$field) || $this->$field < 0) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Validate scores
     */
    public function validateScores(): array
    {
        $errors = [];
        $scoreFields = [
            'nilai_kedisiplinan' => 'Kedisiplinan',
            'nilai_kerjasama' => 'Kerjasama',
            'nilai_inisiatif' => 'Inisiatif',
            'nilai_komunikasi' => 'Komunikasi',
            'nilai_teknis' => 'Teknis',
            'nilai_kreativitas' => 'Kreativitas',
            'nilai_tanggung_jawab' => 'Tanggung Jawab',
            'nilai_kehadiran' => 'Kehadiran',
        ];
        
        foreach ($scoreFields as $field => $label) {
            $value = $this->$field;
            if (is_null($value)) {
                $errors[] = "Nilai {$label} harus diisi";
            } elseif ($value < 0 || $value > 100) {
                $errors[] = "Nilai {$label} harus antara 0-100";
            }
        }
        
        return $errors;
    }

    /**
     * Auto-calculate scores based on attendance and logbook data
     */
    public function autoCalculateScores(): void
    {
        $pengajuan = $this->pengajuanMagang;
        
        // Calculate attendance score
        $attendanceRate = $pengajuan->attendance_rate ?? 0;
        $this->nilai_kehadiran = min(100, $attendanceRate);
        
        // Calculate discipline score based on attendance and punctuality
        $lateCount = $pengajuan->absensi()->where('status', 'terlambat')->count();
        $totalAttendance = $pengajuan->absensi()->count();
        $punctualityRate = $totalAttendance > 0 ? (($totalAttendance - $lateCount) / $totalAttendance) * 100 : 100;
        $this->nilai_kedisiplinan = min(100, ($attendanceRate + $punctualityRate) / 2);
        
        // Calculate technical score based on logbook ratings
        $avgLogbookRating = $pengajuan->logbook()->where('rating', '>', 0)->avg('rating') ?? 0;
        $this->nilai_teknis = ($avgLogbookRating / 5) * 100;
        
        // Set default values for other components (to be manually adjusted)
        $this->nilai_kerjasama = $this->nilai_kerjasama ?? 75;
        $this->nilai_inisiatif = $this->nilai_inisiatif ?? 75;
        $this->nilai_komunikasi = $this->nilai_komunikasi ?? 75;
        $this->nilai_kreativitas = $this->nilai_kreativitas ?? 75;
        $this->nilai_tanggung_jawab = $this->nilai_tanggung_jawab ?? 75;
        
        // Calculate total and grade
        $this->nilai_total = $this->calculateTotalScore();
        $this->grade = $this->determineGrade();
    }

    /**
     * Submit evaluation
     */
    public function submit(): bool
    {
        if (!$this->isComplete()) {
            return false;
        }
        
        $this->nilai_total = $this->calculateTotalScore();
        $this->grade = $this->determineGrade();
        $this->status = 'submitted';
        $this->save();
        
        // Create notification for admin
        Notifikasi::create([
            'user_id' => $this->penilai_id,
            'title' => 'Penilaian Akhir Disubmit',
            'message' => "Penilaian akhir untuk {$this->pengajuanMagang->user->name} telah disubmit dan menunggu persetujuan.",
            'type' => 'evaluation_submitted',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Approve evaluation
     */
    public function approve(User $approver): bool
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);
        
        // Create notification for student
        Notifikasi::create([
            'user_id' => $this->pengajuanMagang->user_id,
            'title' => 'Penilaian Akhir Disetujui',
            'message' => "Penilaian akhir magang Anda telah disetujui dengan nilai {$this->nilai_total} (Grade: {$this->grade}).",
            'type' => 'evaluation_approved',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Reject evaluation
     */
    public function reject(User $rejector, string $reason): bool
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $rejector->id,
            'approved_at' => now(),
            'komentar' => $reason,
        ]);
        
        // Create notification for evaluator
        Notifikasi::create([
            'user_id' => $this->penilai_id,
            'title' => 'Penilaian Akhir Ditolak',
            'message' => "Penilaian akhir untuk {$this->pengajuanMagang->user->name} ditolak. Alasan: {$reason}",
            'type' => 'evaluation_rejected',
            'is_read' => false,
        ]);
        
        return true;
    }

    /**
     * Get evaluation summary
     */
    public function getEvaluationSummary(): array
    {
        return [
            'total_score' => $this->nilai_total,
            'grade' => $this->grade,
            'performance_level' => $this->performance_level,
            'strengths' => $this->strengths ?? [],
            'improvements' => $this->area_improvement ?? [],
            'recommendation' => $this->rekomendasi,
            'component_scores' => $this->component_scores,
            'status' => $this->status_label,
        ];
    }

    /**
     * Scope: Only approved evaluations
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope: Only submitted evaluations
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope: Filter by grade
     */
    public function scopeByGrade($query, $grade)
    {
        return $query->where('grade', $grade);
    }

    /**
     * Scope: High performers (Grade A or B)
     */
    public function scopeHighPerformers($query)
    {
        return $query->whereIn('grade', ['A', 'B']);
    }

    /**
     * Scope: Filter by score range
     */
    public function scopeByScoreRange($query, $minScore, $maxScore)
    {
        return $query->whereBetween('nilai_total', [$minScore, $maxScore]);
    }

    /**
     * Get statistics for evaluations
     */
    public static function getEvaluationStatistics(): array
    {
        $evaluations = self::approved()->get();
        
        return [
            'total_evaluations' => $evaluations->count(),
            'average_score' => $evaluations->avg('nilai_total') ?: 0,
            'grade_distribution' => [
                'A' => $evaluations->where('grade', 'A')->count(),
                'B' => $evaluations->where('grade', 'B')->count(),
                'C' => $evaluations->where('grade', 'C')->count(),
                'D' => $evaluations->where('grade', 'D')->count(),
                'E' => $evaluations->where('grade', 'E')->count(),
            ],
            'highest_score' => $evaluations->max('nilai_total') ?: 0,
            'lowest_score' => $evaluations->min('nilai_total') ?: 0,
            'component_averages' => [
                'kedisiplinan' => $evaluations->avg('nilai_kedisiplinan') ?: 0,
                'kerjasama' => $evaluations->avg('nilai_kerjasama') ?: 0,
                'inisiatif' => $evaluations->avg('nilai_inisiatif') ?: 0,
                'komunikasi' => $evaluations->avg('nilai_komunikasi') ?: 0,
                'teknis' => $evaluations->avg('nilai_teknis') ?: 0,
                'kreativitas' => $evaluations->avg('nilai_kreativitas') ?: 0,
                'tanggung_jawab' => $evaluations->avg('nilai_tanggung_jawab') ?: 0,
                'kehadiran' => $evaluations->avg('nilai_kehadiran') ?: 0,
            ],
        ];
    }
}