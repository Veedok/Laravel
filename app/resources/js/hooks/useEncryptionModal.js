import { useState, useEffect } from 'react';
import axios from 'axios';
export default function useEncryptionModal(table, auth) {
    const [passwords, setPasswords] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tableUsers, setTableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        if (table) {
            fetchTableUsers();
        }
    }, [table]);
    const fetchTableUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.post(route('tableUsers'), {
                id: table.id
            });
            const serverUsers = response.data;
            const usersWithCurrent = [...serverUsers];
            const currentUserExists = serverUsers.some(user => user.id === auth.user.id);
            if (!currentUserExists && auth.user.id) {
                usersWithCurrent.push({
                    id: auth.user.id,
                    mail: auth.user.email,
                    name: auth.user.name
                });
            }
            const sortedUsers = usersWithCurrent.sort((a, b) => {
                if (a.id === auth.user.id) return -1;
                if (b.id === auth.user.id) return 1;
                return 0;
            });
            setTableUsers(sortedUsers);
            const initialPasswords = {};
            sortedUsers.forEach(user => {
                initialPasswords[user.id] = '';
            });
            setPasswords(initialPasswords);
        } catch (error) {
            console.error('Ошибка получения пользователей таблицы:', error);
            setError('Ошибка при загрузке пользователей таблицы');
        } finally {
            setLoading(false);
        }
    };
    const handlePasswordChange = (userId, value) => {
        setPasswords(prev => ({
            ...prev,
            [userId]: value
        }));
    };
    const validatePasswords = () => {
        const currentUserPassword = passwords[auth.user.id];
        if (!currentUserPassword || currentUserPassword.length < 6) {
            setError('Ваш пароль должен быть не менее 6 символов');
            return false;
        }
        if (currentUserPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return false;
        }
        for (const user of tableUsers) {
            if (user.id === auth.user.id) continue;
            const password = passwords[user.id];
            if (!password || password.length < 6) {
                setError(`Пароль для ${user.mail} должен быть не менее 6 символов`);
                return false;
            }
        }
        return true;
    };
    const handleSubmit = async (onSubmit) => {
        setError('');
        if (!validatePasswords()) {
            return;
        }
        try {
            setLoading(true);
            await onSubmit(passwords, tableUsers);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };
    return {
        passwords,
        confirmPassword,
        tableUsers,
        loading,
        error,
        setConfirmPassword,
        setError,
        handlePasswordChange,
        handleSubmit
    };
}
