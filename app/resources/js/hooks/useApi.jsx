// hooks/useApi.js
import { useState, useCallback } from 'react';

export default function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callApi = useCallback(async (apiCall, successCallback, errorCallback) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiCall();
            if (successCallback) successCallback(response);
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Произошла ошибка';
            setError(errorMessage);
            if (errorCallback) errorCallback(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, callApi };
}
