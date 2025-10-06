// PayTable.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import '../../css/payTable.css';
import TotalsSummary from "@/Components/PayTable/TotalsSummary.jsx";
import DesktopTableRow from "@/Components/PayTable/DesktopTableRow.jsx";
import MobileTransactionCard from "@/Components/PayTable/MobileTransactionCard.jsx";
import TransactionFormModal from "@/Components/PayTable/TransactionFormModal.jsx";
import ConfirmModal from "@/Components/common/ConfirmModal.jsx";
import EncryptionService from '@/Pages/Crypto/encryptionService';

export default function PayTable({
                                     data,
                                     activeTableId,
                                     permissions,
                                     theme,
                                     userTags,
                                     isEncrypted,
                                     isLocked
                                 }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [decryptedData, setDecryptedData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const isMobile = windowWidth < 768;
    const compactTotals = windowWidth < 640;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Функции для преобразования дат
    const formatDateForInput = (dateString) => {
        if (!dateString) return new Date().toISOString().split('T')[0];

        // Если дата в формате dd.MM.yyyy
        if (dateString.includes('.')) {
            const [day, month, year] = dateString.split('.');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Если дата уже в формате yyyy-MM-dd
        return dateString;
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('ru-RU');

        // Если дата в формате yyyy-MM-dd
        if (dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
        }

        // Если дата уже в формате dd.MM.yyyy
        return dateString;
    };

    // Инициализируем transactions при получении новых данных
    useEffect(() => {
        setTransactions(data);
    }, [data]);

    // Функция для проверки, является ли строка зашифрованными данными
    const isEncryptedString = (str) => {
        if (typeof str !== 'string') return false;
        return str.length >= 16 && /^[A-Za-z0-9+/=]+$/.test(str) && str.length % 4 === 0;
    };

    // Функция для расшифровки одного элемента
    const decryptItem = async (item, dataKey) => {
        try {
            let title = item.title;
            let sum = item.sum;

            // Расшифровываем title если он зашифрован
            if (isEncryptedString(item.title)) {
                title = await EncryptionService.decryptData(item.title, dataKey);
            }

            // Расшифровываем sum если он зашифрован
            if (isEncryptedString(item.sum)) {
                const decryptedSum = await EncryptionService.decryptData(item.sum, dataKey);
                sum = parseFloat(decryptedSum);
                if (isNaN(sum)) {
                    console.warn('Расшифрованная сумма не является числом:', decryptedSum);
                    sum = 0;
                }
            } else if (typeof item.sum === 'string') {
                sum = parseFloat(item.sum);
                if (isNaN(sum)) sum = 0;
            }

            return {
                ...item,
                title,
                sum
            };
        } catch (error) {
            console.error('Ошибка расшифровки элемента:', error);
            return {
                ...item,
                title: '••••••••',
                sum: 0
            };
        }
    };

    // Функция для расшифровки всех данных
    const decryptData = async (encryptedData) => {
        if (!isEncrypted) {
            return encryptedData;
        }

        try {
            const dataKeyBase64 = localStorage.getItem(`table_${activeTableId}_dataKey`);

            if (!dataKeyBase64) {
                console.warn('Ключ данных не найден, показываем заглушки');
                return encryptedData.map(item => ({
                    ...item,
                    title: '••••••••',
                    sum: 0
                }));
            }

            const dataKey = await EncryptionService.importKey(dataKeyBase64);
            const decryptedItems = [];

            for (const item of encryptedData) {
                const decryptedItem = await decryptItem(item, dataKey);
                decryptedItems.push(decryptedItem);
            }

            return decryptedItems;
        } catch (error) {
            console.error('Ошибка при расшифровке данных:', error);
            return encryptedData.map(item => ({
                ...item,
                title: '••••••••',
                sum: 0
            }));
        }
    };

    // Эффект для расшифровки данных при изменении состояния блокировки
    useEffect(() => {
        const loadDecryptedData = async () => {
            if (isEncrypted && !isLocked) {
                const decrypted = await decryptData(transactions);
                setDecryptedData(decrypted);
            } else if (isEncrypted && isLocked) {
                setDecryptedData(transactions.map(item => ({
                    ...item,
                    title: '••••••••',
                    sum: 0
                })));
            } else {
                setDecryptedData(transactions);
            }
        };

        loadDecryptedData();
    }, [transactions, isEncrypted, isLocked, activeTableId]);

    // Используем правильные данные для отображения
    const displayData = useMemo(() => {
        return decryptedData;
    }, [decryptedData]);

    const formatCurrency = (amount) => {
        const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (isNaN(numberAmount)) {
            return '•••••';
        }

        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(numberAmount);
    };

    const filteredData = useMemo(() => {
        if (!filterType) return displayData;
        return displayData.filter(item =>
            filterType === 'income' ? item.changeBalance : !item.changeBalance
        );
    }, [displayData, filterType]);

    const totals = useMemo(() => {
        return displayData.reduce((acc, item) => {
            const amount = typeof item.sum === 'string' ? parseFloat(item.sum) : item.sum;
            if (!isNaN(amount)) {
                if (item.changeBalance) {
                    acc.income += amount;
                } else {
                    acc.expense += amount;
                }
            }
            return acc;
        }, { income: 0, expense: 0 });
    }, [displayData]);

    // Функции для уведомлений
    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const showError = (message) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 5000);
    };

    // Фильтры
    const handleIncomeFilter = () => setFilterType('income');
    const handleExpenseFilter = () => setFilterType('expense');
    const handleClearFilter = () => setFilterType(null);

    // Добавление транзакции
    const handleAddTransaction = () => {
        setFormData({
            title: '',
            changeBalance: true,
            sum: '',
            date: new Date().toISOString().split('T')[0], // yyyy-MM-dd
            tags: []
        });
        setEditingTransaction(null);
        setErrorMessage(null);
        setIsModalOpen(true);
    };

    // Редактирование транзакции
    const handleEdit = (transaction) => {
        if (isLocked) {
            showError('Данные заблокированы. Сначала разблокируйте таблицу.');
            return;
        }

        const tags = Array.isArray(transaction.tags)
            ? transaction.tags
            : (transaction.tags && typeof transaction.tags === 'string'
                ? transaction.tags.split(' ').filter(tag => tag.trim() !== '')
                : []);

        setFormData({
            title: transaction.title,
            changeBalance: transaction.changeBalance,
            sum: transaction.sum.toString(),
            date: formatDateForInput(transaction.date), // Преобразуем дату для input
            tags: tags
        });
        setEditingTransaction(transaction);
        setErrorMessage(null);
        setIsModalOpen(true);
    };

    // Удаление транзакции
    const handleDeleteClick = (id) => {
        if (isLocked) {
            showError('Данные заблокированы. Сначала разблокируйте таблицу.');
            return;
        }
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setIsProcessing(true);
        try {
            await axios.delete(route('deleteData'), {
                data: { id: itemToDelete }
            });

            setTransactions(prev => prev.filter(t => t.id !== itemToDelete));
            showSuccess('Запись успешно удалена');
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            if (error.response?.status === 404) {
                showSuccess('Запись уже была удалена');
                setTransactions(prev => prev.filter(t => t.id !== itemToDelete));
            } else {
                showError(
                    error.response?.data.message ||
                    'Не удалось выполнить удаление. Проверьте соединение.'
                );
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Закрытие модальных окон
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
        setFormData({
            title: '',
            changeBalance: true,
            sum: '',
            date: new Date().toISOString().split('T')[0],
            tags: []
        });
        setErrorMessage(null);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    // Form data state
    const [formData, setFormData] = useState({
        title: '',
        changeBalance: true,
        sum: '',
        date: new Date().toISOString().split('T')[0],
        tags: []
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddNewTag = (newTag) => {
        console.log('Adding new tag:', newTag);
    };

    // Сохранение транзакции (добавление/редактирование)
    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsProcessing(true);

        try {
            // Преобразуем дату обратно в формат dd.MM.yyyy для сервера
            const serverDate = formatDateForDisplay(formData.date);

            let payload = {
                id: editingTransaction?.id,
                name: formData.title,
                type: formData.changeBalance,
                sum: parseFloat(formData.sum),
                date: serverDate, // Отправляем в формате dd.MM.yyyy
                tableId: activeTableId,
                tags: Array.isArray(formData.tags) ? formData.tags.join(' ') : formData.tags,
            };

            // Если таблица зашифрована и разблокирована, шифруем name и sum
            if (isEncrypted && !isLocked) {
                const dataKeyBase64 = localStorage.getItem(`table_${activeTableId}_dataKey`);
                if (dataKeyBase64) {
                    const dataKey = await EncryptionService.importKey(dataKeyBase64);

                    const encryptedName = await EncryptionService.encryptData(formData.title, dataKey);
                    const encryptedSum = await EncryptionService.encryptData(formData.sum.toString(), dataKey);

                    payload = {
                        ...payload,
                        name: encryptedName,
                        sum: encryptedSum
                    };
                } else {
                    throw new Error('Ключ шифрования не найден');
                }
            }

            const url = editingTransaction ? route('updateData') : route('saveData');
            const method = editingTransaction ? 'put' : 'post';

            const response = await axios[method](url, payload);

            // Обновляем локальное состояние
            const newTransaction = {
                id: response.data.id,
                title: formData.title,
                changeBalance: formData.changeBalance,
                sum: parseFloat(formData.sum),
                date: serverDate, // Сохраняем в формате dd.MM.yyyy
                tags: formData.tags
            };

            setTransactions(prev =>
                editingTransaction
                    ? prev.map(t => t.id === editingTransaction.id ? newTransaction : t)
                    : [...prev, newTransaction]
            );

            showSuccess(editingTransaction ? 'Запись успешно обновлена' : 'Запись успешно добавлена');
            handleModalClose();

        } catch (error) {
            console.error('Ошибка при сохранении транзакции:', error);
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
        } finally {
            setIsProcessing(false);
        }
    };

    const themeClasses = {
        table: theme === 'dark'
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-900',
        tableHeader: theme === 'dark'
            ? 'bg-gray-700 text-gray-300'
            : 'bg-gray-50 text-gray-500',
        addButton: theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
    };

    return (
        <div>
            {/* Уведомления */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded">
                    {errorMessage}
                </div>
            )}

            {/* Суммарные блоки */}
            <div className="mb-6">
                <TotalsSummary
                    totals={totals}
                    theme={theme}
                    formatCurrency={formatCurrency}
                    compact={compactTotals}
                    filterType={filterType}
                    onIncomeClick={handleIncomeFilter}
                    onExpenseClick={handleExpenseFilter}
                    onClearFilter={handleClearFilter}
                    isLocked={isLocked}
                />
            </div>

            {/* Заголовок и кнопка добавления */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                    Транзакции {filterType && `(${filterType === 'income' ? 'Доходы' : 'Расходы'})`}
                </h2>

                {(permissions.is_owner || permissions.permissions.includes('createTransactions')) && (
                    <button
                        onClick={handleAddTransaction}
                        disabled={isLocked}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                            themeClasses.addButton
                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <PlusIcon className="w-5 h-5" />
                        Добавить
                    </button>
                )}
            </div>

            {/* Desktop таблица */}
            {!isMobile && (
                <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${themeClasses.table}`}>
                        <thead className={themeClasses.tableHeader}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Название
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Тип
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Сумма
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Дата
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredData.map((item) => (
                            <DesktopTableRow
                                key={item.id}
                                item={item}
                                theme={theme}
                                formatCurrency={formatCurrency}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                permissions={permissions}
                                isLocked={isLocked}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile карточки */}
            {isMobile && (
                <div className="space-y-4">
                    {filteredData.map((item) => (
                        <MobileTransactionCard
                            key={item.id}
                            item={item}
                            theme={theme}
                            formatCurrency={formatCurrency}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            permissions={permissions}
                            isLocked={isLocked}
                        />
                    ))}
                </div>
            )}

            {/* Модальное окно для добавления/редактирования */}
            <TransactionFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleSaveTransaction}
                formData={formData}
                onInputChange={handleInputChange}
                errorMessage={errorMessage}
                theme={theme}
                editingId={editingTransaction?.id}
                userTags={userTags}
                onAddNewTag={handleAddNewTag}
                isProcessing={isProcessing}
            />

            {/* Модальное окно подтверждения удаления */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteModalClose}
                onConfirm={handleConfirmDelete}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить."
                confirmText="Да, удалить"
                cancelText="Нет, отменить"
                theme={theme}
                isProcessing={isProcessing}
            />
        </div>
    );
}
