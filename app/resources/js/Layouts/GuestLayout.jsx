import ApplicationLogo from '@/Components/ApplicationLogo';
import {Link, usePage} from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function GuestLayout({ children }) {
    const theme = usePage().props.theme || 'light';
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900 pt-6 sm:justify-center sm:pt-0">
            <div className="flex w-full justify-end px-6">
                <ThemeToggle />
            </div>

            <div>
                <Link href="/">
                    <ApplicationLogo className={`block h-14 w-auto fill-current ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`} />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white dark:bg-gray-800 px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
