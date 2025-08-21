// TransactionsTable.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../../css/payTable.css';
import ToastNotification from './common/ToastNotification.jsx';
import TotalsSummary from './PayTable/TotalsSummary.jsx';
import DesktopTableRow from './PayTable/DesktopTableRow.jsx';
import MobileTransactionCard from './PayTable/MobileTransactionCard.jsx';
import ConfirmModal from "@/Components/common/ConfirmModal.jsx";
import TransactionFormModal from "@/Components/PayTable/TransactionFormModal.jsx";
import AddTransactionButton from "@/Components/PayTable/AddTransactionButton.jsx";

const TransactionsTable = ({ data, activeTableId, permissions, theme }) => {
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
        date: new Date().toISOString().split('T')[0]
    });

    const [transactions, setTransactions] = useState(data);

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
            />

            {/* Десктопная таблица */}
            <div className="hidden md:block">
                <table className="min-w-full divide-y">
                    <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Название</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Тип операции</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Сумма</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Дата</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider action_head">Действия</th>
                    </tr>
                    </thead>
                    <tbody className={`divide-y ${
                        theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                    }`}>
                    {transactions.map((item) => (
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

            {/* Мобильные карточки */}
            <div className="md:hidden space-y-3">
                {transactions.map((item) => (
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
            />
        </div>
    );
};

export default TransactionsTable;
