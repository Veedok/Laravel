export default function SecondaryButton({
                                            type = 'button',
                                            className = '',
                                            disabled = false,
                                            children,
                                            theme = 'light',
                                            ...props
                                        }) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={`inline-flex items-center px-4 py-2 border rounded-md font-semibold text-xs uppercase tracking-widest ${
                theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:bg-gray-50 active:bg-gray-100'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 ${
                disabled && 'opacity-25'
            } ${className}`}
        >
            {children}
        </button>
    );
}
