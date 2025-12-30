<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Sertifikat Magang</title>
    <link href="https://fonts.cdnfonts.com/css/arial-mt" rel="stylesheet">

    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }

        html,
        body {
            width: 297mm;
            height: 210mm;
            margin: 0;
            padding: 0;
            font-family: "Times New Roman", serif;
            overflow: hidden;
        }

        .page {
            position: relative;
            width: 297mm;
            height: 210mm;
        }

        .background {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
        }

        .content {
            position: absolute;
            inset: 0;
            z-index: 5;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 40mm 25mm;
            box-sizing: border-box;
        }

        .certificate-number {
            font-size: 28px;
            font-weight: 150;
            letter-spacing: 3px;
            text-transform: uppercase;
            display: block;
            padding-bottom: 4px;
            margin-top: 170px;
        }

        .participant-name {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 3px;
            text-transform: uppercase;
            display: inline-block;
            padding-bottom: 4px;
            border-bottom: 1.5px solid #000;
            margin-top: 110px;
        }

        .description {
            font-size: 32px;
            line-height: 1.2;
            max-width: 1500px;
            text-align: center;
            margin-left: auto;
            margin-right: auto;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .duration {
            font-weight: bold;
        }

        .result-category {
            font-size: 36px;
            margin-top: 20px;
            text-transform: uppercase;
            font-weight: bold;
        }

        .date-signed {
            display: block;
            margin-top: 6px;
            font-size: 25.4px;
            letter-spacing: 1px;
            transform: translate(420px, 5.2px);
            font-family: ArialMT;
        }

        .footer {
            position: absolute;
            bottom: 15mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #555;
        }
    </style>
</head>

<body>
    <div class="page">
        @if ($page1Background && file_exists($page1Background))
        <img src="{{ $page1Background }}" class="background">
        @else
        <div class="background" style="background:#f2f2f2;"></div>
        @endif



        <div class="content">
            @php
            $resultCategory = null;
            if (isset($result)) {
            $value = is_numeric($result) ? (float) $result : null;
            if ($value === null) {
            $resultCategory = (string) $result;
            } elseif ($value >= 90) {
            $resultCategory = 'Sangat Baik';
            } elseif ($value >= 80) {
            $resultCategory = 'Baik';
            } elseif ($value >= 70) {
            $resultCategory = 'Cukup';
            } elseif ($value >= 60) {
            $resultCategory = 'Kurang';
            } else {
            $resultCategory = 'Sangat Kurang';
            }
            }
            @endphp

            <div class="certificate-number">
                <span>Nomor:</span>
                <span>{{ $certificate_number }}</span>
            </div>

            <div class="participant-name">{{ $participant_name }}</div>

            <div class="description">
                Telah menyelesaikan Praktik Kerja Lapangan di Dinas Pendidikan Kabupaten Banyumas
                <br>pada periode<span class="duration"> {{ $internship_duration }}</span> dengan hasil
            </div>

            <div class="result-category">{{ $resultCategory }}</div>

            @if (!empty($date_signed))
            <span class="date-signed">{{ $date_signed }}</span>
            @endif
        </div>

        <div class="footer">
            Sertifikat ini diterbitkan sebagai bukti telah menyelesaikan program magang
        </div>
    </div>
</body>

</html>