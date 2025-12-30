import logoImage from '../../../public/logoDindik.svg';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center gap-3">
                <div className="p-2">
                    <img
                        src={logoImage}
                        alt="Dinas Pendidikan Banyumas"
                        className="h-[30px] w-full rounded-xl object-cover md:h-[30px]"
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
