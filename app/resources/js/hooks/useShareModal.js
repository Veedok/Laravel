import { useState, useEffect } from 'react';
import axios from 'axios';
import EncryptionService from '@/Pages/Crypto/encryptionService';
export default function useShareModal(table, showSuccess, showError) {
    const [email, setEmail] = useState('');
    const [emailSuggestions, setEmailSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isSharing, setIsSharing] = useState(false);
    const [isTableEncrypted, setIsTableEncrypted] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [userPassword, setUserPassword] = useState('');
    const [unlockPassword, setUnlockPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    useEffect(() => {
        if (table?.crypt) {
            setIsTableEncrypted(true);
        } else {
            setIsTableEncrypted(false);
        }
    }, [table]);
    const fetchEmailSuggestions = async (query) => {
        try {
            const response = await axios.get(route('userSearch'), {
                params: { query, limit: 5, tableId: table.id }
            });
            setEmailSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            setEmailSuggestions([]);
        }
    };
    const handleEmailChange = (value) => {
        setEmail(value);
        if (value.length >= 3) {
            fetchEmailSuggestions(value);
        } else {
            setEmailSuggestions([]);
            setShowSuggestions(false);
        }
    };
    const handleUnlockSubmit = async () => {
        if (!unlockPassword || unlockPassword.length < 6) {
            setPasswordError('Пароль должен быть не менее 6 символов');
            return;
        }
        setPasswordError('');
        setIsSharing(true);
        try {
            const response = await axios.post(route('tableData'), {
                tableId: table.id
            });
            const serverData = response.data;
            if (!serverData.tableKey || !serverData.salt) {
                throw new Error('Ключи шифрования не найдены на сервере');
            }
            const salt = EncryptionService.hexToUint8Array(serverData.salt);
            const kek = await EncryptionService.deriveKeyFromPassword(unlockPassword, salt);
            const dataKey = await EncryptionService.decryptDataKey(serverData.tableKey, kek);
            const exportedDataKey = await EncryptionService.exportKey(dataKey);
            localStorage.setItem(`table_${table.id}_dataKey`, exportedDataKey);
            await submitShareData(selectedUser, exportedDataKey);
            setShowUnlockModal(false);
            setUnlockPassword('');

        } catch (error) {
            if (error.message.includes('decryption')) {
                setPasswordError('Неверный пароль для разблокировки таблицы');
            } else {
                setPasswordError('Ошибка при разблокировке таблицы');
            }
        } finally {
            setIsSharing(false);
        }
    };
    const encryptKeyForNewUser = async (dataKeyBase64, password) => {
        try {
            const dataKey = await EncryptionService.importKey(dataKeyBase64);
            const salt = EncryptionService.generateSalt();
            const kek = await EncryptionService.deriveKeyFromPassword(password, salt);
            const encryptedDataKey = await EncryptionService.encryptDataKey(dataKey, kek);
            return {
                encryptedDataKey,
                salt: EncryptionService.uint8ArrayToHex(salt)
            };
        } catch (error) {
            throw new Error('Ошибка при шифровании ключа для нового пользователя');
        }
    };

    const submitShareData = async (user, dataKeyBase64 = null) => {
        setIsSharing(true);
        try {
            const shareData = {
                userId: user.id,
                tableId: table.id,
                permissions: selectedPermissions
            };
            if (isTableEncrypted && dataKeyBase64) {
                const encryptedData = await encryptKeyForNewUser(dataKeyBase64, userPassword);
                shareData.key = encryptedData.encryptedDataKey;
                shareData.salt = encryptedData.salt;
            }
            await onShare(shareData);
            resetForm();
            return true;
        } catch (error) {
            throw error;
        } finally {
            setIsSharing(false);
        }
    };
    const handleSubmit = async () => {
        if (!email || !table?.id) {
            return false;
        }
        const user = emailSuggestions.find(user => user.email === email);
        if (!user) {
            return false;
        }
        setSelectedUser(user);
        if (isTableEncrypted) {
            if (!userPassword || userPassword.length < 6) {
                setPasswordError('Пароль должен быть не менее 6 символов');
                return;
            }
            const dataKeyBase64 = localStorage.getItem(`table_${table.id}_dataKey`);

            if (dataKeyBase64) {
                await submitShareData(user, dataKeyBase64);
            } else {
                setShowUnlockModal(true);
            }
            return;
        }
        await submitShareData(user);
    };
    const resetForm = () => {
        setEmail('');
        setEmailSuggestions([]);
        setSelectedPermissions([]);
        setUserPassword('');
        setUnlockPassword('');
        setPasswordError('');
        setSelectedUser(null);
        setShowUnlockModal(false);
    };
    const handleUnlockModalClose = () => {
        setShowUnlockModal(false);
        setUnlockPassword('');
        setPasswordError('');
    };
    return {
        email,
        emailSuggestions,
        showSuggestions,
        selectedPermissions,
        isSharing,
        isTableEncrypted,
        showUnlockModal,
        userPassword,
        unlockPassword,
        passwordError,
        selectedUser,
        setShowSuggestions,
        setUserPassword,
        setUnlockPassword,
        setPasswordError,
        setSelectedPermissions,
        handleEmailChange,
        handleSubmit,
        handleUnlockSubmit,
        handleUnlockModalClose,
        resetForm
    };
}
