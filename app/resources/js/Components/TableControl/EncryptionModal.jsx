// Components/TableControl/EncryptionModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EncryptionService from '@/Pages/Crypto/encryptionService';

const EncryptionModal = ({ isOpen, onClose, table, theme, onSubmit, auth, onUsersLoaded }) => {
    const [passwords, setPasswords] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tableUsers, setTableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && table) {
            fetchTableUsers();
        }
    }, [isOpen, table]);

    const fetchTableUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.post(route('tableUsers'), {
                id: table.id
            });

            const serverUsers = response.data;

            // Добавляем текущего пользователя в список если его там нет
            const usersWithCurrent = [...serverUsers];
            const currentUserExists = serverUsers.some(user => user.id === auth.user.id);

            if (!currentUserExists && auth.user.id) {
                usersWithCurrent.push({
                    id: auth.user.id,
                    mail: auth.user.email,
                    name: auth.user.name
                });
            }

            // Сортируем: текущий пользователь первый, остальные после
            const sortedUsers = usersWithCurrent.sort((a, b) => {
                if (a.id === auth.user.id) return -1;
                if (b.id === auth.user.id) return 1;
                return 0;
            });

            setTableUsers(sortedUsers);

            // Передаем пользователей в родительский компонент
            if (onUsersLoaded) {
                onUsersLoaded(sortedUsers);
            }

            // Инициализируем пароли для всех пользователей
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

    const themeClasses = {
        modalOverlay: theme === 'dark'
            ? 'bg-black bg-opacity-70'
            : 'bg-black bg-opacity-50',
        modalContent: theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-200 text-gray-900',
        buttonPrimary: theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        buttonSecondary: theme === 'dark'
            ? 'bg-gray-600 hover:bg-gray-700 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
        input: theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
        currentUserCard: theme === 'dark'
            ? 'bg-blue-900/30 border-blue-700'
            : 'bg-blue-50 border-blue-200',
        otherUserCard: theme === 'dark'
            ? 'bg-gray-700 border-gray-600'
            : 'bg-gray-50 border-gray-200'
    };

    const handlePasswordChange = (userId, value) => {
        setPasswords(prev => ({
            ...prev,
            [userId]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Проверяем пароли для шифрования
        const currentUserPassword = passwords[auth.user.id];
        if (!currentUserPassword || currentUserPassword.length < 6) {
            setError('Ваш пароль должен быть не менее 6 символов');
            return;
        }
        if (currentUserPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        for (const user of tableUsers) {
            if (user.id === auth.user.id) continue;
            const password = passwords[user.id];
            if (!password || password.length < 6) {
                setError(`Пароль для ${user.mail} должен быть не менее 6 символов`);
                return;
            }
        }

        try {
            setLoading(true);
            // Передаем passwords и tableUsers в функцию onSubmit
            await onSubmit(passwords, tableUsers);
        } catch (error) {
            // Ошибка обрабатывается в родительском компоненте
        } finally {
            setLoading(false);
        }
    };

    const renderUserPasswordInputs = () => {
        if (tableUsers.length === 0) {
            return (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                        В этой таблице нет других пользователей. Пароль будет установлен только для вас.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {tableUsers.map((user) => {
                    const isCurrentUser = user.id === auth.user.id;

                    return (
                        <div
                            key={user.id}
                            className={`p-4 rounded-lg border ${
                                isCurrentUser ? themeClasses.currentUserCard : themeClasses.otherUserCard
                            } ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            <div className="flex items-center mb-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                    isCurrentUser
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-500 text-white'
                                }`}>
                                    {isCurrentUser ? '👤' : '👥'}
                                </div>
                                <div>
                                    <div className="font-medium flex items-center">
                                        {user.name}
                                        {isCurrentUser && (
                                            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                                Вы
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.mail}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Пароль {isCurrentUser && 'для вас'}:
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords[user.id] || ''}
                                        onChange={(e) => handlePasswordChange(user.id, e.target.value)}
                                        placeholder={`Введите пароль${isCurrentUser ? ' для себя' : ` для ${user.name}`}`}
                                        className={`w-full p-2 border rounded text-sm ${themeClasses.input} ${
                                            isCurrentUser ? 'border-blue-500' : ''
                                        }`}
                                        minLength={6}
                                    />
                                </div>

                                {isCurrentUser && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Подтверждение пароля:
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Повторите ваш пароль"
                                            className={`w-full p-2 border rounded text-sm ${themeClasses.input} border-blue-500`}
                                            minLength={6}
                                        />
                                        {passwords[auth.user.id] && confirmPassword && (
                                            <div className={`text-xs mt-1 ${
                                                passwords[auth.user.id] === confirmPassword
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}>
                                                {passwords[auth.user.id] === confirmPassword
                                                    ? '✓ Пароли совпадают'
                                                    : '✗ Пароли не совпадают'
                                                }
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isCurrentUser && (
                                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Важно:</strong> Запомните этот пароль! Он понадобится для доступа к вашим данным.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${themeClasses.modalOverlay}`}>
            <div className={`rounded-lg p-6 max-w-lg w-full border ${themeClasses.modalContent}`}>
                <h2 className="text-lg font-bold mb-4">
                    🔐 Шифрование таблицы
                </h2>

                {error && (
                    <div className={`mb-4 p-3 rounded ${
                        theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-800'
                    }`}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Загружаем пользователей...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-blue-700 dark:text-blue-300 text-sm">
                                <strong>Установите пароли для всех пользователей таблицы.</strong><br/>
                                Каждый пользователь сможет расшифровать данные только своим паролем.
                            </p>
                        </div>

                        {renderUserPasswordInputs()}

                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 rounded ${themeClasses.buttonSecondary}`}
                                disabled={loading}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded ${themeClasses.buttonPrimary}`}
                                disabled={loading}
                            >
                                {loading ? 'Обработка...' : 'Зашифровать'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EncryptionModal;
