import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const theme = usePage().props.theme || 'light';
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
            <nav className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className={`block h-9 w-auto fill-current ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`} />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    theme={theme}
                                >
                                    Мои таблицы
                                </NavLink>
                                <NavLink
                                    href={route('tableControl')}
                                    active={route().current('tableControl')}
                                    theme={theme}
                                >
                                    Управление таблицами
                                </NavLink>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 sm:ms-6 sm:flex sm:items-center">
                            <ThemeToggle initialTheme={theme} />

                            <div className="relative ms-3">
                                <Dropdown theme={theme}>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium leading-4 transition duration-150 ease-in-out focus:outline-none ${
                                                    theme === 'dark'
                                                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:text-gray-100'
                                                        : 'border-transparent bg-white text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content theme={theme}>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                            theme={theme}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href='/logout'
                                            method="post"
                                            as="button"
                                            theme={theme}
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className={`inline-flex items-center justify-center rounded-md p-2 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-gray-300 focus:text-gray-300'
                                        : 'text-gray-400 hover:text-gray-500 focus:text-gray-500'
                                }`}
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className={`space-y-1 pb-3 pt-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            theme={theme}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} pb-1 pt-4`}>
                        <div className="px-4">
                            <div className={`text-base font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                {user.name}
                            </div>
                            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink
                                href={route('profile.edit')}
                                theme={theme}
                            >
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                                theme={theme}
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className={`shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h2 className={`text-xl font-semibold leading-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                            {header}
                        </h2>
                    </div>
                </header>
            )}

            <main className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                {children}
            </main>
        </div>
    );
}
