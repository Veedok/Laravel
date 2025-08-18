export default function InputLabel({ value, className = '', children, theme = 'light', ...props }) {
    return (
        <label
            {...props}
            className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${className}`}
        >
            {value ? value : children}
        </label>
    );
}
