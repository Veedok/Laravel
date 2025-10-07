// Components/TableControl/PasswordPromptModal.jsx
import React, { useState } from 'react';

const PasswordPromptModal = ({ isOpen, onClose, table, theme, onSubmit }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        error: theme === 'dark'
            ? 'bg-red-900/30 border-red-700 text-red-300'
            : 'bg-red-50 border-red-200 text-red-800'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Введите пароль');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSubmit(password);
            setPassword('');
        } catch (error) {
            if (error.message === 'Неверный пароль') {
                setError('Неверный пароль. Пожалуйста, попробуйте снова.');
            } else {
                setError('Произошла ошибка при проверке пароля.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${themeClasses.modalOverlay}`}>
            <div className={`rounded-lg p-6 max-w-md w-full border ${themeClasses.modalContent}`}>
                <h2 className="text-lg font-bold mb-4">
                    🔓 Подтверждение расшифровки
                </h2>

                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Для расшифровки таблицы <strong>"{table?.name}"</strong> необходимо подтвердить ваш пароль.
                    </p>
                </div>

                {error && (
                    <div className={`mb-4 p-3 rounded border ${themeClasses.error}`}>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Введите ваш пароль:
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Ваш пароль шифрования"
                            className={`w-full p-3 border rounded-lg ${themeClasses.input} ${
                                error ? 'border-red-500' : ''
                            }`}
                            disabled={loading}
                            autoFocus
                        />
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
                            disabled={loading || !password.trim()}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Проверка...
                                </div>
                            ) : (
                                'Подтвердить'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                        ⚠️ После расшифровки все данные таблицы станут доступны в открытом виде для всех пользователей.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PasswordPromptModal;
