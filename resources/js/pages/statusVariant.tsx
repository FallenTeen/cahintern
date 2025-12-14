import { Badge } from '@/components/ui/badge';

export function statusVariant(status: string) {
    const styleMap: Record<string, string> = {
        'Menunggu Persetujuan': 'bg-yellow-400 text-black',
        'Perlu Revisi': 'bg-blue-500 text-white',
        Disetujui: 'bg-green-500 text-white',
        Ditolak: 'bg-red-500 text-white',
    };

    const labelMap: Record<string, string> = {
        pending: 'Menunggu Persetujuan',
        revision: 'Perlu Revisi',
        disetujui: 'Disetujui',
        ditolak: 'Ditolak',
    };

    return (
        <Badge className={styleMap[status] ?? 'bg-gray-100 text-gray-800'}>
            {labelMap[status] ?? status}
        </Badge>
    );
}
