import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    href,
    ...props
}: LinkProps) {
    const normalizedHref =
        typeof href === 'string'
            ? href
            : // Normalize route helper objects that expose a `.url` string
              (href as unknown as { url: string }).url;

    return (
        <Link
            className={cn(
                'text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500',
                className,
            )}
            href={normalizedHref}
            {...props}
        >
            {children}
        </Link>
    );
}
