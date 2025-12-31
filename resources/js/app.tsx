import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#006affff',
    },
});

if (typeof window !== 'undefined') {
    console.log(
        '%cWebsite ini dibuat oleh Mahasiswa Magang\nDinas Pendidikan Kabupaten Banyumas\n2025 – Amikom Purwokerto',
        'color:#16a34a;font-size:14px;font-weight:600;',
    );
}

document.documentElement.classList.remove('dark');
localStorage.setItem('appearance', 'light');
