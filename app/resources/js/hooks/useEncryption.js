import { useState, useEffect } from 'react';
import EncryptionService from '@/Pages/Crypto/encryptionService';

export default function useEncryption(activeTableId, userId, fetchTransactions) {
    const [isTableEncrypted, setIsTableEncrypted] = useState(false);
    const [isTableLocked, setIsTableLocked] = useState(true);
    const [unlockLoading, setUnlockLoading] = useState(false);
    const [unlockError, setUnlockError] = useState(null);
    useEffect(() => {
        const syncEncryptionState = async () => {
            if (!activeTableId) return;
            try {
                const serverData = await fetchTransactions(activeTableId);
                setIsTableEncrypted(serverData.is_encrypted || false);
                if (serverData.is_encrypted) {
                    const hasDecryptedKey = localStorage.getItem(`table_${activeTableId}_dataKey`);
                    if (hasDecryptedKey) {
                        setIsTableLocked(false);
                    } else if (serverData.tableKey && serverData.salt) {
                        localStorage.setItem(`table_${activeTableId}_serverKey`, serverData.tableKey);
                        localStorage.setItem(`table_${activeTableId}_serverSalt`, serverData.salt);
                        setIsTableLocked(true);
                    } else {
                        setIsTableLocked(true);
                    }
                } else {
                    setIsTableLocked(false);
                    localStorage.removeItem(`table_${activeTableId}_dataKey`);
                    localStorage.removeItem(`table_${activeTableId}_serverKey`);
                    localStorage.removeItem(`table_${activeTableId}_serverSalt`);
                    localStorage.removeItem(`table_${activeTableId}_encryptedKeys`);
                }
            } catch (error) {
                console.error('Ошибка синхронизации состояния шифрования:', error);
            }
        };
        syncEncryptionState();
    }, [activeTableId]);
    const handleEncryptionChange = (encrypted, locked) => {
        setIsTableEncrypted(encrypted);
        setIsTableLocked(locked);
    };
    const handleUnlockData = async (password) => {
        if (!activeTableId) return;
        setUnlockLoading(true);
        setUnlockError(null);
        try {
            const storedEncryptedKeys = localStorage.getItem(`table_${activeTableId}_encryptedKeys`);
            if (storedEncryptedKeys) {
                const encryptedKeys = JSON.parse(storedEncryptedKeys);
                const currentUserKey = encryptedKeys[userId];
                if (currentUserKey) {
                    const salt = EncryptionService.hexToUint8Array(currentUserKey.salt);
                    const kek = await EncryptionService.deriveKeyFromPassword(password, salt);
                    const dataKey = await EncryptionService.decryptDataKey(currentUserKey.encryptedDataKey, kek);
                    const exportedDataKey = await EncryptionService.exportKey(dataKey);
                    localStorage.setItem(`table_${activeTableId}_dataKey`, exportedDataKey);
                    setIsTableLocked(false);
                    handleEncryptionChange(true, false);
                    return;
                }
            }
            const serverKey = localStorage.getItem(`table_${activeTableId}_serverKey`);
            const serverSalt = localStorage.getItem(`table_${activeTableId}_serverSalt`);
            if (serverKey && serverSalt) {
                try {
                    const salt = EncryptionService.hexToUint8Array(serverSalt);
                    const kek = await EncryptionService.deriveKeyFromPassword(password, salt);
                    const dataKey = await EncryptionService.decryptDataKey(serverKey, kek);
                    const exportedDataKey = await EncryptionService.exportKey(dataKey);
                    localStorage.setItem(`table_${activeTableId}_dataKey`, exportedDataKey);
                    setIsTableLocked(false);
                    handleEncryptionChange(true, false);
                    return;
                } catch (serverKeyError) {
                    console.error('Ошибка расшифровки серверных ключей:', serverKeyError);
                    throw new Error('Неверный пароль');
                }
            }
            throw new Error('Неверный пароль или ключи шифрования не найдены');
        } catch (error) {
            console.error('Ошибка разблокировки:', error);
            setUnlockError(error.message || 'Неверный пароль или ошибка разблокировки');
        } finally {
            setUnlockLoading(false);
        }
    };
    const handleLockTable = () => {
        if (!activeTableId) return;

        localStorage.removeItem(`table_${activeTableId}_dataKey`);
        setIsTableLocked(true);
        handleEncryptionChange(true, true);
    };
    const handleClearUnlockError = () => {
        setUnlockError(null);
    };
    return {
        isTableEncrypted,
        isTableLocked,
        unlockLoading,
        unlockError,
        handleEncryptionChange,
        handleUnlockData,
        handleLockTable,
        handleClearUnlockError
    };
}
