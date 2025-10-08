import { useState, useEffect } from 'react';
import EncryptionService from '@/Pages/Crypto/encryptionService';
import { isEncryptedString } from '@/Utils/encryptionHelpers';
export default function useEncryptionOperations(activeTableId, isEncrypted, isLocked, transactions) {
    const [decryptedData, setDecryptedData] = useState([]);
    const decryptItem = async (item, dataKey) => {
        try {
            let title = item.title;
            let sum = item.sum;
            if (isEncryptedString(item.title)) {
                title = await EncryptionService.decryptData(item.title, dataKey);
            }
            if (isEncryptedString(item.sum)) {
                const decryptedSum = await EncryptionService.decryptData(item.sum, dataKey);
                sum = parseFloat(decryptedSum);
                if (isNaN(sum)) {
                    console.warn('Расшифрованная сумма не является числом:', decryptedSum);
                    sum = 0;
                }
            } else if (typeof item.sum === 'string') {
                sum = parseFloat(item.sum);
                if (isNaN(sum)) sum = 0;
            }
            return {
                ...item,
                title,
                sum
            };
        } catch (error) {
            console.error('Ошибка расшифровки элемента:', error);
            return {
                ...item,
                title: '••••••••',
                sum: 0
            };
        }
    };
    const decryptData = async (encryptedData) => {
        if (!isEncrypted) {
            return encryptedData;
        }
        try {
            const dataKeyBase64 = localStorage.getItem(`table_${activeTableId}_dataKey`);
            if (!dataKeyBase64) {
                console.warn('Ключ данных не найден, показываем заглушки');
                return encryptedData.map(item => ({
                    ...item,
                    title: '••••••••',
                    sum: 0
                }));
            }
            const dataKey = await EncryptionService.importKey(dataKeyBase64);
            const decryptedItems = [];
            for (const item of encryptedData) {
                const decryptedItem = await decryptItem(item, dataKey);
                decryptedItems.push(decryptedItem);
            }
            return decryptedItems;
        } catch (error) {
            console.error('Ошибка при расшифровке данных:', error);
            return encryptedData.map(item => ({
                ...item,
                title: '••••••••',
                sum: 0
            }));
        }
    };
    useEffect(() => {
        const loadDecryptedData = async () => {
            if (isEncrypted && !isLocked) {
                const decrypted = await decryptData(transactions);
                setDecryptedData(decrypted);
            } else if (isEncrypted && isLocked) {
                setDecryptedData([]);
            } else {
                setDecryptedData(transactions);
            }
        };
        loadDecryptedData();
    }, [transactions, isEncrypted, isLocked, activeTableId]);
    return {
        decryptedData,
        decryptData,
        decryptItem
    };
}
