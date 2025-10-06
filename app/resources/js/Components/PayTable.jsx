// TransactionsTable.jsx
import React, {useState, useMemo, useEffect} from 'react';
import axios from 'axios';
import '../../css/payTable.css';
import ToastNotification from './common/ToastNotification.jsx';
import TotalsSummary from './PayTable/TotalsSummary.jsx';
import DesktopTableRow from './PayTable/DesktopTableRow.jsx';
import MobileTransactionCard from './PayTable/MobileTransactionCard.jsx';
import ConfirmModal from "@/Components/common/ConfirmModal.jsx";
import TransactionFormModal from "@/Components/PayTable/TransactionFormModal.jsx";
import AddTransactionButton from "@/Components/PayTable/AddTransactionButton.jsx";
import {ChevronUpIcon, ChevronDownIcon, ArrowsUpDownIcon, XMarkIcon} from '@heroicons/react/24/outline';
import EncryptionService from "@/Pages/Crypto/encryptionService.js";

const TransactionsTable = ({
                               data,
                               activeTableId,
                               permissions,
                               theme,
                               userTags: initialUserTags,
                               isEncrypted,
                               isLocked
                           }) => {
    const [decryptedData, setDecryptedData] = useState([]);
    const [filterType, setFilterType] = useState(null);
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
    useEffect(() => {
        const loadDecryptedData = async () => {
            const decrypted = await decryptTransactions(data);
            setDecryptedData(decrypted);
        };

        loadDecryptedData();
    }, [data, isEncrypted, isLocked, activeTableId]);

    const [transactions, setTransactions] = useState(decryptedData);

    useEffect(() => {
        setTransactions(decryptedData);
    }, [decryptedData]);
    const decryptTransactions = async (transactions) => {
        if (!isEncrypted || isLocked) {
            return transactions.map(item => ({
                ...item,
                displayTitle: "🔒 Зашифрованная запись",
                displaySum: "***"
            }));
        }

        try {
            // Получаем ключ из localStorage
            const storedDataKey = localStorage.getItem(`table_${activeTableId}_dataKey`);
            if (!storedDataKey) {
                throw new Error('Ключ расшифровки не найден');
            }

            const dataKey = await EncryptionService.importKey(storedDataKey);
            const decryptedTransactions = [];

            for (const item of transactions) {
                try {
                    // Расшифровываем title и sum
                    const decryptedTitle = await EncryptionService.decryptData(item.title, dataKey);
                    const decryptedSum = await EncryptionService.decryptData(item.sum, dataKey);

                    decryptedTransactions.push({
                        ...item,
                        title: decryptedTitle,
                        sum: parseFloat(decryptedSum),
                        displayTitle: decryptedTitle,
                        displaySum: parseFloat(decryptedSum)
                    });
                } catch (itemError) {
                    console.error(`Ошибка расшифровки транзакции ${item.id}:`, itemError);
                    // Если не удалось расшифровать, показываем заглушку
                    decryptedTransactions.push({
                        ...item,
                        displayTitle: "🔒 Ошибка расшифровки",
                        displaySum: "***"
                    });
                }
            }

            return decryptedTransactions;
        } catch (error) {
            console.error('Ошибка расшифровки данных:', error);
            // Возвращаем транзакции с заглушками
            return transactions.map(item => ({
                ...item,
                displayTitle: "🔒 Ошибка доступа",
                displaySum: "***"
            }));
        }
    };
    const displayTitle = (item) => {
        if (isEncrypted && isLocked) {
            return "🔒 Зашифрованная запись";
        }
        // Если разблокировано, но данные все еще зашифрованы - нужна ручная расшифровка
        // Пока просто показываем как есть
        return item.title;
    };


    const displaySum = (item) => {
        if (isEncrypted && isLocked) {
            return "***";
        }
        return item.sum;
    };
    const [userTags, setUserTags] = useState(initialUserTags || []);

    const [sortConfig, setSortConfig] = useState({
        key: 'date',
        direction: 'desc'
    });
    const filteredAndSortedTransactions = useMemo(() => {
        let filteredArray = [...transactions];
        if (filterType === 'income') {
            filteredArray = filteredArray.filter(item => item.changeBalance);
        } else if (filterType === 'expense') {
            filteredArray = filteredArray.filter(item => !item.changeBalance);
        }
        filteredArray.sort((a, b) => {
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

        return filteredArray;
    }, [transactions, sortConfig, filterType]);

    const handleIncomeClick = () => {
        setFilterType('income');
    };

    const handleExpenseClick = () => {
        setFilterType('expense');
    };

    const handleClearFilter = () => {
        setFilterType(null);
    };

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

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowsUpDownIcon className="w-4 h-4 ml-1 opacity-50"/>;
        }

        return sortConfig.direction === 'asc'
            ? <ChevronUpIcon className="w-4 h-4 ml-1"/>
            : <ChevronDownIcon className="w-4 h-4 ml-1"/>;
    };

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
        if (!canEdit) {
            alert('Данные заблокированы. Сначала разблокируйте таблицу.');
            return;
        }
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
        if (!canEdit) {
            alert('Данные заблокированы. Сначала разблокируйте таблицу.');
            return;
        }
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            await axios.delete(route('deleteData'), {
                data: {id: itemToDelete}
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
    }, {income: 0, expense: 0});
    const canEdit = !isEncrypted || !isLocked;
    const formatCurrency = (amount) => {
        // Если amount - строка (заглушка), возвращаем как есть
        if (typeof amount === 'string') {
            return amount;
        }

        // Если amount - число, форматируем как валюту
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
                filterType={filterType}
                onIncomeClick={handleIncomeClick}
                onExpenseClick={handleExpenseClick}
                onClearFilter={handleClearFilter}
                isLocked={isLocked}
            />
            <div className="md:hidden">
                <div className={`rounded-lg mb-3 ${
                    theme === 'dark'
                        ? 'bg-gray-700 border border-gray-600'
                        : 'bg-white border border-gray-200 shadow-sm'
                }`}>
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
                                    setIsSortExpanded(false);
                                }}
                                size={6}
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
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Название
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Тип операции
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Сумма
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Дата
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider action_head">
                            Действия
                        </th>
                    </tr>
                    </thead>
                    <tbody className={`divide-y ${
                        theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                    }`}>
                    {filteredAndSortedTransactions.map((item) => (
                        <tr key={item.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {displayTitle(item)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {item.changeBalance ? (
                                    <span className="text-green-600 font-medium">Доход</span>
                                ) : (
                                    <span className="text-red-600 font-medium">Расход</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {formatCurrency(displaySum(item))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {item.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium action_head">
                                {canEdit && permissions?.is_owner && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                )}
                                {!canEdit && (
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                        Заблокировано
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Аналогично обновляем мобильную версию */}
            <div className="md:hidden space-y-3">
                {filteredAndSortedTransactions.map((item) => (
                    <div key={item.id} className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">
                                {displayTitle(item)}
                            </div>
                            <div className="font-medium">
                                {formatCurrency(displaySum(item))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-4">
                                <span>
                                    {item.changeBalance ? (
                                        <span className="text-green-600 font-medium">Доход</span>
                                    ) : (
                                        <span className="text-red-600 font-medium">Расход</span>
                                    )}
                                </span>
                                <span>{item.date}</span>
                            </div>
                            {canEdit && permissions?.is_owner && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                                    >
                                        Редакт.
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(item.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            )}
                            {!canEdit && (
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    Заблокировано
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Блокируем кнопку добавления если данные заблокированы */}
            {canEdit && (
                <AddTransactionButton
                    onClick={() => setIsModalOpen(true)}
                    theme={theme}
                    permissions={permissions}
                />
            )}
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
