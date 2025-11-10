import { GraduationCap } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2">
                    <GraduationCap className="h-5 w-5 text-red-600" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold">Dinas Pendidikan</h1>
                    <p className="text-sm opacity-80">Kabupaten Banyumas</p>
                </div>
            </div>
        </>
    );
}
