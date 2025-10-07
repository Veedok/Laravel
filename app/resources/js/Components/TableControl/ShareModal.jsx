// ShareModal.jsx
import {useState, useEffect} from 'react';
import Modal from "@/Components/TableControl/Modal.jsx";
import {Dialog} from '@headlessui/react';
import EncryptionService from '@/Pages/Crypto/encryptionService';

export default function ShareModal({
                                       isOpen,
                                       onClose,
                                       table,
                                       theme,
                                       permissions: availablePermissions,
                                       onShare
                                   }) {
    const [email, setEmail] = useState('');
    const [emailSuggestions, setEmailSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isSharing, setIsSharing] = useState(false);

    // Состояния для зашифрованных таблиц
    const [isTableEncrypted, setIsTableEncrypted] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [userPassword, setUserPassword] = useState('');
    const [unlockPassword, setUnlockPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchEmailSuggestions = async (query) => {
        try {
            const response = await axios.get(route('userSearch'), {
                params: {query, limit: 5, tableId: table.id}
            });
            setEmailSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            setEmailSuggestions([]);
        }
    };

    // Проверяем, зашифрована ли таблица
    useEffect(() => {
        if (table?.crypt) {
            setIsTableEncrypted(true);
        } else {
            setIsTableEncrypted(false);
        }
    }, [table]);

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        if (value.length >= 3) {
            fetchEmailSuggestions(value);
        } else {
            setEmailSuggestions([]);
            setShowSuggestions(false);
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

        // Если таблица зашифрована, проверяем пароль
        if (isTableEncrypted) {
            if (!userPassword || userPassword.length < 6) {
                setPasswordError('Пароль должен быть не менее 6 символов');
                return;
            }

            // Проверяем, есть ли разблокированный ключ
            const dataKeyBase64 = localStorage.getItem(`table_${table.id}_dataKey`);

            if (dataKeyBase64) {
                // Ключ уже разблокирован - сразу отправляем
                await submitShareData(user, dataKeyBase64);
            } else {
                // Ключ не разблокирован - показываем модалку разблокировки
                setShowUnlockModal(true);
            }
            return;
        }

        // Для незашифрованной таблицы - обычная логика
        await submitShareData(user);
    };

    // Разблокировка таблицы
    const handleUnlockSubmit = async () => {
        if (!unlockPassword || unlockPassword.length < 6) {
            setPasswordError('Пароль должен быть не менее 6 символов');
            return;
        }

        setPasswordError('');
        setIsSharing(true);

        try {
            // Получаем ключи с сервера
            const response = await axios.post(route('tableData'), {
                tableId: table.id
            });

            const serverData = response.data;

            if (!serverData.tableKey || !serverData.salt) {
                throw new Error('Ключи шифрования не найдены на сервере');
            }

            // Разблокируем ключ с помощью пароля
            const salt = EncryptionService.hexToUint8Array(serverData.salt);
            const kek = await EncryptionService.deriveKeyFromPassword(unlockPassword, salt);
            const dataKey = await EncryptionService.decryptDataKey(serverData.tableKey, kek);

            // Сохраняем разблокированный ключ
            const exportedDataKey = await EncryptionService.exportKey(dataKey);
            localStorage.setItem(`table_${table.id}_dataKey`, exportedDataKey);

            // Теперь отправляем данные
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

    // Основная функция отправки данных
    const submitShareData = async (user, dataKeyBase64 = null) => {
        setIsSharing(true);

        try {
            const shareData = {
                userId: user.id,
                tableId: table.id,
                permissions: selectedPermissions
            };

            // Если таблица зашифрована, добавляем зашифрованный ключ
            if (isTableEncrypted && dataKeyBase64) {
                const encryptedData = await encryptKeyForNewUser(dataKeyBase64, userPassword);
                shareData.key = encryptedData.encryptedDataKey;
                shareData.salt = encryptedData.salt;
            }

            await onShare(shareData);

            // Сброс состояний после успешной отправки
            resetForm();
            return true;
        } catch (error) {
            throw error;
        } finally {
            setIsSharing(false);
        }
    };

    // Шифрование ключа для нового пользователя
    const encryptKeyForNewUser = async (dataKeyBase64, password) => {
        try {
            const dataKey = await EncryptionService.importKey(dataKeyBase64);

            // Генерируем соль для нового пользователя
            const salt = EncryptionService.generateSalt();
            const kek = await EncryptionService.deriveKeyFromPassword(password, salt);

            // Шифруем ключ данных для нового пользователя
            const encryptedDataKey = await EncryptionService.encryptDataKey(dataKey, kek);

            return {
                encryptedDataKey,
                salt: EncryptionService.uint8ArrayToHex(salt)
            };
        } catch (error) {
            throw new Error('Ошибка при шифровании ключа для нового пользователя');
        }
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

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} theme={theme}>
                <div className="relative">
                    <Dialog.Title as="h3"
                                  className={`text-lg font-medium leading-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
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
                        {/* Поле email */}
                        <div className="relative">
                            <label
                                className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Email пользователя
                            </label>
                            <input
                                type="email"
                                placeholder="Введите email пользователя"
                                value={email}
                                onChange={handleEmailChange}
                                onFocus={() => email.length >= 3 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                    theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                                }`}
                            />
                            {showSuggestions && emailSuggestions.length > 0 && (
                                <div className="absolute z-50 mt-1 w-full">
                                    <ul className={`shadow-lg rounded-md border ${
                                        theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                                    }`}>
                                        {emailSuggestions.map((user) => (
                                            <li
                                                key={user.id}
                                                className={`px-3 py-2 cursor-pointer transition-colors ${
                                                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                                                }`}
                                                onClick={() => {
                                                    setEmail(user.email);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <div
                                                    className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {user.name}
                                                </div>
                                                <div
                                                    className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {user.email}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Поле пароля для зашифрованных таблиц */}
                        {isTableEncrypted && (
                            <div>
                                <label
                                    className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                        theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                                    } ${passwordError ? 'border-red-500' : ''}`}
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                                )}
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Этот пароль будет использоваться пользователем для доступа к данным таблицы
                                </p>
                            </div>
                        )}

                        {/* Разрешения */}
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
                                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                                                theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
                                            }`}
                                        />
                                        <label htmlFor={`permission-${key}`} className={`ml-2 text-sm ${
                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            {label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Информация о зашифрованной таблице */}
                        {isTableEncrypted && (
                            <div
                                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    <strong>Таблица зашифрована</strong><br/>
                                    Для предоставления доступа необходимо ввести пароль, который будет использоваться
                                    новым пользователем для доступа к данным.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md hover:bg-opacity-80 ${
                                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSharing || !email || (isTableEncrypted && !userPassword)}
                            className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 ${
                                isSharing ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                                theme === 'dark' ? 'bg-green-700' : 'bg-green-600'
                            }`}
                        >
                            {isSharing ? 'Отправка...' : 'Поделиться'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Модальное окно для разблокировки таблицы */}
            <Modal isOpen={showUnlockModal} onClose={handleUnlockModalClose} theme={theme}>
                <div className="relative">
                    <Dialog.Title as="h3"
                                  className={`text-lg font-medium leading-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        🔓 Разблокировка таблицы
                    </Dialog.Title>
                    <div className="mt-4">
                        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Для добавления пользователя <strong>{selectedUser?.name}</strong> в зашифрованную таблицу
                            необходимо сначала разблокировать её.
                        </p>

                        <input
                            type="password"
                            placeholder="Введите ваш пароль для разблокировки таблицы..."
                            value={unlockPassword}
                            onChange={(e) => {
                                setUnlockPassword(e.target.value);
                                setPasswordError('');
                            }}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                            } ${passwordError ? 'border-red-500' : ''}`}
                        />

                        {passwordError && (
                            <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                        )}
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleUnlockModalClose}
                            className={`px-4 py-2 rounded-md hover:bg-opacity-80 ${
                                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            onClick={handleUnlockSubmit}
                            disabled={isSharing}
                            className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 ${
                                isSharing ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                                theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'
                            }`}
                        >
                            {isSharing ? 'Разблокировка...' : 'Разблокировать'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
