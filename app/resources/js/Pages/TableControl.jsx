// TableControl.jsx
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import '../../css/TableControll.css';
import TableRow from '../Components/TableControl/TableRow.jsx';
import ShareModal from '../Components/TableControl/ShareModal.jsx';
import ConfirmModal from '../Components/common/ConfirmModal.jsx';
import ToastNotification from '../Components/common/ToastNotification.jsx';
import EncryptionModal from '../Components/TableControl/EncryptionModal.jsx';
import PasswordPromptModal from '../Components/TableControl/PasswordPromptModal.jsx';
import useToast from "@/hooks/useToast.js";
import useTableManager from '@/hooks/useTableManager.js';
import useEncryptionManager from '@/hooks/useEncryptionManager.js';

export default function TableManager({ theme, tables, permissions, userRights, auth }) {
    const { toast, showSuccess, showError, hideToast } = useToast();
    const {
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
    } = useTableManager(tables, showSuccess, showError);
    const {
        encryptionModalOpen,
        passwordPromptOpen,
        currentTable: encryptionTable,
        setEncryptionModalOpen,
        setPasswordPromptOpen,
        openEncryptionModal,
        handleEncryptionSubmit,
        handlePasswordSubmit
    } = useEncryptionManager(auth, showSuccess, showError);
    const handleEncryptionWithUpdate = async (passwords, users) => {
        const result = await handleEncryptionSubmit(passwords, users);
        if (result?.success && encryptionTable) {
            updateTableCryptStatus(encryptionTable.id, result.crypt);
        }
    };
    const handlePasswordWithUpdate = async (password) => {
        const result = await handlePasswordSubmit(password);
        if (result?.success && encryptionTable) {
            updateTableCryptStatus(encryptionTable.id, result.crypt);
        }
    };
    const handleTableEncryption = (table, action) => {
        openEncryptionModal(table, action);
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
            <Head title="Управление таблицами" />
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
                                onEncrypt={() => handleTableEncryption(table, 'encrypt')}
                                onDecrypt={() => handleTableEncryption(table, 'decrypt')}
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
                <EncryptionModal
                    isOpen={encryptionModalOpen}
                    onClose={() => setEncryptionModalOpen(false)}
                    table={encryptionTable}
                    theme={theme}
                    auth={auth}
                    onSubmit={handleEncryptionWithUpdate}
                />
                <PasswordPromptModal
                    isOpen={passwordPromptOpen}
                    onClose={() => setPasswordPromptOpen(false)}
                    table={encryptionTable}
                    theme={theme}
                    onSubmit={handlePasswordWithUpdate}
                />
                <ConfirmModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={submitDelete}
                    title="Удалить таблицу"
                    message={`Вы уверены, что хотите удалить таблицу "${currentTable?.name}"? Это действие нельзя отменить.`}
                    theme={theme}
                />
                {toast.show && (
                    <ToastNotification
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                        theme={theme}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
