<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Sertifikat Magang</title>
    <link href="https://fonts.cdnfonts.com/css/arial-mt" rel="stylesheet">
                

    <style>
        /* === PAGE SETUP (WAJIB) === */
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

        /* === CONTAINER UTAMA === */
        .page {
            position: relative;
            width: 297mm;
            height: 210mm;
            page-break-after: never;
        }

        /* === BACKGROUND === */
        .background {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
        }

        /* === CONTENT === */
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

        /* === NOMOR SERTIFIKAT === */
        .certificate-number {
            position: absolute;
            top: 20mm;
            right: 25mm;
            font-size: 14px;
            font-weight: 600;
        }

        /* === TEXT STYLES === */
        .title {
            font-size: 52px;
            font-weight: bold;
            letter-spacing: 6px;
            margin-bottom: 10px;
        }

        .subtitle {
            font-size: 20px;
            letter-spacing: 3px;
            font-style: italic;
            color: #555;
            margin-bottom: 30px;
        }

        .given-to {
            font-size: 18px;
            letter-spacing: 3px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .participant-name {
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 3px;
            text-transform: uppercase;

            display: inline-block;
            padding-bottom: 4px;
            border-bottom: 1px solid #000;

            margin-top: 185px;
        }


        .description {
            font-size: 18px;
            line-height: 1.2;
            max-width: 900px;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .duration-label {
            font-size: 16px;
            letter-spacing: 2px;
            font-weight: bold;
            margin-top: 15px;
        }

        .duration {
            font-size: 20px;
            font-weight: bold;
            margin-top: 5px;
        }

        .result-label {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-right: 4px;
        }

        .result-category {
            font-size: 25px;
            text-transform: uppercase;
            font-weight: bold;
        }

        .date-signed {
            display: block;
            margin-top: 6px;
            font-size: 15.2px;
            letter-spacing: 1px;
            transform: translate(265px, 2px);
            font-family: "ArialMT";
        }

        /* === FOOTER === */
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

        @if($page1Background && file_exists($page1Background))
        <img src="{{ $page1Background }}" class="background">
        @else
        <div class="background" style="background:#f2f2f2;"></div>
        @endif

        <div class="certificate-number">
            No: {{ $certificate_number }}
        </div>

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

            <div class="participant-name">{{ $participant_name }}</div>

            <div class="description">
                Telah menyelesaikan Praktik Kerja Lapangan di Dinas Pendidikan Kabupaten Banyumas
                <br>pada periode<span class="duration"> {{ $internship_duration }}</span> dengan hasil
                <br>
            </div>
            <span class="result-category">{{ $resultCategory }}</span>
            <span class="date-signed">{{ $date_signed }}</span>

        </div>

        <div class="footer">
            Sertifikat ini diterbitkan sebagai bukti telah menyelesaikan program magang
        </div>
    </div>
</body>

</html>
