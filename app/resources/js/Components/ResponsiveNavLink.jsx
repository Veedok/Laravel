import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
                                              active = false,
                                              className = '',
                                              children,
                                              theme = 'light',
                                              ...props
                                          }) {
    return (
        <Link
            {...props}
            className={
                'block w-full ps-3 pe-4 py-2 border-l-4 text-base font-medium transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? theme === 'dark'
                        ? 'border-indigo-400 bg-indigo-900/50 text-white focus:border-indigo-300 focus:bg-indigo-900/70 focus:text-white'
                        : 'border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800'
                    : theme === 'dark'
                        ? 'border-transparent text-gray-400 hover:bg-gray-700 hover:text-gray-200 focus:border-gray-500 focus:bg-gray-700 focus:text-gray-200'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
