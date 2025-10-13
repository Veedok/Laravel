// app/resources/js/Pages/AboutUs.jsx
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ContentLayout from '@/Layouts/ContentLayout'; // Новый layout
import {
    ShieldCheckIcon,
    ChartBarIcon,
    UserGroupIcon,
    TableCellsIcon,
    LockClosedIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

export default function AboutUs({ auth, theme }) {
    const isDark = theme === 'dark';
    const isAuthenticated = !!auth?.user;

    // Используем AuthenticatedLayout для авторизованных и ContentLayout для гостей
    const Layout = isAuthenticated ? AuthenticatedLayout : ContentLayout;

    const themeClasses = {
        container: isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900',
        card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        textPrimary: isDark ? 'text-white' : 'text-gray-900',
        textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
        accent: 'text-blue-600 dark:text-blue-400'
    };

    const features = [
        {
            icon: TableCellsIcon,
            title: "Универсальная финансовая отчетность",
            description: "Создавайте неограниченное количество таблиц для разных целей: личный бюджет, семейные финансы, бизнес-расходы или проектные сметы."
        },
        {
            icon: UserGroupIcon,
            title: "Интеллектуальный совместный доступ",
            description: "Делитесь таблицами с коллегами, семьей или партнерами. Гибкая система прав позволяет точно настроить, что может делать каждый участник."
        },
        {
            icon: ChartBarIcon,
            title: "Визуальная аналитика",
            description: "Превращайте скучные цифры в понятные графики и диаграммы. Отслеживайте тенденции, выявляйте закономерности и принимайте обоснованные финансовые решения."
        },
        {
            icon: ShieldCheckIcon,
            title: "Исключительная безопасность данных",
            description: "Многоуровневая система защиты гарантирует конфиденциальность вашей финансовой информации на всех этапах работы."
        }
    ];

    const killerFeatures = [
        {
            icon: LockClosedIcon,
            title: "End-to-End Шифрование",
            description: "Передовая технология End-to-End шифрования, при которой ваши данные шифруются на вашем устройстве перед отправкой на сервер. Расшифровка происходит только на устройствах, которым вы предоставили доступ. Сервер хранит исключительно зашифрованную информацию, которую невозможно прочитать без ваших уникальных ключей доступа.",
            highlight: "Мы не храним ваши пароли - только вы имеете доступ к своим данным"
        },
        {
            icon: DevicePhoneMobileIcon,
            title: "Кросс-платформенная синхронизация",
            description: "Работайте с вашими финансами на любом устройстве. Все изменения синхронизируются в реальном времени с сохранением высочайшего уровня безопасности.",
            highlight: "Ваши данные всегда с вами, где бы вы ни находились"
        }
    ];

    // Пропсы для layout'ов
    const layoutProps = isAuthenticated ? {
        header: (
            <h2 className={`text-xl font-semibold leading-tight ${themeClasses.textPrimary}`}>
                О нашем сервисе
            </h2>
        )
    } : {};

    return (
        <Layout {...layoutProps}>
            <Head title="О нас - Финансовый менеджер" />

            {/* Весь ваш контент остается без изменений */}
            <div className={`min-h-screen py-8 ${themeClasses.container}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold mb-6">
                            <span className={themeClasses.textPrimary}>Ваш финансовый мир </span>
                            <span className={themeClasses.accent}>под полным контролем</span>
                        </h1>
                        <p className={`text-xl max-w-3xl mx-auto mb-8 ${themeClasses.textSecondary}`}>
                            Профессиональная платформа для управления личными и бизнес-финансами
                            с революционной системой безопасности
                        </p>
                    </div>
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            <span className={themeClasses.textPrimary}>Все, что нужно для </span>
                            <span className={themeClasses.accent}>эффективного управления финансами</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`p-6 rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md ${themeClasses.card}`}
                                >
                                    <div className="flex items-center mb-4">
                                        <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'} mr-4`}>
                                            <feature.icon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p className={themeClasses.textSecondary}>
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-16">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium mb-4">
                                🚀 Уникальные возможности
                            </div>
                            <h2 className="text-3xl font-bold">
                                <span className={themeClasses.textPrimary}>Технологии, которые </span>
                                <span className={themeClasses.accent}>меняют правила игры</span>
                            </h2>
                        </div>

                        <div className="space-y-8">
                            {killerFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`p-8 rounded-xl border-2 ${isDark ? 'border-blue-500/20 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white'} shadow-lg`}
                                >
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                                        <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'} flex-shrink-0`}>
                                            <feature.icon className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-2xl font-bold mb-3 ${themeClasses.textPrimary}`}>
                                                {feature.title}
                                            </h3>
                                            <p className={`text-lg mb-4 ${themeClasses.textSecondary}`}>
                                                {feature.description}
                                            </p>
                                            <div className={`inline-flex items-center px-4 py-2 rounded-full ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'} text-sm font-medium`}>
                                                💡 {feature.highlight}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`p-8 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-blue-50 border border-blue-100'} text-center`}>
                        <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                        <h3 className="text-2xl font-bold mb-4">
                            <span className={themeClasses.textPrimary}>Безопасность — это не опция, </span>
                            <span className={themeClasses.accent}>это основа</span>
                        </h3>
                        <p className={`text-lg max-w-2xl mx-auto mb-6 ${themeClasses.textSecondary}`}>
                            В отличие от других сервисов, мы не просто защищаем ваши данные —
                            мы делаем их нечитаемыми для всех, включая нас. End-to-End шифрование
                            гарантирует, что только вы и те, кому вы доверяете, можете видеть вашу финансовую информацию.
                        </p>
                        <div className={`inline-flex items-center px-6 py-3 rounded-full ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'} font-medium`}>
                            🔒 Ваши финансы видны только вам и вашим доверенным лицам
                        </div>
                    </div>
                    <div className="text-center mt-16">
                        <h3 className="text-2xl font-bold mb-4">
                            <span className={themeClasses.textPrimary}>Готовы взять финансы </span>
                            <span className={themeClasses.accent}>под полный контроль?</span>
                        </h3>
                        <p className={`text-lg mb-8 max-w-2xl mx-auto ${themeClasses.textSecondary}`}>
                            Присоединяйтесь к тысячам пользователей, которые уже доверяют нам свои финансовые данные
                        </p>
                        {!isAuthenticated && (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href={route('register')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                                >
                                    Начать бесплатно
                                </a>
                                <a
                                    href={route('login')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                                >
                                    Войти в аккаунт
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
