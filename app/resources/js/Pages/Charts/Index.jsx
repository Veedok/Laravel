import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import EncryptionService from "@/Pages/Crypto/encryptionService.js";
import PasswordPrompt from '@/Components/Crypto/PasswordPrompt';

const INCOME_COLORS = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
const EXPENSE_COLORS = ['#FF6B6B', '#FF9F43', '#F368E0', '#FF7979', '#EE5A24', '#ED4C67'];

const SimpleChart = ({ data, theme, type }) => {
    const canvasRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0 || !canvasRef.current) return;
        const loadChart = async () => {
            const Chart = (await import('chart.js/auto')).default;
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            const ctx = canvasRef.current.getContext('2d');
            const colors = type === 'income' ? INCOME_COLORS : EXPENSE_COLORS;
            chartInstance.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.name || 'Без названия'),
                    datasets: [{
                        data: data.map(item => item.total_sum || 0),
                        backgroundColor: data.map((_, index) => colors[index % colors.length]),
                        borderWidth: 2,
                        borderColor: theme === 'dark' ? '#374151' : '#ffffff',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: theme === 'dark' ? '#d1d5db' : '#374151',
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        };

        loadChart();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, theme, type]);

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    Нет данных для графика
                </p>
            </div>
        );
    }
    return (
        <div className="h-64">
            <canvas ref={canvasRef} />
        </div>
    );
};
const TypeFilter = ({ theme, selectedType, onTypeChange, incomeTotal, expenseTotal }) => {
    const safeFormat = (value) => {
        const num = Number(value) || 0;
        return num.toFixed(2);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
                onClick={() => onTypeChange('income')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedType === 'income'
                        ? theme === 'dark'
                            ? 'bg-green-900 border-green-600 text-green-200'
                            : 'bg-green-100 border-green-300 text-green-800'
                        : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
            >
                <div className="text-center">
                    <div className="text-sm font-medium mb-1">Доходы</div>
                    <div className="text-xl font-bold">+{safeFormat(incomeTotal)}</div>
                </div>
            </button>
            <button
                onClick={() => onTypeChange('expense')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedType === 'expense'
                        ? theme === 'dark'
                            ? 'bg-red-900 border-red-600 text-red-200'
                            : 'bg-red-100 border-red-300 text-red-800'
                        : theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
            >
                <div className="text-center">
                    <div className="text-sm font-medium mb-1">Расходы</div>
                    <div className="text-xl font-bold">-{safeFormat(expenseTotal)}</div>
                </div>
            </button>
        </div>
    );
};

export default function ChartsIndex() {
    const { auth, theme, tables } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('income');
    const [selectedTable, setSelectedTable] = useState(tables.length > 0 ? tables[0].id : '');
    const [statistics, setStatistics] = useState({
        income: { items: [], total: 0 },
        expense: { items: [], total: 0 }
    });
    const [needsPassword, setNeedsPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [userPasswords, setUserPasswords] = useState({});
    const [encryptedData, setEncryptedData] = useState({
        income: null,
        expense: null
    });
    const getTableName = () => {
        const table = tables.find(t => t.id == selectedTable);
        return table ? table.name : 'Неизвестная таблица';
    };
    const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };
    const decryptData = async (encryptedResponse, password) => {
        try {
            const { cryptKey, cryptSalt, items } = encryptedResponse.data;
            const kek = await EncryptionService.deriveKeyFromPassword(
                password,
                EncryptionService.hexToUint8Array(cryptSalt)
            );
            const dataKey = await EncryptionService.decryptDataKey(cryptKey, kek);
            const decryptedItems = await Promise.all(
                items.map(async (item) => {
                    const decryptedSum = await EncryptionService.decryptData(item.sum, dataKey);
                    return {
                        id: item.id,
                        name: item.name,
                        total_sum: parseFloat(decryptedSum) || 0,
                        transaction_count: 1
                    };
                })
            );
            const grouped = decryptedItems.reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = { ...item };
                } else {
                    acc[item.id].total_sum += item.total_sum;
                    acc[item.id].transaction_count += 1;
                }
                return acc;
            }, {});
            return Object.values(grouped);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Неверный пароль или ошибка расшифровки');
        }
    };
    const loadStatistics = async () => {
        if (!selectedTable) return;
        try {
            setLoading(true);
            setPasswordError('');
            setNeedsPassword(false);
            const [incomeResponse, expenseResponse] = await Promise.all([
                axios.post('/api/charts/tag-statistics', {
                    type: 'income',
                    table_id: selectedTable
                }),
                axios.post('/api/charts/tag-statistics', {
                    type: 'expense',
                    table_id: selectedTable
                })
            ]);
            const hasPassword = userPasswords[selectedTable];
            const incomeEncrypted = incomeResponse.data.crypt;
            const expenseEncrypted = expenseResponse.data.crypt;
            if ((incomeEncrypted || expenseEncrypted) && !hasPassword) {
                setEncryptedData({
                    income: incomeEncrypted ? incomeResponse : null,
                    expense: expenseEncrypted ? expenseResponse : null
                });
                setNeedsPassword(true);
                setLoading(false);
                return;
            }
            const processData = async (response, type) => {
                if (!response.data.items) return { items: [], total: 0 };
                if (response.data.crypt && hasPassword) {
                    const decryptedItems = await decryptData(response, hasPassword);
                    const total = decryptedItems.reduce((sum, item) => sum + safeNumber(item.total_sum), 0);
                    return { items: decryptedItems, total };
                } else if (!response.data.crypt) {
                    const items = response.data.items || [];
                    const grouped = items.reduce((acc, item) => {
                        if (!acc[item.id]) {
                            acc[item.id] = {
                                id: item.id,
                                name: item.name,
                                total_sum: 0,
                                transaction_count: 0
                            };
                        }
                        acc[item.id].total_sum += safeNumber(item.sum);
                        acc[item.id].transaction_count += 1;
                        return acc;
                    }, {});
                    const processedItems = Object.values(grouped);
                    const total = processedItems.reduce((sum, item) => sum + item.total_sum, 0);
                    return { items: processedItems, total };
                } else {
                    return { items: [], total: 0 };
                }
            };
            const incomeData = await processData(incomeResponse, 'income');
            const expenseData = await processData(expenseResponse, 'expense');
            setStatistics({
                income: incomeData,
                expense: expenseData
            });
            setNeedsPassword(false);
        } catch (error) {
            console.error('Error loading statistics:', error);
            if (error.message.includes('Неверный пароль')) {
                setPasswordError('Неверный пароль');
                setNeedsPassword(true);
            } else {
                setPasswordError('Ошибка загрузки данных');
            }
            setStatistics({
                income: { items: [], total: 0 },
                expense: { items: [], total: 0 }
            });
        } finally {
            setLoading(false);
        }
    };
    const handlePasswordConfirm = async (password) => {
        try {
            setPasswordError('');
            setLoading(true);
            setUserPasswords(prev => ({
                ...prev,
                [selectedTable]: password
            }));
            const processEncrypted = async (encryptedResponse) => {
                if (!encryptedResponse) return { items: [], total: 0 };
                const decryptedItems = await decryptData(encryptedResponse, password);
                const total = decryptedItems.reduce((sum, item) => sum + safeNumber(item.total_sum), 0);
                return { items: decryptedItems, total };
            };
            const incomeData = await processEncrypted(encryptedData.income);
            const expenseData = await processEncrypted(encryptedData.expense);
            setStatistics({
                income: incomeData,
                expense: expenseData
            });
            setNeedsPassword(false);
            setEncryptedData({ income: null, expense: null });
        } catch (error) {
            console.error('Password error:', error);
            setPasswordError('Неверный пароль');
            setUserPasswords(prev => {
                const newPasswords = { ...prev };
                delete newPasswords[selectedTable];
                return newPasswords;
            });
        } finally {
            setLoading(false);
        }
    };
    const handleClearPasswordError = () => {
        setPasswordError('');
    };
    useEffect(() => {
        if (selectedTable) {
            loadStatistics();
        }
    }, [selectedTable]);

    const currentData = useMemo(() => {
        return statistics[selectedType] || { items: [], total: 0 };
    }, [selectedType, statistics]);

    const handleTableChange = (tableId) => {
        setSelectedTable(tableId);
        setPasswordError('');
        setNeedsPassword(false);
        setStatistics({
            income: { items: [], total: 0 },
            expense: { items: [], total: 0 }
        });
        setEncryptedData({ income: null, expense: null });
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    if (needsPassword) {
        return (
            <AuthenticatedLayout>
                <Head title="Требуется пароль" />
                <div className="py-8">
                    <div className="max-w-md mx-auto sm:px-6 lg:px-8">
                        <PasswordPrompt
                            theme={theme}
                            onUnlock={handlePasswordConfirm}
                            loading={loading}
                            error={passwordError}
                            onClearError={handleClearPasswordError}
                        />
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Статистика по тегам" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className={`overflow-hidden shadow-sm sm:rounded-lg ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="p-6">
                            <h1 className={`text-2xl font-bold mb-6 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                Статистика по тегам - {getTableName()}
                            </h1>
                            <TypeFilter
                                theme={theme}
                                selectedType={selectedType}
                                onTypeChange={handleTypeChange}
                                incomeTotal={statistics.income.total}
                                expenseTotal={statistics.expense.total}
                            />
                            <div className="mb-6">
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Таблица
                                </label>
                                <select
                                    value={selectedTable}
                                    onChange={(e) => handleTableChange(e.target.value)}
                                    className={`w-full p-2 border rounded ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                    {tables.map((table) => (
                                        <option key={table.id} value={table.id}>
                                            {table.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                        Загрузка данных...
                                    </div>
                                </div>
                            ) : currentData.items.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                        Нет данных для отображения
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-4 ${
                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            {selectedType === 'income' ? 'Доходы' : 'Расходы'} по тегам
                                        </h3>
                                        <SimpleChart
                                            data={currentData.items}
                                            theme={theme}
                                            type={selectedType}
                                        />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-4 ${
                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Детализация ({currentData.items.length} тегов)
                                        </h3>
                                        <div className="space-y-3">
                                            {currentData.items.map((tag, index) => {
                                                const colors = selectedType === 'income' ? INCOME_COLORS : EXPENSE_COLORS;
                                                const color = colors[index % colors.length];

                                                return (
                                                    <div
                                                        key={tag.id}
                                                        className={`flex justify-between items-center p-3 rounded border ${
                                                            theme === 'dark'
                                                                ? 'bg-gray-700 border-gray-600'
                                                                : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                className="w-3 h-3 rounded mr-3"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                                                {tag.name || 'Без названия'}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`font-semibold ${
                                                                selectedType === 'income' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {selectedType === 'income' ? '+' : '-'}{safeNumber(tag.total_sum).toFixed(2)}
                                                            </div>
                                                            <div className={`text-sm ${
                                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                            }`}>
                                                                {tag.transaction_count} транз.
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
