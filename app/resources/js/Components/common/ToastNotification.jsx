import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function ToastNotification({
                                              message,
                                              type = 'success',
                                              onClose,
                                              theme,
                                              autoClose = true,
                                              autoCloseDuration = 5000
                                          }) {
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(onClose, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDuration, onClose]);

    const bgColor = type === 'success'
        ? (theme === 'dark' ? 'bg-green-700' : 'bg-green-600')
        : (theme === 'dark' ? 'bg-red-700' : 'bg-red-600');

    return (
        <div
            className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between min-w-[200px] animate-fadeIn z-50`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                <XMarkIcon className="h-5 w-5"/>
            </button>
        </div>
    );
}
