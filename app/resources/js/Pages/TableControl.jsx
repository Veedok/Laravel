import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import '../../css/TableControll.css';
import TableRow from '../Components/TableControl/TableRow.jsx';
import ShareModal from '../Components/TableControl/ShareModal.jsx';
import ConfirmModal from '../Components/common/ConfirmModal.jsx';
import ToastNotification from '../Components/common/ToastNotification.jsx';


export default function TableManager({ theme, tables, permissions, userRights }) {
    const [localTables, setLocalTables] = useState(
        Object.entries(tables).map(([id, tableData]) => ({
            id,
            owner: tableData.owner,
            name: tableData.name,
            permissions: tableData.permissions
        }))
    );
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const hasPermission = (tablePermissions, permissionName) => {
        return tablePermissions?.is_owner ||
            (Array.isArray(tablePermissions?.permissions) &&
                tablePermissions.permissions.includes(permissionName));
    };

    const showNotification = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });

        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    const showSuccess = (message) => showNotification(message, 'success');
    const showError = (message) => showNotification(message, 'error');

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

    return (
        <AuthenticatedLayout
            header={
                <h2 className={`text-xl font-semibold leading-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    Управление таблицами
                </h2>
            }
            theme={theme}
        >
            <Head title="Таблица Баланса" />
            <div className="container mx-auto px-4 py-8">
                <div className={`shadow-md rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                            Управление таблицами
                        </h2>
                    </div>

                    <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {localTables.map(table => (
                            <TableRow
                                key={table.id}
                                table={table}
                                theme={theme}
                                permissions={permissions}
                                onEditStart={handleEditStart}
                                onShare={openShareModal}
                                onDelete={openDeleteModal}
                                hasPermission={hasPermission}
                            />
                        ))}
                    </div>
                </div>

                <ShareModal
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    table={currentTable}
                    theme={theme}
                    permissions={permissions}
                    onShare={handleShare}
                />

                <ConfirmModal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setDeleteError('');
                    }}
                    onConfirm={submitDelete}
                    title="Удалить таблицу"
                    message={`Вы уверены, что хотите удалить таблицу "${currentTable?.name}"? Это действие нельзя отменить.`}
                    theme={theme}
                />
            </div>

            {toast.show && (
                <ToastNotification
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                    theme={theme}
                />
            )}
        </AuthenticatedLayout>
    );
}
