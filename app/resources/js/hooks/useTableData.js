import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useTableData(initialTables) {
    const [data, setData] = useState({
        transactions: [],
        userTags: [],
        permission: { is_owner: false, permissions: [] },
        is_encrypted: false,
        tableKey: null,
        salt: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tables, setTables] = useState(initialTables);
    const [activeTableId, setActiveTableId] = useState(null);
    const hasTables = Object.keys(tables).length > 0;
    useEffect(() => {
        if (hasTables) {
            const initialActiveId = Object.keys(tables).find(key => tables[key].active === true);
            setActiveTableId(initialActiveId || Object.keys(tables)[0]);
        }
    }, [hasTables]);
    useEffect(() => {
        if (activeTableId) {
            fetchTransactions(activeTableId);
        }
    }, [activeTableId]);
    const fetchTransactions = async (tableId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(route('tableData'), { tableId });
            const serverData = response.data;
            setData(serverData);
            return serverData;
        } catch (err) {
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            throw err;
        } finally {
            setLoading(false);
        }
    };
    const handleItemClick = (id) => {
        setTables(prev => {
            const updated = {};
            Object.keys(prev).forEach(key => {
                updated[key] = { ...prev[key], active: key === id.toString() };
            });
            return updated;
        });
        setActiveTableId(id.toString());
    };
    const handleAddItem = async (name) => {
        try {
            setLoading(true);
            const response = await axios.put('/table', { name }, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (response.status === 200) {
                const newTableId = response.data.id;
                setTables(prevTables => {
                    const updatedTables = {};
                    Object.keys(prevTables).forEach(key => {
                        updatedTables[key] = { ...prevTables[key], active: false };
                    });
                    updatedTables[newTableId] = { name, active: true, owner: true };
                    return updatedTables;
                });
                setActiveTableId(newTableId.toString());
                return true;
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setError('Таблица с таким именем уже существует');
            } else {
                setError('Не удалось создать таблицу');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };
    const handleRetry = () => {
        if (activeTableId) fetchTransactions(activeTableId);
    };
    return {
        data,
        loading,
        error,
        tables,
        activeTableId,
        fetchTransactions,
        handleItemClick,
        handleAddItem,
        handleRetry
    };
}
