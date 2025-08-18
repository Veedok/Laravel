export default function InputError({ message, className = '', theme = 'light' }) {
    return message ? (
        <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} ${className}`}>
            {message}
        </p>
    ) : null;
}
