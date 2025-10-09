import { usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function ContentLayout({ children }) {
    const { theme, auth } = usePage().props;
    const isAuthenticated = !!auth?.user;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <ApplicationLogo className="h-8 w-auto mr-3" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Финансовый менеджер
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <a
                                    href={route('dashboard')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Личный кабинет
                                </a>
                            ) : (
                                <>
                                    <a
                                        href={route('login')}
                                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        Войти
                                    </a>
                                    <a
                                        href={route('register')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Регистрация
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1">
                {children}
            </main>
            <footer className="bg-white/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        <p>&copy; 2024 Финансовый менеджер. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
