import { Badge } from '@/components/ui/badge';

type StatusAbsensi = 'hadir' | 'izin' | 'sakit' | 'terlambat' | string;

export function statusAbsensi(status: StatusAbsensi) {
    const styleMap: Record<string, string> = {
        hadir: 'bg-green-500 text-white',
        izin: 'bg-yellow-400 text-white',
        sakit: 'bg-blue-500 text-white',
        terlambat: 'bg-red-500 text-white',
    };

    const labelMap: Record<string, string> = {
        hadir: 'Hadir',
        izin: 'Izin',
        sakit: 'Sakit',
        terlambat: 'Terlambat',
    };

    const key = status?.toLowerCase?.() ?? '';

    return (
        <Badge className={styleMap[key] ?? 'bg-gray-100 text-gray-800'}>
            {labelMap[key] ?? status}
        </Badge>
    );
}