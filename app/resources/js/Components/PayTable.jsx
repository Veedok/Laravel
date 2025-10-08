import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import '../../css/payTable.css';
import TotalsSummary from "@/Components/PayTable/TotalsSummary.jsx";
import DesktopTableRow from "@/Components/PayTable/DesktopTableRow.jsx";
import MobileTransactionCard from "@/Components/PayTable/MobileTransactionCard.jsx";
import TransactionFormModal from "@/Components/PayTable/TransactionFormModal.jsx";
import ConfirmModal from "@/Components/common/ConfirmModal.jsx";
import useTransactions from '@/hooks/useTransactions.js';
import useEncryptionOperations from '@/hooks/useEncryptionOperations.js';
import useWindowSize from '@/hooks/useWindowSize.js';
import { formatCurrency } from '@/Utils/currencyFormatters.js';
import TransactionSaveService from '@/Services/TransactionSaveService.js';

export default function PayTable({
                                     data,
                                     activeTableId,
                                     permissions,
                                     theme,
                                     userTags,
                                     isEncrypted,
                                     isLocked,
                                     onLockTable
                                 }) {
    const { windowWidth, isMobile, compactTotals } = useWindowSize();
    const {
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
        handleLockTable: handleLockTableWithNotification,
        handleEdit,
        handleDeleteClick,
        handleConfirmDelete,
        handleInputChange,
        handleAddNewTag,
        handleModalClose,
        handleDeleteModalClose,
        showSuccess,
        showError
    } = useTransactions(data, activeTableId, isEncrypted, isLocked, onLockTable);
    const { decryptedData } = useEncryptionOperations(activeTableId, isEncrypted, isLocked, transactions);
    const displayData = useMemo(() => {
        return decryptedData;
    }, [decryptedData]);
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
    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        try {
            const result = await TransactionSaveService.saveTransaction({
                formData,
                editingTransaction,
                activeTableId,
                isEncrypted,
                isLocked,
                userTags
            });
            if (result.success) {
                setTransactions(prev =>
                    editingTransaction
                        ? prev.map(t => t.id === editingTransaction.id ? result.transaction : t)
                        : [...prev, result.transaction]
                );
                showSuccess(editingTransaction ? 'Запись успешно обновлена' : 'Запись успешно добавлена');
                handleModalClose();
            } else {
                showError(result.error);
            }
        } catch (error) {
            console.error('Ошибка при сохранении транзакции:', error);
            showError('Не удалось выполнить запрос. Проверьте соединение.');
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
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        lockButton: theme === 'dark'
            ? 'bg-gray-600 hover:bg-gray-700 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
    };
    return (
        <div>
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                    Транзакции {filterType && `(${filterType === 'income' ? 'Доходы' : 'Расходы'})`}
                </h2>
                <div className="flex gap-2">
                    {isEncrypted && !isLocked && (
                        <button
                            onClick={handleLockTableWithNotification}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${themeClasses.lockButton}`}
                        >
                            <LockClosedIcon className="w-5 h-5" />
                            Заблокировать
                        </button>
                    )}
                    {(permissions.is_owner || permissions.permissions.includes('addTransaction')) && (
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
            </div>
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
