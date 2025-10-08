import { useState } from 'react';
import TableEncryptionService from '@/Services/TableEncryptionService.js';

export default function useEncryptionManager(auth, showSuccess, showError) {
    const [encryptionModalOpen, setEncryptionModalOpen] = useState(false);
    const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const handleEncrypt = async (passwords, users) => {
        if (!currentTable) return;
        try {
            await TableEncryptionService.encryptTable(
                currentTable.id,
                passwords,
                users,
                currentTable.name
            );
            showSuccess(`Таблица "${currentTable.name}" успешно зашифрована!`);
            setEncryptionModalOpen(false);
            return { success: true, crypt: true };
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
            await TableEncryptionService.decryptTable(
                currentTable.id,
                password,
                auth.user.id,
                currentTable.name
            );
            showSuccess(`Таблица "${currentTable.name}" успешно расшифрована!`);
            setPasswordPromptOpen(false);
            return { success: true, crypt: false };
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
    const openEncryptionModal = (table, action) => {
        setCurrentTable({ ...table, encryptionAction: action });
        if (action === 'decrypt') {
            setPasswordPromptOpen(true);
        } else {
            setEncryptionModalOpen(true);
        }
    };
    const handleEncryptionSubmit = async (passwords, users) => {
        if (currentTable?.encryptionAction === 'encrypt') {
            return await handleEncrypt(passwords, users);
        }
    };
    const handlePasswordSubmit = async (password) => {
        try {
            return await handleDecrypt(password);
        } catch (error) {
            if (error.message === 'Неверный пароль') {
                throw error;
            }
            throw error;
        }
    };
    return {
        encryptionModalOpen,
        passwordPromptOpen,
        currentTable,
        setEncryptionModalOpen,
        setPasswordPromptOpen,
        openEncryptionModal,
        handleEncryptionSubmit,
        handlePasswordSubmit
    };
}
