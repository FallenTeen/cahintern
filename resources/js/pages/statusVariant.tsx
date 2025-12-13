import { Badge } from '@/components/ui/badge';

export function statusVariant(status: string) {
    const styleMap: Record<string, string> = {
        'Menunggu Persetujuan': 'bg-yellow-100 text-yellow-800',
        'Perlu Revisi': 'bg-blue-100 text-blue-800',
        Disetujui: 'bg-green-100 text-green-800',
        Ditolak: 'bg-red-100 text-red-800',
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
