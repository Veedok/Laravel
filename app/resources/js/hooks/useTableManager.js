import { useState } from 'react';
import axios from 'axios';
export default function useTableManager(initialTables, showSuccess, showError) {
    const [localTables, setLocalTables] = useState(
        Object.entries(initialTables).map(([id, tableData]) => ({
            id,
            owner: tableData.owner,
            name: tableData.name,
            permissions: tableData.permissions,
            crypt: tableData.crypt
        }))
    );
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const hasPermission = (tablePermissions, permissionName) => {
        if (!tablePermissions) return false;
        return tablePermissions?.is_owner ||
            (Array.isArray(tablePermissions?.permissions) &&
                tablePermissions.permissions.includes(permissionName));
    };
    const handleShare = async (shareData) => {
        try {
            await axios.post(route('tableShare'), shareData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            showSuccess(`Доступ к таблице "${currentTable.name}" предоставлен`);
            setShareModalOpen(false);
            return true;
        } catch (error) {
            if (error.response) {
                showError(error.response.data.message ||
                    `Ошибка при предоставлении доступа (код: ${error.response.status})`);
            } else {
                showError('Не удалось предоставить доступ. Проверьте соединение.');
            }
            throw error;
        }
    };
    const submitDelete = async () => {
        if (!currentTable) {
            setDeleteModalOpen(false);
            return;
        }
        try {
            await axios.delete(route('tableDelete'), {
                data: {id: currentTable.id}
            });
            setLocalTables(prev => prev.filter(table => table.id !== currentTable.id));
            showSuccess('Таблица успешно удалена');
        } catch (error) {
            if (error.response) {
                showError(error.response.data.message ||
                    `Ошибка при удалении (код: ${error.response.status})`);
            } else {
                showError('Не удалось выполнить удаление. Проверьте соединение.');
            }
        } finally {
            setDeleteModalOpen(false);
            setCurrentTable(null);
        }
    };
    const handleEditStart = (id, newName) => {
        setLocalTables(prev =>
            prev.map(table =>
                table.id === id ? { ...table, name: newName } : table
            )
        );
        showSuccess('Название таблицы успешно изменено');
    };
    const openShareModal = (table) => {
        setCurrentTable(table);
        setShareModalOpen(true);
    };
    const openDeleteModal = (table) => {
        setCurrentTable(table);
        setDeleteModalOpen(true);
    };
    const updateTableCryptStatus = (tableId, cryptStatus) => {
        setLocalTables(prev =>
            prev.map(table =>
                table.id === tableId ? { ...table, crypt: cryptStatus } : table
            )
        );
    };
    return {
        localTables,
        shareModalOpen,
        deleteModalOpen,
        currentTable,
        setShareModalOpen,
        setDeleteModalOpen,
        hasPermission,
        handleShare,
        submitDelete,
        handleEditStart,
        openShareModal,
        openDeleteModal,
        updateTableCryptStatus
    };
}
