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

// Расширенная цветовая палитра с разными спокойными тонами
const INCOME_COLORS = [
    '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF',
    '#00D2D3', '#48DBFB', '#1DD1A1', '#9CEC5B', '#FFEAA7', '#DDA0DD'
];

const EXPENSE_COLORS = [
    '#FF6B6B', '#FF9F43', '#F368E0', '#FF7979', '#EE5A24', '#ED4C67',
    '#B53471', '#6F1E51', '#FDA7DF', '#D980FA', '#9980FA', '#5758BB'
];

// Функция для осветления цвета
const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
};

export default function ChartsIndex() {
    const { auth, theme, tables } = usePage().props;
    const [tagStatistics, setTagStatistics] = useState([]);
    const [totalSum, setTotalSum] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('income');
    const [selectedTable, setSelectedTable] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState(null);

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

    const chartData = useMemo(() => {
        const colors = selectedType === 'income' ? INCOME_COLORS : EXPENSE_COLORS;

        return {
            labels: tagStatistics.map(tag => tag.name),
            datasets: [
                {
                    data: tagStatistics.map(tag => tag.total_sum),
                    backgroundColor: tagStatistics.map((tag, index) => {
                        return colors[index % colors.length];
                    }),
                    borderWidth: 2,
                    borderColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
                    hoverBackgroundColor: tagStatistics.map((tag, index) => {
                        const baseColor = colors[index % colors.length];
                        return index === hoveredIndex
                            ? lightenColor(baseColor, 20)
                            : baseColor;
                    }),
                    hoverBorderWidth: 3,
                    hoverBorderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0',
                    hoverOffset: 15,
                },
            ],
        };
    }, [tagStatistics, theme, selectedType, hoveredIndex]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: theme === 'dark' ? '#D1D5DB' : '#374151',
                    font: {
                        family: "'Inter', 'sans-serif'",
                        size: 12
                    }
                },
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                titleColor: theme === 'dark' ? '#F3F4F6' : '#111827',
                bodyColor: theme === 'dark' ? '#D1D5DB' : '#4B5563',
                borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
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
        animation: {
            animateScale: true,
            animateRotate: true
        },
        onHover: (event, chartElements) => {
            setHoveredIndex(chartElements.length > 0 ? chartElements[0].index : null);
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
                                        <div className="h-80 relative">
                                            <Doughnut
                                                data={chartData}
                                                options={chartOptions}
                                            />
                                        </div>
                                    </div>

                                    {/* Детализация */}
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>
                                            Детализация по тегам
                                        </h3>
                                        <div className="space-y-3">
                                            {tagStatistics.map((tag, index) => {
                                                const colors = selectedType === 'income' ? INCOME_COLORS : EXPENSE_COLORS;
                                                const tagColor = colors[index % colors.length];

                                                return (
                                                    <div
                                                        key={tag.id}
                                                        className={`flex justify-between items-center p-3 rounded border ${cardClass} transition-all duration-200 ${
                                                            hoveredIndex === index
                                                                ? theme === 'dark'
                                                                    ? 'ring-2 ring-blue-400 scale-[1.02]'
                                                                    : 'ring-2 ring-blue-300 scale-[1.02]'
                                                                : ''
                                                        }`}
                                                        onMouseEnter={() => setHoveredIndex(index)}
                                                        onMouseLeave={() => setHoveredIndex(null)}
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                className="w-4 h-4 rounded mr-3"
                                                                style={{ backgroundColor: tagColor }}
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
