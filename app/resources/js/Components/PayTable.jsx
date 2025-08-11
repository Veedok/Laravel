import React, {useState} from 'react';
import {router} from '@inertiajs/react';
import '../../css/payTable.css';


const TransactionsTable = ({data}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        changeBalance: true,
        sum: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [transactions, setTransactions] = useState(data);

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        const payload = {
            id: editingId,
            name: formData.title,
            type: formData.changeBalance,
            sum: parseFloat(formData.sum),
            date: formData.date
        };

        try {
            const url = editingId ? route('updateData') : route('saveData');
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Если ошибка приходит в виде массива
                if (Array.isArray(errorData.errors)) {
                    throw new Error(errorData.errors.join('\n'));
                }
                // Если ошибка приходит в виде объекта
                else if (typeof errorData.errors === 'object') {
                    const errors = Object.values(errorData.errors).flat();
                    throw new Error(errors.join('\n'));
                }
                // Если ошибка приходит строкой
                else {
                    throw new Error(errorData.errors || 'Ошибка сервера');
                }
            }

            const data = await response.json();

            const newTransaction = {
                id: data.id,
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

            showSuccess(editingId ? 'Запись успешно обновлена' : 'Запись успешно добавлена');
            resetForm();
        } catch (error) {
            setErrorMessage(error.message || 'Произошла ошибка');
        }
    };

    const handleEdit = (transaction) => {
        setEditingId(transaction.id);
        setFormData({
            id: transaction.id,
            title: transaction.title,
            changeBalance: transaction.changeBalance,
            sum: transaction.sum.toFixed(2),
            date: new Date(transaction.date.split('.').reverse().join('-')).toISOString().split('T')[0]
        });
        setIsModalOpen(true);
        setErrorMessage(null);
    };
    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const response = await fetch(route('deleteData'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({id: itemToDelete})
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении');
            }

            setTransactions(prev => prev.filter(t => t.id !== itemToDelete));
            showSuccess('Запись успешно удалена');
        } catch (error) {
            setErrorMessage(error.message || 'Ошибка при удалении');
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const resetForm = () => {
        setFormData({
            id: null,
            title: '',
            changeBalance: true,
            sum: '',
            date: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
        setIsModalOpen(false);
        setErrorMessage(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const totals = transactions.reduce((acc, item) => {
        if (item.changeBalance) {
            acc.income += item.sum;
        } else {
            acc.expense += item.sum;
        }
        return acc;
    }, {income: 0, expense: 0});

    return (
        <div className="space-y-4 table_container">
            {/* Уведомление об успехе */}
            {successMessage && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
                    {successMessage}
                </div>
            )}
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
                                        onClick={() => handleDeleteClick(item.id)}
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
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Подтверждение удаления</h2>
                            <p className="mb-6">Вы уверены, что хотите удалить эту запись? Это действие нельзя
                                отменить.</p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Нет, отменить
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Да, удалить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingId ? 'Редактировать запись' : 'Добавить новую запись'}
                            </h2>

                            {errorMessage && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                    <ul className="list-disc pl-5">
                                        {errorMessage.split('\n').map((line, index) => (
                                            <li key={index}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Название
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
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
                                        onChange={(e) => handleInputChange('changeBalance', e.target.value === 'true')}
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
                                        onChange={(e) => handleInputChange('sum', e.target.value)}
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
                                        onChange={(e) => handleInputChange('date', e.target.value)}
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
