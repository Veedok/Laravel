// TransactionsTable.jsx
import React, { useState, useMemo } from 'react';
import axios from 'axios';
import '../../css/payTable.css';
import ToastNotification from './common/ToastNotification.jsx';
import TotalsSummary from './PayTable/TotalsSummary.jsx';
import DesktopTableRow from './PayTable/DesktopTableRow.jsx';
import MobileTransactionCard from './PayTable/MobileTransactionCard.jsx';
import ConfirmModal from "@/Components/common/ConfirmModal.jsx";
import TransactionFormModal from "@/Components/PayTable/TransactionFormModal.jsx";
import AddTransactionButton from "@/Components/PayTable/AddTransactionButton.jsx";
import { ChevronUpIcon, ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

const TransactionsTable = ({ data, activeTableId, permissions, theme, userTags: initialUserTags }) => {
    const [isSortExpanded, setIsSortExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        changeBalance: true,
        sum: '',
        date: new Date().toISOString().split('T')[0],
        tags: ''
    });

    const [transactions, setTransactions] = useState(data);
    const [userTags, setUserTags] = useState(initialUserTags || []);

    // Состояние для сортировки
    const [sortConfig, setSortConfig] = useState({
        key: 'date',
        direction: 'desc'
    });

    // Функция для сортировки транзакций
    const sortedTransactions = useMemo(() => {
        const sortedArray = [...transactions];

        sortedArray.sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'type':
                    aValue = a.changeBalance ? 1 : 0;
                    bValue = b.changeBalance ? 1 : 0;
                    break;
                case 'sum':
                    aValue = a.sum;
                    bValue = b.sum;
                    break;
                case 'date':
                    aValue = new Date(a.date.split('.').reverse().join('-'));
                    bValue = new Date(b.date.split('.').reverse().join('-'));
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sortedArray;
    }, [transactions, sortConfig]);

    // Функция для обработки сортировки
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Функция для отображения иконки сортировки
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowsUpDownIcon className="w-4 h-4 ml-1 opacity-50" />;
        }

        return sortConfig.direction === 'asc'
            ? <ChevronUpIcon className="w-4 h-4 ml-1" />
            : <ChevronDownIcon className="w-4 h-4 ml-1" />;
    };

    // Функция для добавления нового тега в список
    const addNewTag = (newTag) => {
        if (!userTags.includes(newTag)) {
            setUserTags(prev => [...prev, newTag]);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
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
            tableId: activeTableId,
            tags: formData.tags,
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
                const errorData = error.response.data;
                setErrorMessage(
                    errorData.message ||
                    Object.values(errorData.errors || {}).flat().join('\n') ||
                    'Ошибка сервера'
                );
            } else {
                setErrorMessage('Не удалось выполнить запрос. Проверьте соединение.');
            }
        }
    };

    const handleEdit = (transaction) => {
        setEditingId(transaction.id);
        setFormData({
            id: transaction.id,
            title: transaction.title,
            changeBalance: transaction.changeBalance,
            sum: transaction.sum.toFixed(2),
            date: new Date(transaction.date.split('.').reverse().join('-')).toISOString().split('T')[0],
            tags: transaction.tags?.join(' ') || ''
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

        setIsDeleting(true);
        try {
            await axios.delete(route('deleteData'), {
                data: { id: itemToDelete }
            });

            setTransactions(prev => prev.filter(t => t.id !== itemToDelete));
            showSuccess('Запись успешно удалена');
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            if (error.response?.status === 404) {
                showSuccess('Запись уже была удалена');
            } else {
                setErrorMessage(
                    error.response?.data.message ||
                    'Не удалось выполнить удаление. Проверьте соединение.'
                );
            }
        } finally {
            setIsDeleting(false);
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
    }, { income: 0, expense: 0 });

    const formatCurrency = (amount) => {
        return amount.toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2
        });
    };

    return (
        <div className={`space-y-6 table_container ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>

            {successMessage && (
                <ToastNotification
                    message={successMessage}
                    type="success"
                    theme={theme}
                    onClose={() => setSuccessMessage(null)}
                    autoClose={true}
                    autoCloseDuration={3000}
                />
            )}

            <TotalsSummary
                totals={totals}
                theme={theme}
                formatCurrency={formatCurrency}
                compact={true}
            />

            {/* Мобильная сортировка */}
            <div className="md:hidden">
                <div className={`rounded-lg mb-3 ${
                    theme === 'dark'
                        ? 'bg-gray-700 border border-gray-600'
                        : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                    {/* Заголовок аккордеона */}
                    <button
                        onClick={() => setIsSortExpanded(!isSortExpanded)}
                        className={`w-full p-3 flex items-center justify-between text-sm font-medium transition-colors ${
                            theme === 'dark'
                                ? 'hover:bg-gray-600 text-gray-200'
                                : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        <div className="flex items-center">
                            <ArrowsUpDownIcon className="w-4 h-4 mr-2"/>
                            <span>Сортировка: {getSortLabel(sortConfig)}</span>
                        </div>
                        {isSortExpanded ? (
                            <ChevronUpIcon className="w-4 h-4"/>
                        ) : (
                            <ChevronDownIcon className="w-4 h-4"/>
                        )}
                    </button>

                    {/* Выпадающая часть */}
                    {isSortExpanded && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-600">
                            <select
                                className={`w-full p-2 text-sm rounded border focus:outline-none focus:ring-1 transition-all ${
                                    theme === 'dark'
                                        ? 'bg-gray-600 border-gray-500 text-white focus:ring-blue-400 focus:border-blue-400'
                                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                                value={`${sortConfig.key}-${sortConfig.direction}`}
                                onChange={(e) => {
                                    const [key, direction] = e.target.value.split('-');
                                    setSortConfig({key, direction});
                                    setIsSortExpanded(false); // Автоматически скрываем после выбора
                                }}
                                size={6} // Показываем несколько вариантов без скролла
                            >
                                <option value="date-desc">📅 Новые сначала</option>
                                <option value="date-asc">📅 Старые сначала</option>
                                <option value="title-asc">📝 А-Я</option>
                                <option value="title-desc">📝 Я-А</option>
                                <option value="sum-desc">💰 По убыванию</option>
                                <option value="sum-asc">💰 По возрастанию</option>
                                <option value="type-desc">🔄 Доходы сначала</option>
                                <option value="type-asc">🔄 Расходы сначала</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="hidden md:block">
                <table className="min-w-full divide-y">
                    <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:opacity-80"
                            onClick={() => handleSort('title')}
                        >
                            <div className="flex items-center">
                                Название
                                {renderSortIcon('title')}
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:opacity-80"
                            onClick={() => handleSort('type')}
                        >
                            <div className="flex items-center">
                                Тип операции
                                {renderSortIcon('type')}
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:opacity-80"
                            onClick={() => handleSort('sum')}
                        >
                            <div className="flex items-center">
                                Сумма
                                {renderSortIcon('sum')}
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:opacity-80"
                            onClick={() => handleSort('date')}
                        >
                            <div className="flex items-center">
                                Дата
                                {renderSortIcon('date')}
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider action_head">Действия</th>
                    </tr>
                    </thead>
                    <tbody className={`divide-y ${
                        theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                    }`}>
                    {sortedTransactions.map((item) => (
                        <DesktopTableRow
                            key={item.id}
                            item={item}
                            theme={theme}
                            formatCurrency={formatCurrency}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            permissions={permissions}
                        />
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-3">
                {sortedTransactions.map((item) => (
                    <MobileTransactionCard
                        key={item.id}
                        item={item}
                        theme={theme}
                        formatCurrency={formatCurrency}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        permissions={permissions}
                    />
                ))}
            </div>

            <AddTransactionButton
                onClick={() => setIsModalOpen(true)}
                theme={theme}
                permissions={permissions}
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить."
                theme={theme}
                isProcessing={isDeleting}
            />

            <TransactionFormModal
                isOpen={isModalOpen}
                onClose={resetForm}
                onSubmit={handleSubmit}
                formData={formData}
                onInputChange={handleInputChange}
                errorMessage={errorMessage}
                theme={theme}
                editingId={editingId}
                userTags={userTags}
                onAddNewTag={addNewTag}
            />
        </div>
    );
};
const getSortLabel = (sortConfig) => {
    const labels = {
        'date-desc': 'Дата (новые сначала)',
        'date-asc': 'Дата (старые сначала)',
        'title-asc': 'Название (А-Я)',
        'title-desc': 'Название (Я-А)',
        'sum-desc': 'Сумма (по убыванию)',
        'sum-asc': 'Сумма (по возрастанию)',
        'type-desc': 'Тип (доходы сначала)',
        'type-asc': 'Тип (расходы сначала)'
    };
    return labels[`${sortConfig.key}-${sortConfig.direction}`] || 'Дата';
};
export default TransactionsTable;
