import { useState } from 'react';
export default function useToast() {
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });
    const showNotification = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 5000);
    };
    const showSuccess = (message) => showNotification(message, 'success');
    const showError = (message) => showNotification(message, 'error');
    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };
    return {
        toast,
        showSuccess,
        showError,
        hideToast
    };
}
