import React, {useState} from 'react';
import {router} from '@inertiajs/react';
import '../../css/payTable.css';
import axios from 'axios';

const TransactionsTable = ({ data, activeTableId, permissions, theme }) => {
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
            date: formData.date,
            tableId: activeTableId
        };

        try {
            const url = editingId ? route('updateData') : route('saveData');
            const method = editingId ? 'put' : 'post';

            const response = await axios[method](url, payload);

            const newTransaction = {
                id: response.data.id,
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
            if (error.response) {
                // Ошибка от сервера (4xx/5xx)
                const errorData = error.response.data;
                setErrorMessage(
                    errorData.message ||
                    Object.values(errorData.errors || {}).flat().join('\n') ||
                    'Ошибка сервера'
                );
            } else {
                // Ошибка сети или другая проблема
                setErrorMessage('Не удалось выполнить запрос. Проверьте соединение.');
            }
            console.error('Submission error:', error);
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
        // Дополнительная проверка на случай, если modal был закрыт до завершения операции
        if (!itemToDelete || deleteModalOpen === false) {
            setItemToDelete(null);
            return;
        }

        try {
            // Фиксируем ID для удаления на момент начала операции
            const deletingId = itemToDelete;

            const response = await axios.delete(route('deleteData'), {
                data: { id: deletingId }
            });

            // Дополнительная проверка, что удаляемый элемент еще актуален
            setTransactions(prev => {
                if (!prev.some(t => t.id === deletingId)) {
                    console.warn('Элемент уже был удален');
                    return prev;
                }
                return prev.filter(t => t.id !== deletingId);
            });

            showSuccess('Запись успешно удалена');
        } catch (error) {
            if (error.response) {
                setErrorMessage(
                    error.response.data.message ||
                    `Ошибка при удалении (код: ${error.response.status})`
                );

                // Если это ошибка 404 (уже удален) - просто закрываем модальное окно
                if (error.response.status === 404) {
                    showSuccess('Запись уже была удалена');
                }
            } else {
                setErrorMessage('Не удалось выполнить удаление. Проверьте соединение.');
            }
            console.error('Delete error:', error);
        } finally {
            // Всегда сбрасываем состояние, даже если были ошибки
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
        <div className={`space-y-4 table_container ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
            {/* Уведомление об успехе */}
            {successMessage && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
                    theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-500 text-white'
                }`}>
                    {successMessage}
                </div>
            )}
            <div className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-full" style={{minWidth: 'fit-content'}}>
                    <div className={`p-4 rounded-lg border ${
                        theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-green-300'
                            : 'bg-green-50 border-green-100 text-green-800'
                    }`}>
                        <h3 className="text-sm font-medium">Суммарный приход</h3>
                        <p className="text-2xl font-semibold">
                            {totals.income.toLocaleString('ru-RU', {
                                style: 'currency',
                                currency: 'RUB',
                                minimumFractionDigits: 2
                            })}
                        </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${
                        theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-red-300'
                            : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                        <h3 className="text-sm font-medium">Суммарный расход</h3>
                        <p className="text-2xl font-semibold">
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
                <table className="min-w-full divide-y">
                    <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                            Название
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                            Тип операции
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                            Сумма
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                            Дата
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider action_head ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                            Действия
                        </th>
                    </tr>
                    </thead>
                    <tbody className={`divide-y ${
                        theme === 'dark'
                            ? 'bg-gray-800 divide-gray-700'
                            : 'bg-white divide-gray-200'
                    }`}>
                    {transactions.map((item) => (
                        <tr key={item.id}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                                {item.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {item.changeBalance ? (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        theme === 'dark'
                                            ? 'bg-green-900 text-green-300'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        Приход
                                    </span>
                                ) : (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        theme === 'dark'
                                            ? 'bg-red-900 text-red-300'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        Расход
                                    </span>
                                )}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                                {item.sum.toLocaleString('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    minimumFractionDigits: 2
                                })}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                                {item.date}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                                <div className="flex space-x-2 action_row">
                                    {(permissions.is_owner || permissions.permissions.includes('editTransactions')) && (
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className={theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}
                                            title="Редактировать"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                    {(permissions.is_owner || permissions.permissions.includes('deleteTransactions')) && (
                                        <button
                                            onClick={() => handleDeleteClick(item.id)}
                                            className={theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {(permissions.is_owner || permissions.permissions.includes('addTransaction')) && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ${
                            theme === 'dark'
                                ? 'bg-blue-700 text-white hover:bg-blue-600'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        Добавить запись
                    </button>
                </div>
            )}
            {/* Модальное окно */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`rounded-lg shadow-xl w-full max-w-md ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="p-6">
                            <h2 className={`text-xl font-semibold mb-4 ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                                Подтверждение удаления
                            </h2>
                            <p className={`mb-6 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className={`px-4 py-2 rounded-md ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                                            : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Нет, отменить
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className={`px-4 py-2 text-white rounded-md hover:bg-red-700 transition-colors ${
                                        theme === 'dark' ? 'bg-red-700' : 'bg-red-600'
                                    }`}
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
                    <div className={`rounded-lg shadow-xl w-full max-w-md ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="p-6">
                            <h2 className={`text-xl font-semibold mb-4 ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                                {editingId ? 'Редактировать запись' : 'Добавить новую запись'}
                            </h2>

                            {errorMessage && (
                                <div className={`mb-4 p-3 rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-red-900 text-red-100'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    <ul className="list-disc pl-5">
                                        {errorMessage.split('\n').map((line, index) => (
                                            <li key={index}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Название
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-2 border rounded-md ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'border-gray-300'
                                        }`}
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Тип операции
                                    </label>
                                    <select
                                        className={`w-full px-3 py-2 border rounded-md ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'border-gray-300'
                                        }`}
                                        value={formData.changeBalance}
                                        onChange={(e) => handleInputChange('changeBalance', e.target.value === 'true')}
                                        required
                                    >
                                        <option value={true}>Приход</option>
                                        <option value={false}>Расход</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Сумма
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`w-full px-3 py-2 border rounded-md ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'border-gray-300'
                                        }`}
                                        value={formData.sum}
                                        onChange={(e) => handleInputChange('sum', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Дата
                                    </label>
                                    <input
                                        type="date"
                                        className={`w-full px-3 py-2 border rounded-md ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'border-gray-300'
                                        }`}
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className={`px-4 py-2 rounded-md ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                                                : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-colors ${
                                            theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'
                                        }`}
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
