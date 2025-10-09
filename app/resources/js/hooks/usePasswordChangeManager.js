import { useState } from 'react';
import TableEncryptionService from '@/Services/TableEncryptionService.js';
import EncryptionService from '@/Pages/Crypto/encryptionService';

export default function usePasswordChangeManager(auth, showSuccess, showError) {
    const [passwordChangeModalOpen, setPasswordChangeModalOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [loading, setLoading] = useState(false);

    const openPasswordChangeModal = (table) => {
        setCurrentTable(table);
        setPasswordChangeModalOpen(true);
    };

    const handlePasswordChange = async (oldPassword, newPassword, confirmPassword) => {
        if (!currentTable) return;

        try {
            setLoading(true);

            // Валидация
            if (!oldPassword || !newPassword || !confirmPassword) {
                throw new Error('Все поля должны быть заполнены');
            }

            if (newPassword.length < 6) {
                throw new Error('Новый пароль должен быть не менее 6 символов');
            }

            if (newPassword !== confirmPassword) {
                throw new Error('Новые пароли не совпадают');
            }

            // Проверяем старый пароль
            const isValidOldPassword = await TableEncryptionService.verifyPassword(
                currentTable.id,
                oldPassword,
                auth.user.id
            );

            if (!isValidOldPassword) {
                throw new Error('Неверный старый пароль');
            }

            // Получаем текущий зашифрованный ключ и соль
            const serverKey = localStorage.getItem(`table_${currentTable.id}_serverKey`);
            const serverSalt = localStorage.getItem(`table_${currentTable.id}_serverSalt`);

            if (!serverKey || !serverSalt) {
                throw new Error('Ключи шифрования не найдены');
            }

            // Расшифровываем data key старым паролем
            const oldSalt = EncryptionService.hexToUint8Array(serverSalt);
            const oldKek = await EncryptionService.deriveKeyFromPassword(oldPassword, oldSalt);
            const dataKey = await EncryptionService.decryptDataKey(serverKey, oldKek);

            // Генерируем новую соль и шифруем data key новым паролем
            const newSalt = EncryptionService.generateSalt();
            const newKek = await EncryptionService.deriveKeyFromPassword(newPassword, newSalt);
            const newEncryptedDataKey = await EncryptionService.encryptDataKey(dataKey, newKek);
            const newSaltHex = EncryptionService.uint8ArrayToHex(newSalt);

            // Отправляем на сервер
            await axios.post(route('changeTablePass'), {
                tableId: currentTable.id,
                newKey: newEncryptedDataKey,
                salt: newSaltHex
            });

            // ВАЖНО: Очищаем ВСЕ ключи таблицы перед сохранением новых
            TableEncryptionService.clearTableKeys(currentTable.id);

            // Сохраняем новые ключи
            localStorage.setItem(`table_${currentTable.id}_serverKey`, newEncryptedDataKey);
            localStorage.setItem(`table_${currentTable.id}_serverSalt`, newSaltHex);

            showSuccess('Пароль успешно изменен!');
            setPasswordChangeModalOpen(false);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            return { success: true };

        } catch (error) {
            console.error('Ошибка смены пароля:', error);

            if (error.message === 'Неверный старый пароль') {
                throw new Error('Неверный старый пароль');
            } else if (error.message.includes('decryption')) {
                throw new Error('Неверный старый пароль');
            } else {
                throw new Error(error.message || 'Ошибка при смене пароля');
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        passwordChangeModalOpen,
        currentTable,
        loading,
        setPasswordChangeModalOpen,
        openPasswordChangeModal,
        handlePasswordChange
    };
}
