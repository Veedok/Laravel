import React from 'react';
import useEncryptionModal from '@/hooks/useEncryptionModal.js';
import UserPasswordCard from '@/Components/UI/UserPasswordCard.jsx';
import { getThemeClasses } from '@/Utils/userHelpers.js';
const EncryptionModal = ({ isOpen, onClose, table, theme, onSubmit, auth }) => {
    const {
        passwords,
        confirmPassword,
        tableUsers,
        loading,
        error,
        setConfirmPassword,
        setError,
        handlePasswordChange,
        handleSubmit
    } = useEncryptionModal(table, auth);
    const themeClasses = getThemeClasses(theme);
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        await handleSubmit(onSubmit);
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
                        <UserPasswordCard
                            key={user.id}
                            user={user}
                            isCurrentUser={isCurrentUser}
                            password={passwords[user.id] || ''}
                            confirmPassword={isCurrentUser ? confirmPassword : ''}
                            onPasswordChange={handlePasswordChange}
                            onConfirmPasswordChange={setConfirmPassword}
                            theme={theme}
                        />
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
                    <form onSubmit={handleFormSubmit}>
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
