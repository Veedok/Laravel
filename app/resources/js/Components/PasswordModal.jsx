import React, { useState } from 'react';

const PasswordModal = ({ isOpen, onClose, onConfirm, theme, tableName }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Пароль не может быть пустым');
            return;
        }
        onConfirm(password);
        setPassword('');
        setError('');
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                    Введите пароль для таблицы "{tableName}"
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Введите пароль"
                            className={`w-full p-3 border rounded-lg ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            } ${error ? 'border-red-500' : ''}`}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className={`px-4 py-2 rounded-lg ${
                                theme === 'dark'
                                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Подтвердить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
