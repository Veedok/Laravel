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
                <svg className="w-10 h-10 text-red-500 animate-bounce" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
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

const NoTablesMessage = ({onAddTable}) => (
    <div className="max-w-md mx-auto p-6 bg-blue-50 rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
            </div>
            <p className="text-blue-600 font-medium text-center">У вас нет ни одной таблицы. Создайте таблицу для начала
                работы.</p>
            <button
                onClick={() => onAddTable("Новая таблица")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Создать таблицу
            </button>
        </div>
    </div>
);

export default function Dashboard({theme, tables: initialTables}) {
    const [data, setData] = useState({
        transactions: [],
        userTags: [],
        permission: {
            is_owner: false,
            permissions: []
        }
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
            const response = await axios.post(route('tableData'), {
                tableId: tableId
            });
            setData(response.data);
        } catch (err) {
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (id) => {
        setTables(prev => {
            const updated = {};
            Object.keys(prev).forEach(key => {
                updated[key] = {
                    ...prev[key],
                    active: key === id.toString()
                };
            });
            return updated;
        });
        setActiveTableId(id.toString());
    };

    const handleRetry = () => {
        if (activeTableId) {
            fetchTransactions(activeTableId);
        }
    };

    const handleAddItem = async (name) => {
        try {
            setLoading(true);
            const response = await axios.put(`/table`, {
                name: name
            }, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (response.status === 200) {
                const newTableId = response.data.id;

                setTables(prevTables => {
                    const updatedTables = {};
                    Object.keys(prevTables).forEach(key => {
                        updatedTables[key] = {
                            ...prevTables[key],
                            active: false
                        };
                    });
                    updatedTables[newTableId] = {
                        name: name,
                        active: true,
                        owner: true
                    };
                    return updatedTables;
                });
                setActiveTableId(newTableId.toString());
                return true;
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setError('Таблица с таким именем уже существует');
            } else {
                setError('Не удалось создать таблицу');
            }
            return false;
        } finally {
            setLoading(false);
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
                theme={theme}
                activeTableId={activeTableId}
            />

            {!hasTables ? (
                <NoTablesMessage onAddTable={handleAddItem}/>
            ) : loading ? (
                <LoadingSpinner/>
            ) : error ? (
                <ErrorMessage message={error} onRetry={handleRetry}/>
            ) : (
                <PayTable
                    data={data.transactions}
                    activeTableId={activeTableId}
                    permissions={data.permission}
                    theme={theme}
                    userTags={data.userTags}
                />
            )}
        </AuthenticatedLayout>
    );
}
