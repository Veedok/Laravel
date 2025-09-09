import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import TypeFilter from '@/Components/TypeFilter';

// Расширенная цветовая палитра с разными спокойными тонами
const INCOME_COLORS = [
    '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF',
    '#00D2D3', '#48DBFB', '#1DD1A1', '#9CEC5B', '#FFEAA7', '#DDA0DD'
];

const EXPENSE_COLORS = [
    '#FF6B6B', '#FF9F43', '#F368E0', '#FF7979', '#EE5A24', '#ED4C67',
    '#B53471', '#6F1E51', '#FDA7DF', '#D980FA', '#9980FA', '#5758BB'
];

// Кастомный компонент Doughnut chart с управлением hover
const CustomDoughnutChart = ({ data, options, theme, selectedType, onHover }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const hoveredIndexRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && canvasRef.current && containerRef.current) {
            import('chart.js/auto').then(({ Chart }) => {
                if (chartRef.current) {
                    chartRef.current.destroy();
                }

                // Устанавливаем правильные размеры canvas
                const container = containerRef.current;
                const dpr = window.devicePixelRatio || 1;

                canvasRef.current.width = container.offsetWidth * dpr;
                canvasRef.current.height = container.offsetHeight * dpr;

                const ctx = canvasRef.current.getContext('2d');
                ctx.scale(dpr, dpr);

                const newChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: data,
                    options: {
                        ...options,
                        layout: {
                            padding: {
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10
                            }
                        },
                        onHover: (event, elements) => {
                            if (onHover) {
                                onHover(event, elements);
                            }

                            const newHoveredIndex = elements.length > 0 ? elements[0].index : null;
                            if (hoveredIndexRef.current !== newHoveredIndex) {
                                hoveredIndexRef.current = newHoveredIndex;

                                if (newChart && newChart.data && newChart.data.datasets) {
                                    const dataset = newChart.data.datasets[0];
                                    const colors = selectedType === 'income' ? INCOME_COLORS : EXPENSE_COLORS;

                                    dataset.hoverBackgroundColor = dataset.backgroundColor.map((color, index) => {
                                        return index === newHoveredIndex
                                            ? lightenColor(colors[index % colors.length], 20)
                                            : colors[index % colors.length];
                                    });

                                    newChart.update('none');
                                }
                            }
                        }
                    }
                });

                chartRef.current = newChart;

                // Обработчик ресайза
                const handleResize = () => {
                    if (containerRef.current && canvasRef.current) {
                        const dpr = window.devicePixelRatio || 1;
                        canvasRef.current.width = containerRef.current.offsetWidth * dpr;
                        canvasRef.current.height = containerRef.current.offsetHeight * dpr;
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.scale(dpr, dpr);
                        newChart.resize();
                    }
                };

                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    if (chartRef.current) {
                        chartRef.current.destroy();
                    }
                };
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, options, theme, selectedType]);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '100%'
                }}
            />
        </div>
    );
};

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
    const [totals, setTotals] = useState({ income: 0, expense: 0 });

    // Загружаем данные при монтировании и при изменении таблицы
    useEffect(() => {
        fetchAllStatistics();
    }, [selectedTable]); // Добавляем selectedTable в зависимости

    // Загружаем отфильтрованные данные при изменении типа
    useEffect(() => {
        if (!loading) {
            fetchFilteredStatistics();
        }
    }, [selectedType]); // Только при изменении типа

    const fetchAllStatistics = async () => {
        try {
            setLoading(true);

            // Загружаем общую статистику для обоих типов с учетом выбранной таблицы
            const [incomeResponse, expenseResponse] = await Promise.all([
                axios.post('/api/charts/tag-statistics', {
                    type: 'income',
                    table_id: selectedTable || null
                }),
                axios.post('/api/charts/tag-statistics', {
                    type: 'expense',
                    table_id: selectedTable || null
                })
            ]);

            setTotals({
                income: incomeResponse.data.totalSum || 0,
                expense: expenseResponse.data.totalSum || 0
            });

            // Загружаем данные для текущего выбранного типа
            await fetchFilteredStatistics();

        } catch (error) {
            console.error('Error fetching statistics:', error);
            setTotals({ income: 0, expense: 0 });
            setTagStatistics([]);
            setTotalSum(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilteredStatistics = async () => {
        try {
            const payload = {
                type: selectedType,
                table_id: selectedTable || null
            };

            const response = await axios.post('/api/charts/tag-statistics', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            setTagStatistics(response.data.tagStatistics || []);
            setTotalSum(response.data.totalSum || 0);

        } catch (error) {
            console.error('Error fetching filtered statistics:', error);
            setTagStatistics([]);
            setTotalSum(0);
        }
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    const handleTableChange = (tableId) => {
        setSelectedTable(tableId);
    };

    const formatCurrency = (value) => {
        return value.toFixed(2);
    };

    const getSelectedTableName = () => {
        if (!selectedTable) return null;
        return tables.find(table => table.id == selectedTable)?.name;
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
                    hoverBorderWidth: 3,
                    hoverBorderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0',
                    hoverOffset: 15,
                },
            ],
        };
    }, [tagStatistics, theme, selectedType]); // Убрали hoveredIndex из зависимостей

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%', // Уменьшаем отверстие для лучшего размещения
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: theme === 'dark' ? '#D1D5DB' : '#374151',
                    font: {
                        family: "'Inter', 'sans-serif'",
                        size: 11 // Уменьшаем размер шрифта
                    }
                },
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                titleColor: theme === 'dark' ? '#F3F4F6' : '#111827',
                bodyColor: theme === 'dark' ? '#D1D5DB' : '#4B5563',
                borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${context.label}: ${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        },
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1000
        },
        transitions: {
            active: {
                animation: {
                    duration: 0
                }
            }
        }
    }), [theme]);


    const handleChartHover = (event, elements) => {
        const newHoveredIndex = elements.length > 0 ? elements[0].index : null;
        setHoveredIndex(newHoveredIndex);
    };

    const handleListItemHover = (index) => {
        setHoveredIndex(index);
    };

    const handleListItemLeave = () => {
        setHoveredIndex(null);
    };

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
                                {selectedTable && ` - ${getSelectedTableName()}`}
                            </h2>

                            {/* Компонент фильтрации по типу */}
                            <TypeFilter
                                theme={theme}
                                selectedType={selectedType}
                                onTypeChange={handleTypeChange}
                                incomeTotal={totals.income}
                                expenseTotal={totals.expense}
                                formatCurrency={formatCurrency}
                            />

                            {/* Фильтр по таблице */}
                            <div className="mb-6">
                                <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                                    Выберите таблицу
                                </label>
                                <select
                                    value={selectedTable}
                                    onChange={(e) => handleTableChange(e.target.value)}
                                    className={`w-full p-2 border rounded transition-colors ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                                            : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                                    }`}
                                >
                                    <option value="">Все таблицы</option>
                                    {tables.map((table) => (
                                        <option key={table.id} value={table.id}>
                                            {table.name}
                                        </option>
                                    ))}
                                </select>
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
                                        <div className="h-80 relative overflow-visible">
                                            <CustomDoughnutChart
                                                data={chartData}
                                                options={chartOptions}
                                                theme={theme}
                                                selectedType={selectedType}
                                                onHover={handleChartHover}
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
                                                        onMouseEnter={() => handleListItemHover(index)}
                                                        onMouseLeave={handleListItemLeave}
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
