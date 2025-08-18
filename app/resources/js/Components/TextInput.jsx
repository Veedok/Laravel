export default function TextInput({
                                      type = 'text',
                                      className = '',
                                      theme = 'light',
                                      isFocused = false,
                                      ...props
                                  }) {
    return (
        <input
            {...props}
            type={type}
            className={`rounded-md shadow-sm border ${
                theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-400 focus:ring-indigo-400'
                    : 'border-gray-300 focus:border-indigo-300 focus:ring-indigo-300'
            } ${isFocused && 'focus:ring-2 focus:ring-opacity-50'} ${className}`}
            autoFocus={isFocused}
        />
    );
}
