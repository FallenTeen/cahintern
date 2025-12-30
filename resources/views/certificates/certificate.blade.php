<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Sertifikat Magang</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
        }

        .page {
            position: relative;
            width: 297mm;
            height: 210mm;
            padding: 0;
            margin: 0;
            page-break-after: always;
            overflow: hidden;
        }

        /* Background image menggunakan position absolute dengan tag img */
        .page-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 297mm;
            height: 210mm;
            z-index: 0;
        }

        .page-background img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Content layer di atas background */
        .certificate-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1;
            padding: 40px 60px;
        }

        .certificate-header {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 3px;
            margin-top: 40px;
            margin-bottom: 12px;
            text-transform: uppercase;
            text-align: center;
        }

        .certificate-title {
            font-size: 46px;
            font-weight: bold;
            margin-bottom: 24px;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-align: center;
        }

        .certificate-text {
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 18px;
            text-align: center;
        }

        .participant-name {
            font-size: 32px;
            font-weight: bold;
            margin: 25px 0;
            text-decoration: underline;
            font-style: italic;
        }

        .certificate-number {
            font-size: 14px;
            margin-top: 40px;
            font-style: italic;
        }

        .internship-duration {
            font-size: 16px;
            margin: 20px 0;
        }

        .signature-section {
            margin-top: 50px;
            display: table;
            width: 100%;
        }

        .signature-box {
            display: table-cell;
            text-align: center;
            width: 50%;
            padding: 0 40px;
        }

        .signature-line {
            margin-top: 60px;
            border-top: 2px solid #333;
            padding-top: 5px;
            font-weight: bold;
        }

        /* Halaman 2 - Tabel Penilaian */
        .page-2-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            padding: 40px 50px;
        }

        .section-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 30px;
            text-transform: uppercase;
        }

        .participant-info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 16px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-family: 'Arial', sans-serif;
        }

        th, td {
            border: 2px solid #333;
            padding: 12px 15px;
            font-size: 16px;
        }

        th {
            background-color: #4472C4;
            color: white;
            font-weight: bold;
            text-align: center;
        }

        td {
            text-align: left;
            background-color: white;
        }

        td:last-child {
            text-align: center;
            font-weight: bold;
        }

        tr:nth-child(even) td {
            background-color: #f9f9f9;
        }

        .total-row td {
            background-color: #D9E2F3 !important;
            font-weight: bold;
        }

        .predicate-row td {
            background-color: #FFE699 !important;
            font-weight: bold;
        }

        .footer-note {
            margin-top: 40px;
            text-align: center;
            font-size: 14px;
            font-style: italic;
        }
    </style>
</head>
<body>
<!-- Halaman 1: Sertifikat -->
<div class="page">
    @if($page1Background)
    <div class="page-background">
        <img src="{{ $page1Background }}" alt="Background">
    </div>
    @endif
    
    <div class="certificate-content">
        <div class="certificate-header">Sertifikat Penghargaan</div>
        
        <div class="certificate-title">SERTIFIKAT MAGANG</div>
        
        <div class="certificate-text">
            Diberikan kepada:
        </div>
        
        <div class="participant-name">{{ $participant_name }}</div>
        
        <div class="certificate-text">
            Yang telah menyelesaikan program magang dengan baik<br>
            dan memenuhi seluruh persyaratan yang ditentukan
        </div>
        
        <div class="internship-duration">
            Periode Magang: {{ $internship_duration }}
        </div>
        
        <div class="certificate-number">
            No. Sertifikat: {{ $certificate_number }}
        </div>
        
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line">
                    Pembimbing Magang
                </div>
            </div>
            <div class="signature-box">
                <div class="signature-line">
                    Direktur/Pimpinan
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Halaman 2: Tabel Penilaian -->
<div class="page">
    @if($page2Background)
    <div class="page-background">
        <img src="{{ $page2Background }}" alt="Background">
    </div>
    @endif
    
    <div class="page-2-content">
        <div class="section-title">Rangkuman Nilai Penilaian Akhir</div>
        
        <div class="participant-info">
            <strong>Nama:</strong> {{ $participant_name }}<br>
            <strong>Nomor Sertifikat:</strong> {{ $certificate_number }}
        </div>
        
        <table>
            <thead>
            <tr>
                <th style="width: 70%">Komponen Penilaian</th>
                <th style="width: 30%">Nilai</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Disiplin</td>
                <td>{{ $scores['nilai_disiplin'] }}</td>
            </tr>
            <tr>
                <td>Kerja Sama</td>
                <td>{{ $scores['nilai_kerjasama'] }}</td>
            </tr>
            <tr>
                <td>Inisiatif</td>
                <td>{{ $scores['nilai_inisiatif'] }}</td>
            </tr>
            <tr>
                <td>Komunikasi</td>
                <td>{{ $scores['nilai_komunikasi'] }}</td>
            </tr>
            <tr>
                <td>Teknis</td>
                <td>{{ $scores['nilai_teknis'] }}</td>
            </tr>
            <tr>
                <td>Kreativitas</td>
                <td>{{ $scores['nilai_kreativitas'] }}</td>
            </tr>
            <tr>
                <td>Tanggung Jawab</td>
                <td>{{ $scores['nilai_tanggung_jawab'] }}</td>
            </tr>
            <tr>
                <td>Kehadiran</td>
                <td>{{ $scores['nilai_kehadiran'] }}</td>
            </tr>
            <tr class="total-row">
                <td>Nilai Total</td>
                <td>{{ $scores['nilai_total'] }}</td>
            </tr>
            <tr class="predicate-row">
                <td>Predikat</td>
                <td>{{ $scores['predikat'] }}</td>
            </tr>
            </tbody>
        </table>
        
        <div class="footer-note">
            * Sertifikat ini diterbitkan sebagai bukti telah menyelesaikan program magang
        </div>
    </div>
</div>
</body>
</html>
