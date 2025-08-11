import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import PayTable from '@/Components/PayTable.jsx';
import CarouselButtons from "@/Components/CarouselButtons.jsx";
import React, {useState, useEffect} from "react";
import axios from 'axios';

// Анимированный компонент загрузки
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Загружаем данные...</p>
    </div>
);

// Анимированный компонент ошибки
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

export default function Dashboard({tables}) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTableId, setActiveTableId] = useState(null);

    // Находим активную таблицу при первом рендере
    useEffect(() => {
        const initialActiveId = Object.keys(tables).find(key => tables[key].active === true);
        setActiveTableId(initialActiveId);
    }, [tables]);

    // Функция для загрузки транзакций
    const fetchTransactions = async (tableId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(`/myEndpoint`, {
                tableId: tableId
            });
            setTransactions(response.data);
            setActiveTableId(tableId);
        } catch (err) {
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Загружаем транзакции при изменении activeTableId
    useEffect(() => {
        if (activeTableId) {
            fetchTransactions(activeTableId);
        }
    }, [activeTableId]);

    // Обработчик клика по элементу карусели
    const handleItemClick = (id) => {
        setActiveTableId(id);
        console.log(`Кнопка ${id} clicked`);
    };

    // Функция для повторной попытки
    const handleRetry = () => {
        if (activeTableId) {
            fetchTransactions(activeTableId);
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
                onAddClick={() => console.log("Добавить clicked")}
                onItemClick={handleItemClick}
            />

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <ErrorMessage message={error} onRetry={handleRetry} />
            ) : (
                <PayTable data={transactions} />
            )}
        </AuthenticatedLayout>
    );
}
