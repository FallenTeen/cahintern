<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sertifikat Magang</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
            size: A4 landscape;
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
            width: 297mm;
            height: 210mm;
            position: relative;
            overflow: hidden;
        }
        
        .background {
            position: absolute;
            top: 0;
            left: 0;
            width: 297mm;
            height: 210mm;
            object-fit: cover;
            z-index: 0;
        }
        
        .content {
            position: relative;
            z-index: 1;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 60px 80px;
        }
        
        .certificate-number {
            position: absolute;
            top: 40px;
            right: 80px;
            font-size: 16px;
            color: #333;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .title {
            text-align: center;
            font-size: 56px;
            font-weight: bold;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 10px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .subtitle {
            text-align: center;
            font-size: 20px;
            color: #555;
            margin-bottom: 60px;
            font-style: italic;
            letter-spacing: 2px;
        }
        
        .given-to {
            text-align: center;
            font-size: 18px;
            color: #666;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .participant-name {
            text-align: center;
            font-size: 42px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 40px;
            text-transform: uppercase;
            letter-spacing: 3px;
            border-bottom: 4px solid #0066cc;
            padding-bottom: 15px;
            min-width: 600px;
            text-shadow: 1px 1px 2px rgba(0, 102, 204, 0.2);
        }
        
        .description {
            text-align: center;
            font-size: 18px;
            line-height: 2;
            color: #333;
            max-width: 900px;
            margin: 0 auto 40px;
            background: rgba(255, 255, 255, 0.85);
            padding: 30px 40px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .duration-label {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .duration {
            font-size: 20px;
            color: #0066cc;
            font-weight: 700;
            letter-spacing: 1px;
        }
        
        .footer {
            position: absolute;
            bottom: 40px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #888;
            background: rgba(255, 255, 255, 0.8);
            padding: 10px;
        }
    </style>
</head>
<body>
    @if($page1Background && file_exists($page1Background))
        <img src="{{ $page1Background }}" class="background" alt="Certificate Background">
    @else
        <div class="background" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
    @endif
    
    <div class="content">
        <div class="certificate-number">
            No: {{ $certificate_number }}
        </div>
        
        <div class="title">
            SERTIFIKAT MAGANG
        </div>
        
        <div class="subtitle">
            Certificate of Internship
        </div>
        
        <div class="given-to">
            Diberikan Kepada
        </div>
        
        <div class="participant-name">
            {{ $participant_name }}
        </div>
        
        <div class="description">
            Telah menyelesaikan program magang dengan baik dan menunjukkan dedikasi, 
            profesionalisme, serta kompetensi yang memadai selama periode magang.
            <div style="margin-top: 25px;">
                <div class="duration-label">Periode Magang</div>
                <div class="duration">{{ $internship_duration }}</div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        Sertifikat ini diterbitkan sebagai bukti telah menyelesaikan program magang
    </div>
</body>
</htm