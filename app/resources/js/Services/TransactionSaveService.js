import axios from 'axios';
import EncryptionService from '@/Pages/Crypto/encryptionService';
import { formatDateForDisplay } from '@/Utils/dateFormatters';

class TransactionSaveService {
    static async saveTransaction({
                                     formData,
                                     editingTransaction,
                                     activeTableId,
                                     isEncrypted,
                                     isLocked,
                                     userTags
                                 }) {
        try {
            const serverDate = formatDateForDisplay(formData.date);
            let payload = {
                id: editingTransaction?.id,
                name: formData.title,
                type: formData.changeBalance,
                sum: parseFloat(formData.sum),
                date: serverDate,
                tableId: activeTableId,
                tags: Array.isArray(formData.tags) ? formData.tags.join(' ') : formData.tags,
            };
            if (isEncrypted && !isLocked) {
                const dataKeyBase64 = localStorage.getItem(`table_${activeTableId}_dataKey`);
                if (dataKeyBase64) {
                    const dataKey = await EncryptionService.importKey(dataKeyBase64);
                    const encryptedName = await EncryptionService.encryptData(formData.title, dataKey);
                    const encryptedSum = await EncryptionService.encryptData(formData.sum.toString(), dataKey);
                    payload = {
                        ...payload,
                        name: encryptedName,
                        sum: encryptedSum
                    };
                } else {
                    throw new Error('Ключ шифрования не найден');
                }
            }
            const url = editingTransaction ? route('updateData') : route('saveData');
            const method = editingTransaction ? 'put' : 'post';
            const response = await axios[method](url, payload);
            const newTransaction = {
                id: response.data.id,
                title: formData.title,
                changeBalance: formData.changeBalance,
                sum: parseFloat(formData.sum),
                date: serverDate,
                tags: formData.tags
            };
            return {
                success: true,
                transaction: newTransaction
            };
        } catch (error) {
            console.error('Ошибка при сохранении транзакции:', error);
            let errorMessage = 'Не удалось выполнить запрос. Проверьте соединение.';
            if (error.response) {
                const errorData = error.response.data;
                errorMessage = errorData.message ||
                    Object.values(errorData.errors || {}).flat().join('\n') ||
                    'Ошибка сервера';
            }
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}

export default TransactionSaveService;
