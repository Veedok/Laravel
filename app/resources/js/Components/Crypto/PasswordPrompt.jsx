import React, { useState } from 'react';

const PasswordPrompt = ({ theme, onUnlock, loading, error, onClearError }) => {
    const [password, setPassword] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.trim()) {
            onUnlock(password);
        }
    };
    const handlePasswordChange = (value) => {
        setPassword(value);
        if (error && onClearError) {
            onClearError();
        }
    };
    const themeClasses = {
        container: theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-200 text-gray-800',
        button: theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        input: theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
        error: theme === 'dark'
            ? 'bg-red-900/30 border-red-700 text-red-300'
            : 'bg-red-50 border-red-200 text-red-800'
    };
    return (
        <div className={`p-6 rounded-lg border ${themeClasses.container}`}>
            <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Данные защищены</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Введите пароль для доступа к данным таблицы
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
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Введите пароль"
                        className={`w-full p-3 border rounded-lg ${themeClasses.input} ${
                            error ? 'border-red-500' : ''
                        }`}
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !password.trim()}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        themeClasses.button
                    } ${loading || !password.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Проверка...
                        </div>
                    ) : (
                        'Разблокировать данные'
                    )}
                </button>
            </form>
        </div>
    );
};
export default PasswordPrompt;
