import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import '../../css/TableControll.css';
import TableRow from '../Components/TableControl/TableRow.jsx';
import ShareModal from '../Components/TableControl/ShareModal.jsx';
import ConfirmModal from '../Components/common/ConfirmModal.jsx';
import ToastNotification from '../Components/common/ToastNotification.jsx';
import EncryptionModal from '../Components/TableControl/EncryptionModal.jsx';
import PasswordPromptModal from '../Components/TableControl/PasswordPromptModal.jsx';
import EncryptionService from "@/Pages/Crypto/encryptionService.js";

export default function TableManager({ theme, tables, permissions, userRights, auth }) {
    const [localTables, setLocalTables] = useState(
        Object.entries(tables).map(([id, tableData]) => ({
            id,
            owner: tableData.owner,
            name: tableData.name,
            permissions: tableData.permissions,
            crypt: tableData.crypt
        }))
    );
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [encryptionModalOpen, setEncryptionModalOpen] = useState(false);
    const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [tableUsers, setTableUsers] = useState([]);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const hasPermission = (tablePermissions, permissionName) => {
        if (!tablePermissions) return false;
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

    // Функции для шифрования/расшифровки
    const handleEncrypt = async (passwords, users) => {
        if (!currentTable) return;

        try {
            // Получаем данные таблицы для шифрования
            const response = await axios.post(route('tableData'), {
                tableId: currentTable.id
            });

            const tableData = response.data;

            // Логика шифрования (как в оригинальном TableEncryptionControls)
            const dataKey = await EncryptionService.generateDataKey();
            const encryptedKeys = {};

            // Используем users из параметра, а не из currentTable
            for (const user of users) {
                const salt = EncryptionService.generateSalt();
                const kek = await EncryptionService.deriveKeyFromPassword(passwords[user.id], salt);
                const encryptedDataKey = await EncryptionService.encryptDataKey(dataKey, kek);

                encryptedKeys[user.id] = {
                    encryptedDataKey,
                    salt: EncryptionService.uint8ArrayToHex(salt)
                };
            }

            // Шифруем данные транзакций
            const encryptedTransactions = {};
            for (const transaction of tableData.transactions) {
                const encryptedTitle = await EncryptionService.encryptData(transaction.title, dataKey);
                const encryptedSum = await EncryptionService.encryptData(transaction.sum.toString(), dataKey);

                encryptedTransactions[transaction.id] = {
                    sum: encryptedSum,
                    title: encryptedTitle
                };
            }

            // Отправляем на сервер
            const requestData = {
                tableId: parseInt(currentTable.id),
                users: {},
                transactions: encryptedTransactions
            };

            for (const [userId, keyData] of Object.entries(encryptedKeys)) {
                requestData.users[userId] = {
                    encryptedDataKey: keyData.encryptedDataKey,
                    salt: keyData.salt
                };
            }

            await axios.post(route('cryptoTable'), requestData);

            // Сохраняем локально зашифрованные ключи
            localStorage.setItem(`table_${currentTable.id}_encryptedKeys`, JSON.stringify(encryptedKeys));

            showSuccess(`Таблица "${currentTable.name}" успешно зашифрована!`);
            setEncryptionModalOpen(false);

            // Обновляем состояние таблицы
            setLocalTables(prev =>
                prev.map(table =>
                    table.id === currentTable.id ? { ...table, crypt: true } : table
                )
            );

        } catch (error) {
            console.error('Ошибка шифрования:', error);
            if (error.response) {
                showError(error.response.data.message || 'Ошибка при шифровании таблицы');
            } else {
                showError('Не удалось зашифровать таблицу. Проверьте соединение.');
            }
            throw error;
        }
    };

    const handleDecrypt = async (password) => {
        if (!currentTable) return;

        try {
            // Сначала проверяем пароль
            const isValidPassword = await verifyPassword(currentTable.id, password);
            if (!isValidPassword) {
                throw new Error('Неверный пароль');
            }

            // Получаем данные таблицы для расшифровки
            const response = await axios.post(route('tableData'), {
                tableId: currentTable.id
            });

            const tableData = response.data;

            // Получаем ключ данных из localStorage
            const dataKeyBase64 = localStorage.getItem(`table_${currentTable.id}_dataKey`);
            if (!dataKeyBase64) {
                throw new Error('Ключ данных не найден. Сначала разблокируйте таблицу.');
            }

            const dataKey = await EncryptionService.importKey(dataKeyBase64);

            // Расшифровываем данные транзакций
            const decryptedTransactions = {};
            for (const transaction of tableData.transactions) {
                const decryptedTitle = await EncryptionService.decryptData(transaction.title, dataKey);
                const decryptedSum = await EncryptionService.decryptData(transaction.sum, dataKey);

                decryptedTransactions[transaction.id] = {
                    sum: decryptedSum,
                    title: decryptedTitle
                };
            }

            // Отправляем расшифрованные данные на сервер
            const requestData = {
                tableId: parseInt(currentTable.id),
                transactions: decryptedTransactions
            };

            await axios.post(route('decryptTable'), requestData);

            // Очищаем локальные ключи
            localStorage.removeItem(`table_${currentTable.id}_dataKey`);
            localStorage.removeItem(`table_${currentTable.id}_encryptedKeys`);
            localStorage.removeItem(`table_${currentTable.id}_serverKey`);
            localStorage.removeItem(`table_${currentTable.id}_serverSalt`);

            showSuccess(`Таблица "${currentTable.name}" успешно расшифрована!`);
            setPasswordPromptOpen(false);

            // Обновляем состояние таблицы
            setLocalTables(prev =>
                prev.map(table =>
                    table.id === currentTable.id ? { ...table, crypt: false } : table
                )
            );

        } catch (error) {
            console.error('Ошибка расшифровки:', error);
            if (error.message === 'Неверный пароль') {
                throw error;
            } else if (error.response) {
                showError(error.response.data.message || 'Ошибка при расшифровке таблицы');
            } else {
                showError('Не удалось расшифровать таблицу. Проверьте соединение.');
            }
            throw error;
        }
    };

    // Функция для проверки пароля
    const verifyPassword = async (tableId, password) => {
        try {
            // Пробуем разные источники ключей
            const storedEncryptedKeys = localStorage.getItem(`table_${tableId}_encryptedKeys`);
            if (storedEncryptedKeys) {
                const encryptedKeys = JSON.parse(storedEncryptedKeys);
                const currentUserKey = encryptedKeys[auth.user.id];

                if (currentUserKey) {
                    // Пробуем расшифровать ключ данных
                    const salt = EncryptionService.hexToUint8Array(currentUserKey.salt);
                    const kek = await EncryptionService.deriveKeyFromPassword(password, salt);
                    await EncryptionService.decryptDataKey(currentUserKey.encryptedDataKey, kek);
                    return true;
                }
            }

            // Пробуем серверные ключи
            const serverKey = localStorage.getItem(`table_${tableId}_serverKey`);
            const serverSalt = localStorage.getItem(`table_${tableId}_serverSalt`);

            if (serverKey && serverSalt) {
                const salt = EncryptionService.hexToUint8Array(serverSalt);
                const kek = await EncryptionService.deriveKeyFromPassword(password, salt);
                await EncryptionService.decryptDataKey(serverKey, kek);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Ошибка проверки пароля:', error);
            return false;
        }
    };

    const openShareModal = (table) => {
        setCurrentTable(table);
        setShareModalOpen(true);
    };

    const openDeleteModal = (table) => {
        setCurrentTable(table);
        setDeleteModalOpen(true);
    };

    const openEncryptionModal = (table, action) => {
        setCurrentTable({ ...table, encryptionAction: action });
        if (action === 'decrypt') {
            // Для расшифровки сначала показываем запрос пароля
            setPasswordPromptOpen(true);
        } else {
            // Для шифрования показываем обычную модалку
            setEncryptionModalOpen(true);
        }
    };

    const handleEncryptionSubmit = async (passwords, users) => {
        if (currentTable?.encryptionAction === 'encrypt') {
            await handleEncrypt(passwords, users);
        }
    };

    const handlePasswordSubmit = async (password) => {
        try {
            await handleDecrypt(password);
        } catch (error) {
            if (error.message === 'Неверный пароль') {
                throw error;
            }
            // Другие ошибки обрабатываются в handleDecrypt
        }
    };

    const handleTableUsersLoaded = (users) => {
        setTableUsers(users);
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
                                onEncrypt={() => openEncryptionModal(table, 'encrypt')}
                                onDecrypt={() => openEncryptionModal(table, 'decrypt')}
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
                    table={currentTable}
                    theme={theme}
                    auth={auth}
                    onSubmit={handleEncryptionSubmit}
                    onUsersLoaded={handleTableUsersLoaded}
                />

                <PasswordPromptModal
                    isOpen={passwordPromptOpen}
                    onClose={() => setPasswordPromptOpen(false)}
                    table={currentTable}
                    theme={theme}
                    onSubmit={handlePasswordSubmit}
                />

                <ConfirmModal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
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
