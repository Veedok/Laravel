import React, { useState, useEffect, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChartsIndex() {
    const { auth, theme, tables } = usePage().props;
    const [tagStatistics, setTagStatistics] = useState([]);
    const [totalSum, setTotalSum] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('income');
    const [selectedTable, setSelectedTable] = useState('');

    useEffect(() => {
        fetchTagStatistics();
    }, [selectedType, selectedTable]);

    const fetchTagStatistics = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('type', selectedType);
            if (selectedTable) {
                params.append('table_id', selectedTable);
            }

            const response = await fetch(`/api/charts/tag-statistics?${params}`);
            const data = await response.json();

            setTagStatistics(data.tagStatistics);
            setTotalSum(data.totalSum);
        } catch (error) {
            console.error('Error fetching tag statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = useMemo(() => ({
        labels: tagStatistics.map(tag => tag.name),
        datasets: [
            {
                data: tagStatistics.map(tag => tag.total_sum),
                backgroundColor: selectedType === 'income'
                    ? ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#059669', '#065F46', '#047857', '#0D9488']
                    : ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
                borderWidth: 2,
                borderColor: theme === 'dark' ? '#374151' : '#fff',
            },
        ],
    }), [tagStatistics, theme, selectedType]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    color: theme === 'dark' ? '#D1D5DB' : '#374151',
                    font: {
                        family: "'Inter', 'sans-serif'"
                    }
                },
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1F2937' : '#fff',
                titleColor: theme === 'dark' ? '#F3F4F6' : '#374151',
                bodyColor: theme === 'dark' ? '#D1D5DB' : '#6B7280',
                borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        const value = context.parsed;
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${context.label}: ${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        },
    }), [theme]);

    const containerClass = theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200';

    const textClass = theme === 'dark'
        ? 'text-gray-100'
        : 'text-gray-900';

    const cardClass = theme === 'dark'
        ? 'bg-gray-700 border-gray-600'
        : 'bg-gray-50 border-gray-200';

    const sumCardClass = selectedType === 'income'
        ? (theme === 'dark' ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200')
        : (theme === 'dark' ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200');

    const buttonClass = (isActive) =>
        theme === 'dark'
            ? `px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`
            : `px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`;

    const getSelectedTableName = () => {
        if (!selectedTable) return null;
        return tables.find(table => table.id == selectedTable)?.name;
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center h-64">
                    <div className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : ''}`}>
                        Загрузка данных...
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Графики по тегам" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className={`overflow-hidden shadow-sm sm:rounded-lg border ${containerClass}`}>
                        <div className={`p-6 border-b ${containerClass}`}>
                            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>
                                Статистика по тегам
                            </h2>

                            {/* Переключение типа */}
                            <div className="flex space-x-2 mb-6">
                                <button
                                    onClick={() => setSelectedType('income')}
                                    className={buttonClass(selectedType === 'income')}
                                >
                                    📈 Доходы
                                </button>
                                <button
                                    onClick={() => setSelectedType('expense')}
                                    className={buttonClass(selectedType === 'expense')}
                                >
                                    📉 Расходы
                                </button>
                            </div>

                            {/* Фильтры */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                                        Выберите таблицу
                                    </label>
                                    <select
                                        value={selectedTable}
                                        onChange={(e) => setSelectedTable(e.target.value)}
                                        className={`w-full p-2 border rounded transition-colors ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                                        }`}
                                    >
                                        <option value="">Все мои таблицы</option>
                                        {tables.map((table) => (
                                            <option key={table.id} value={table.id}>
                                                {table.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Общая сумма */}
                                <div className={`p-4 rounded border ${sumCardClass}`}>
                                    <div className="text-sm font-semibold mb-1">
                                        {selectedType === 'income' ? 'Общий доход' : 'Общий расход'}
                                        {selectedTable && ` (${getSelectedTableName()})`}
                                    </div>
                                    <div className={`text-2xl font-bold ${
                                        selectedType === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {selectedType === 'income' ? '+' : '-'}{totalSum.toFixed(2)}
                                    </div>
                                    <div className="text-sm opacity-75">
                                        {tagStatistics.length} тег(ов), {tagStatistics.reduce((acc, tag) => acc + tag.transaction_count, 0)} транзакций
                                    </div>
                                </div>
                            </div>

                            {tagStatistics.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                        Нет данных для отображения
                                    </p>
                                    <p className="text-sm mt-2 text-gray-500">
                                        {selectedTable
                                            ? `В таблице "${getSelectedTableName()}" нет ${selectedType === 'income' ? 'доходов' : 'расходов'}`
                                            : `У вас нет ${selectedType === 'income' ? 'доходов' : 'расходов'} в ваших таблицах`
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-8">
                                    {/* График */}
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>
                                            {selectedType === 'income' ? 'Доходы' : 'Расходы'} по тегам
                                            {selectedTable && ` (${getSelectedTableName()})`}
                                        </h3>
                                        <div className="h-80">
                                            <Doughnut data={chartData} options={chartOptions} />
                                        </div>
                                    </div>

                                    {/* Детализация */}
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>
                                            Детализация по тегам
                                        </h3>
                                        <div className="space-y-3">
                                            {tagStatistics.map((tag) => (
                                                <div
                                                    key={tag.id}
                                                    className={`flex justify-between items-center p-3 rounded border ${cardClass}`}
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-4 h-4 rounded mr-3"
                                                            style={{
                                                                backgroundColor: chartData.datasets[0].backgroundColor[
                                                                tagStatistics.findIndex(t => t.id === tag.id) %
                                                                chartData.datasets[0].backgroundColor.length
                                                                    ]
                                                            }}
                                                        />
                                                        <span className={textClass}>{tag.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`font-semibold ${
                                                            selectedType === 'income' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {selectedType === 'income' ? '+' : '-'}{tag.total_sum.toFixed(2)}
                                                        </div>
                                                        <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                                            {tag.transaction_count} транзакций
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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
