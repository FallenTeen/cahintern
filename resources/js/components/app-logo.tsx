import logoImage from '../../../public/logoDindik.svg';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <img
                        src={logoImage}
                        alt="Dinas Pendidikan Banyumas"
                        className="h-10 w-10 object-contain"
                    />
                </div>
                <div>
                    <h1 className="text-lg font-semibold">Dinas Pendidikan</h1>
                    <p className="text-sm opacity-80">Kabupaten Banyumas</p>
                </div>
            </div>
        </>
    );
}
