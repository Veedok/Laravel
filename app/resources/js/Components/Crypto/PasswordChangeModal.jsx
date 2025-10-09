import React, { useState } from 'react';
import PasswordInput from '@/Components/UI/PasswordInput.jsx';
import { getThemeClasses } from '@/Utils/userHelpers.js';

const PasswordChangeModal = ({ isOpen, onClose, table, theme, onSubmit, loading }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const themeClasses = getThemeClasses(theme);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await onSubmit(oldPassword, newPassword, confirmPassword);
            // Очищаем поля после успешной отправки
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleClose = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${themeClasses.modalOverlay}`}>
            <div className={`rounded-lg p-6 max-w-md w-full border ${themeClasses.modalContent}`}>
                <h2 className="text-lg font-bold mb-4">
                    🔑 Изменение пароля таблицы
                </h2>

                {error && (
                    <div className={`mb-4 p-3 rounded ${
                        theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-800'
                    }`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Старый пароль:
                            </label>
                            <PasswordInput
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Введите текущий пароль"
                                theme={theme}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Новый пароль:
                            </label>
                            <PasswordInput
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Введите новый пароль"
                                theme={theme}
                                minLength={6}
                            />
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Минимум 6 символов
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Подтверждение нового пароля:
                            </label>
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Повторите новый пароль"
                                theme={theme}
                                minLength={6}
                            />
                            {newPassword && confirmPassword && (
                                <div className={`text-xs mt-1 ${
                                    newPassword === confirmPassword
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {newPassword === confirmPassword
                                        ? '✓ Пароли совпадают'
                                        : '✗ Пароли не совпадают'
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`px-4 py-2 rounded ${themeClasses.buttonSecondary}`}
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded ${themeClasses.buttonPrimary}`}
                            disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                        >
                            {loading ? 'Изменение...' : 'Изменить пароль'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChangeModal;
