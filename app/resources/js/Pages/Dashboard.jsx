import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import PayTable from '@/Components/PayTable.jsx';
import CarouselButtons from "@/Components/CarouselButtons.jsx";
import React, {useState, useEffect} from "react";
import axios from 'axios';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Загружаем данные...</p>
    </div>
);

const ErrorMessage = ({message, onRetry}) => (
    <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg className="w-10 h-10 text-red-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-red-600 font-medium text-center">{message}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                Попробовать снова
            </button>
        </div>
    </div>
);

export default function Dashboard({tables: initialTables}) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tables, setTables] = useState(initialTables);
    const [activeTableId, setActiveTableId] = useState(null);

    useEffect(() => {
        const initialActiveId = Object.keys(tables).find(key => tables[key].active === true);
        setActiveTableId(initialActiveId);
    }, [tables]);

    const fetchTransactions = async (tableId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(`/myEndpoint`, {
                tableId: tableId
            });
            setTransactions(response.data);

            // Обновляем активное состояние таблиц
            setTables(prev => {
                const updated = {};
                Object.keys(prev).forEach(key => {
                    updated[key] = {
                        ...prev[key],
                        active: key === tableId
                    };
                });
                return updated;
            });
        } catch (err) {
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTableId) {
            fetchTransactions(activeTableId);
        }
    }, [activeTableId]);

    const handleItemClick = (id) => {
        setActiveTableId(id);
    };

    const handleRetry = () => {
        if (activeTableId) {
            fetchTransactions(activeTableId);
        }
    };

    const handleAddItem = async (name) => {
        try {
            const response = await axios.put(`/table`, {
                name: name
            });

            if (response.status === 200) {
                setTables(prev => ({
                    ...prev,
                    [response.data.id]: {
                        name: name,
                        active: false
                    }
                }));
                return true;
            }
        } catch (error) {
            console.error('Error adding item:', error);
            return false;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Таблица баланса
                </h2>
            }
        >
            <Head title="Таблица Баланса"/>
            <CarouselButtons
                items={tables}
                onItemClick={handleItemClick}
                onAddItem={handleAddItem}
            />

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <ErrorMessage message={error} onRetry={handleRetry} />
            ) : (
                <PayTable data={transactions} activeTableId={activeTableId}  />
            )}
        </AuthenticatedLayout>
    );
}
