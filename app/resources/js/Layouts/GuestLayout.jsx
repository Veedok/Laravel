import { usePage } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import '../../css/auth.css';

export default function GuestLayout({ children }) {
    const theme = usePage().props.theme || 'light';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="fixed top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                    {children}
                </div>
            </div>
        </div>
    );
}
