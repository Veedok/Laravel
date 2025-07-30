import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import '../../css/payTable.css';

const TransactionsTable = ({ data }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { data: formData, setData, post, put, reset, delete: destroy } = useForm({
        id: null,
        title: '',
        changeBalance: true,
        sum: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [transactions, setTransactions] = useState(data);

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            id: editingId,
            name: formData.title,
            type: formData.changeBalance ? 'income' : 'expense',
            sum: parseFloat(formData.sum),
            date: formData.date
        };

        const method = editingId ? put : post;
        const url = editingId ? route('updateData') : route('saveData');

        method(url, payload, {
            preserveScroll: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            onSuccess: () => {
                const newTransaction = {
                    id: editingId || Math.max(...transactions.map(t => t.id), 0) + 1,
                    title: formData.title,
                    changeBalance: formData.changeBalance,
                    sum: parseFloat(formData.sum),
                    date: new Date(formData.date).toLocaleDateString('ru-RU')
                };

                setTransactions(prev =>
                    editingId
                        ? prev.map(t => t.id === editingId ? newTransaction : t)
                        : [...prev, newTransaction]
                );

                resetForm();
            }
        });
    };

    const handleEdit = (transaction) => {
        setEditingId(transaction.id);
        setData({
            id: transaction.id,
            title: transaction.title,
            changeBalance: transaction.changeBalance,
            sum: transaction.sum.toFixed(2),
            date: new Date(transaction.date.split('.').reverse().join('-')).toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            destroy(route('deleteData'), {
                data: { id },
                preserveScroll: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                onSuccess: () => {
                    setTransactions(prev => prev.filter(t => t.id !== id));
                }
            });
        }
    };

    const resetForm = () => {
        reset();
        setEditingId(null);
        setIsModalOpen(false);
    };

    const totals = transactions.reduce((acc, item) => {
        if (item.changeBalance) {
            acc.income += item.sum;
        } else {
            acc.expense += item.sum;
        }
        return acc;
    }, { income: 0, expense: 0 });

    return (
        <div className="space-y-4 table_container">
            {/* Блок с суммами и кнопкой добавления */}
            <div className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-full" style={{minWidth: 'fit-content'}}>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h3 className="text-sm font-medium text-green-800">Суммарный приход</h3>
                        <p className="text-2xl font-semibold text-green-600">
                            {totals.income.toLocaleString('ru-RU', {
                                style: 'currency',
                                currency: 'RUB',
                                minimumFractionDigits: 2
                            })}
                        </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <h3 className="text-sm font-medium text-red-800">Суммарный расход</h3>
                        <p className="text-2xl font-semibold text-red-600">
                            {totals.expense.toLocaleString('ru-RU', {
                                style: 'currency',
                                currency: 'RUB',
                                minimumFractionDigits: 2
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Таблица */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Название
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Тип операции
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Сумма
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Дата
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider action_head">
                            Действия
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((item) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.changeBalance ? (
                                    <span
                                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Приход
                                        </span>
                                ) : (
                                    <span
                                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            Расход
                                        </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.sum.toLocaleString('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    minimumFractionDigits: 2
                                })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2 action_row">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        title="Редактировать"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Удалить"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Добавить запись
                </button>
            </div>
            {/* Модальное окно */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingId ? 'Редактировать запись' : 'Добавить новую запись'}
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Название
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={formData.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Тип операции
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={formData.changeBalance}
                                        onChange={(e) => setData('changeBalance', e.target.value === 'true')}
                                        required
                                    >
                                        <option value={true}>Приход</option>
                                        <option value={false}>Расход</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Сумма
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={formData.sum}
                                        onChange={(e) => setData('sum', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Дата
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={formData.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {editingId ? 'Обновить' : 'Сохранить'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsTable;
