import { useEffect } from 'react';
import Modal from "@/Components/TableControl/Modal.jsx";
import { Dialog } from '@headlessui/react';
import useShareModal from '@/hooks/useShareModal.js';
import ShareService from '@/Services/ShareService.js';

export default function ShareModal({
                                       isOpen,
                                       onClose,
                                       table,
                                       theme,
                                       permissions: availablePermissions,
                                       onShare
                                   }) {
    const {
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
    } = useShareModal(table, onShare);
    const handleShareSubmit = async (shareData) => {
        try {
            await ShareService.shareTable(shareData);
            onShare(shareData);
            return true;
        } catch (error) {
            throw error;
        }
    };
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);
    const themeClasses = {
        modalOverlay: theme === 'dark' ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50',
        modalContent: theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900',
        input: theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300',
        suggestionItem: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
    };
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} theme={theme}>
                <div className="relative">
                    <Dialog.Title as="h3" className={`text-lg font-medium leading-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        Предоставить доступ к "{table?.name}"
                        {isTableEncrypted && (
                            <div>
                                <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    🔐 Зашифрована
                                </span>
                            </div>
                        )}
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                        <div className="relative">
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Email пользователя
                            </label>
                            <input
                                type="email"
                                placeholder="Введите email пользователя"
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                onFocus={() => email.length >= 3 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input}`}
                            />
                            {showSuggestions && emailSuggestions.length > 0 && (
                                <div className="absolute z-50 mt-1 w-full">
                                    <ul className={`shadow-lg rounded-md border ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                                        {emailSuggestions.map((user) => (
                                            <li
                                                key={user.id}
                                                className={`px-3 py-2 cursor-pointer transition-colors ${themeClasses.suggestionItem}`}
                                                onClick={() => {
                                                    setEmail(user.email);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <div className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {user.name}
                                                </div>
                                                <div className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {user.email}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {isTableEncrypted && (
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Пароль для пользователя
                                </label>
                                <input
                                    type="password"
                                    placeholder="Введите пароль для нового пользователя"
                                    value={userPassword}
                                    onChange={(e) => {
                                        setUserPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input} ${passwordError ? 'border-red-500' : ''}`}
                                />
                                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Этот пароль будет использоваться пользователем для доступа к данным таблицы
                                </p>
                            </div>
                        )}
                        <div>
                            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Разрешения:
                            </h4>
                            <div className="space-y-2">
                                {Object.entries(availablePermissions).map(([key, label]) => (
                                    <div key={key} className="flex items-center">
                                        <input
                                            id={`permission-${key}`}
                                            type="checkbox"
                                            checked={selectedPermissions.includes(key)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedPermissions([...selectedPermissions, key]);
                                                } else {
                                                    setSelectedPermissions(selectedPermissions.filter(p => p !== key));
                                                }
                                            }}
                                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'}`}
                                        />
                                        <label htmlFor={`permission-${key}`} className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {isTableEncrypted && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    <strong>Таблица зашифрована</strong><br/>
                                    Для предоставления доступа необходимо ввести пароль, который будет использоваться новым пользователем для доступа к данным.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md hover:bg-opacity-80 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSharing || !email || (isTableEncrypted && !userPassword)}
                            className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 ${isSharing ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-green-700' : 'bg-green-600'}`}
                        >
                            {isSharing ? 'Отправка...' : 'Поделиться'}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={showUnlockModal} onClose={handleUnlockModalClose} theme={theme}>
                <div className="relative">
                    <Dialog.Title as="h3" className={`text-lg font-medium leading-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        🔓 Разблокировка таблицы
                    </Dialog.Title>
                    <div className="mt-4">
                        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Для добавления пользователя <strong>{selectedUser?.name}</strong> в зашифрованную таблицу необходимо сначала разблокировать её.
                        </p>
                        <input
                            type="password"
                            placeholder="Введите ваш пароль для разблокировки таблицы..."
                            value={unlockPassword}
                            onChange={(e) => {
                                setUnlockPassword(e.target.value);
                                setPasswordError('');
                            }}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${themeClasses.input} ${passwordError ? 'border-red-500' : ''}`}
                        />
                        {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleUnlockModalClose}
                            className={`px-4 py-2 rounded-md hover:bg-opacity-80 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            onClick={handleUnlockSubmit}
                            disabled={isSharing}
                            className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 ${isSharing ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'}`}
                        >
                            {isSharing ? 'Разблокировка...' : 'Разблокировать'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
