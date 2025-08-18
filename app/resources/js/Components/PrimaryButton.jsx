export default function PrimaryButton({
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
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest ${
                theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 ${
                disabled && 'opacity-25'
            } ${className}`}
        >
            {children}
        </button>
    );
}
