// hooks/useToast.js
import { useState, useCallback } from 'react';

export default function useToast() {
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = useCallback((message, type = 'success', duration = 5000) => {
        setToast({ show: true, message, type });

        if (duration > 0) {
            setTimeout(() => {
                setToast(prev => ({ ...prev, show: false }));
            }, duration);
        }
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

    return { toast, showToast, hideToast };
}
