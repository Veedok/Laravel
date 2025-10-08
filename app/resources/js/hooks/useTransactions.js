import { useState, useMemo } from 'react';
import axios from 'axios';
import { formatDateForInput, formatDateForDisplay } from '@/Utils/dateFormatters';

export default function useTransactions(initialData, activeTableId, isEncrypted, isLocked, onLockTable) {
    const [transactions, setTransactions] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        changeBalance: true,
        sum: '',
        date: new Date().toISOString().split('T')[0],
        tags: []
    });
    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };
    const showError = (message) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 5000);
    };
    const handleIncomeFilter = () => setFilterType('income');
    const handleExpenseFilter = () => setFilterType('expense');
    const handleClearFilter = () => setFilterType(null);
    const handleAddTransaction = () => {
        setFormData({
            title: '',
            changeBalance: true,
            sum: '',
            date: new Date().toISOString().split('T')[0],
            tags: []
        });
        setEditingTransaction(null);
        setErrorMessage(null);
        setIsModalOpen(true);
    };
    const handleLockTable = () => {
        if (onLockTable) {
            onLockTable();
            showSuccess('Данные заблокированы');
        }
    };
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
            date: formatDateForInput(transaction.date),
            tags: tags
        });
        setEditingTransaction(transaction);
        setErrorMessage(null);
        setIsModalOpen(true);
    };
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
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleAddNewTag = (newTag) => {
        console.log('Adding new tag:', newTag);
    };
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
    return {
        transactions,
        setTransactions,
        isModalOpen,
        isDeleteModalOpen,
        editingTransaction,
        itemToDelete,
        filterType,
        errorMessage,
        successMessage,
        isProcessing,
        formData,
        handleIncomeFilter,
        handleExpenseFilter,
        handleClearFilter,
        handleAddTransaction,
        handleLockTable,
        handleEdit,
        handleDeleteClick,
        handleConfirmDelete,
        handleInputChange,
        handleAddNewTag,
        handleModalClose,
        handleDeleteModalClose,
        showSuccess,
        showError
    };
}
