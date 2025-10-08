import axios from 'axios';
import EncryptionService from '@/Pages/Crypto/encryptionService';

class TableEncryptionService {
    static async encryptTable(tableId, passwords, users, tableName) {
        try {
            const response = await axios.post(route('tableData'), { tableId });
            const tableData = response.data;
            const dataKey = await EncryptionService.generateDataKey();
            const encryptedKeys = {};
            for (const user of users) {
                const salt = EncryptionService.generateSalt();
                const kek = await EncryptionService.deriveKeyFromPassword(passwords[user.id], salt);
                const encryptedDataKey = await EncryptionService.encryptDataKey(dataKey, kek);
                encryptedKeys[user.id] = {
                    encryptedDataKey,
                    salt: EncryptionService.uint8ArrayToHex(salt)
                };
            }
            const encryptedTransactions = {};
            for (const transaction of tableData.transactions) {
                const encryptedTitle = await EncryptionService.encryptData(transaction.title, dataKey);
                const encryptedSum = await EncryptionService.encryptData(transaction.sum.toString(), dataKey);
                encryptedTransactions[transaction.id] = {
                    sum: encryptedSum,
                    title: encryptedTitle
                };
            }
            const requestData = {
                tableId: parseInt(tableId),
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
            localStorage.setItem(`table_${tableId}_encryptedKeys`, JSON.stringify(encryptedKeys));
            return { success: true };
        } catch (error) {
            console.error('Ошибка шифрования:', error);
            throw error;
        }
    }
    static async decryptTable(tableId, password, userId, tableName) {
        try {
            const isValidPassword = await this.verifyPassword(tableId, password, userId);
            if (!isValidPassword) {
                throw new Error('Неверный пароль');
            }
            const response = await axios.post(route('tableData'), { tableId });
            const tableData = response.data;
            const dataKeyBase64 = localStorage.getItem(`table_${tableId}_dataKey`);
            if (!dataKeyBase64) {
                throw new Error('Ключ данных не найден. Сначала разблокируйте таблицу.');
            }
            const dataKey = await EncryptionService.importKey(dataKeyBase64);
            const decryptedTransactions = {};
            for (const transaction of tableData.transactions) {
                const decryptedTitle = await EncryptionService.decryptData(transaction.title, dataKey);
                const decryptedSum = await EncryptionService.decryptData(transaction.sum, dataKey);
                decryptedTransactions[transaction.id] = {
                    sum: decryptedSum,
                    title: decryptedTitle
                };
            }
            const requestData = {
                tableId: parseInt(tableId),
                transactions: decryptedTransactions
            };

            await axios.post(route('decryptTable'), requestData);
            this.clearTableKeys(tableId);
            return { success: true };
        } catch (error) {
            console.error('Ошибка расшифровки:', error);
            throw error;
        }
    }
    static async verifyPassword(tableId, password, userId) {
        try {
            const storedEncryptedKeys = localStorage.getItem(`table_${tableId}_encryptedKeys`);
            if (storedEncryptedKeys) {
                const encryptedKeys = JSON.parse(storedEncryptedKeys);
                const currentUserKey = encryptedKeys[userId];
                if (currentUserKey) {
                    const salt = EncryptionService.hexToUint8Array(currentUserKey.salt);
                    const kek = await EncryptionService.deriveKeyFromPassword(password, salt);
                    await EncryptionService.decryptDataKey(currentUserKey.encryptedDataKey, kek);
                    return true;
                }
            }
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
    }
    static clearTableKeys(tableId) {
        localStorage.removeItem(`table_${tableId}_dataKey`);
        localStorage.removeItem(`table_${tableId}_encryptedKeys`);
        localStorage.removeItem(`table_${tableId}_serverKey`);
        localStorage.removeItem(`table_${tableId}_serverSalt`);
    }
}
export default TableEncryptionService;
