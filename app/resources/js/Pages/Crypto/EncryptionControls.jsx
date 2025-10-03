// TableEncryptionControls.jsx
import React, { useState, useEffect } from 'react';
import EncryptionService from "@/Pages/Crypto/encryptionService.js";
import axios from 'axios';

const TableEncryptionControls = ({
                                     theme,
                                     isOwner,
                                     tableId,
                                     currentUser,
                                     onEncryptionChange,
                                     tableTransactions,
                                     isEncryptedFromServer,
                                     serverTableKey, // новый пропс - ключ с сервера
                                     serverSalt      // новый пропс - соль с сервера
                                 }) => {
    const [isEncrypted, setIsEncrypted] = useState(isEncryptedFromServer);
    const [isLocked, setIsLocked] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [passwords, setPasswords] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [tableUsers, setTableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Проверяем состояние шифрования
    useEffect(() => {
        setIsEncrypted(isEncryptedFromServer);

        if (isEncryptedFromServer) {
            // Проверяем наличие ключа разными способами
            const hasLocalKey = localStorage.getItem(`table_${tableId}_dataKey`);
            const hasServerKey = serverTableKey && serverSalt;

            if (hasServerKey) {
                // Сохраняем серверные ключи локально
                localStorage.setItem(`table_${tableId}_dataKey`, serverTableKey);
                localStorage.setItem(`table_${tableId}_salt`, serverSalt);
                setIsLocked(false);
            } else if (hasLocalKey) {
                setIsLocked(false);
            } else {
                setIsLocked(true);
            }
        } else {
            setIsLocked(false);
        }
    }, [isEncryptedFromServer, serverTableKey, serverSalt, tableId]);

    const themeClasses = {
        container: theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-200 text-gray-800',
        buttonPrimary: theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        buttonSecondary: theme === 'dark'
            ? 'bg-gray-600 hover:bg-gray-700 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
        input: theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
        modalOverlay: theme === 'dark'
            ? 'bg-black bg-opacity-70'
            : 'bg-black bg-opacity-50',
        modalContent: theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-200 text-gray-900',
        currentUserCard: theme === 'dark'
            ? 'bg-blue-900/30 border-blue-700'
            : 'bg-blue-50 border-blue-200',
        otherUserCard: theme === 'dark'
            ? 'bg-gray-700 border-gray-600'
            : 'bg-gray-50 border-gray-200'
    };

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    const resetModal = () => {
        setShowModal(false);
        setModalType('');
        setPasswords({});
        setConfirmPassword('');
        setCurrentPassword('');
    };

    // Реальный запрос для получения пользователей таблицы
    const fetchTableUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.post(route('tableUsers'), {
                id: tableId
            });

            const serverUsers = response.data;

            // Добавляем текущего пользователя в список если его там нет
            const usersWithCurrent = [...serverUsers];
            const currentUserExists = serverUsers.some(user => user.id === currentUser.id);

            if (!currentUserExists) {
                usersWithCurrent.push({
                    id: currentUser.id,
                    mail: currentUser.email,
                    name: currentUser.name
                });
            }

            // Сортируем: текущий пользователь первый, остальные после
            const sortedUsers = usersWithCurrent.sort((a, b) => {
                if (a.id === currentUser.id) return -1;
                if (b.id === currentUser.id) return 1;
                return 0;
            });

            setTableUsers(sortedUsers);

            // Инициализируем пароли для всех пользователей
            const initialPasswords = {};
            sortedUsers.forEach(user => {
                initialPasswords[user.id] = '';
            });
            setPasswords(initialPasswords);

        } catch (error) {
            console.error('Ошибка получения пользователей таблицы:', error);
            showMessage('Ошибка при загрузке пользователей таблицы', 'error');
            setTableUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Функция для шифрования данных транзакций
    const encryptTransactionsData = async (dataKey) => {
        const encryptedTransactions = {};

        for (const transaction of tableTransactions) {
            try {
                // Шифруем title и sum
                const encryptedTitle = await EncryptionService.encryptData(transaction.title, dataKey);
                const encryptedSum = await EncryptionService.encryptData(transaction.sum.toString(), dataKey);

                encryptedTransactions[transaction.id] = {
                    sum: encryptedSum,
                    title: encryptedTitle
                };
            } catch (error) {
                console.error(`Ошибка шифрования транзакции ${transaction.id}:`, error);
                throw new Error(`Не удалось зашифровать транзакцию ${transaction.id}`);
            }
        }

        return encryptedTransactions;
    };

    // Шифрование таблицы
    const handleEncrypt = async () => {
        try {
            const currentUserPassword = passwords[currentUser.id];
            if (!currentUserPassword || currentUserPassword.length < 6) {
                showMessage('Ваш пароль должен быть не менее 6 символов', 'error');
                return;
            }
            if (currentUserPassword !== confirmPassword) {
                showMessage('Пароли не совпадают', 'error');
                return;
            }
            for (const user of tableUsers) {
                if (user.id === currentUser.id) continue;
                const password = passwords[user.id];
                if (!password || password.length < 6) {
                    showMessage(`Пароль для ${user.mail} должен быть не менее 6 символов`, 'error');
                    return;
                }
            }
            setLoading(true);
            const dataKey = await EncryptionService.generateDataKey();
            const encryptedKeys = {};
            for (const user of tableUsers) {
                const salt = EncryptionService.generateSalt();
                const kek = await EncryptionService.deriveKeyFromPassword(passwords[user.id], salt);
                const encryptedDataKey = await EncryptionService.encryptDataKey(dataKey, kek);
                encryptedKeys[user.id] = {
                    encryptedDataKey,
                    salt: EncryptionService.uint8ArrayToHex(salt)
                };
            }
            const encryptedTransactions = await encryptTransactionsData(dataKey);
            const requestData = {
                tableId: parseInt(tableId),
                users: {},
                transactions: encryptedTransactions
            };
            for (const [userId, keyData] of Object.entries(encryptedKeys)) {
                requestData.users[userId] = {
                    encryptedDataKey: keyData.encryptedDataKey,
                    salt: keyData.salt
                };
            }
            console.log('Отправка зашифрованных данных на сервер:', {
                tableId: requestData.tableId,
                usersCount: Object.keys(requestData.users).length,
                transactionsCount: Object.keys(requestData.transactions).length
            });
            const response = await axios.post(route('cryptoTable'), requestData);

            if (response.status === 200) {
                // 6. Сохраняем локально только ключ для текущей сессии
                const exportedDataKey = await EncryptionService.exportKey(dataKey);
                localStorage.setItem(`table_${tableId}_dataKey`, exportedDataKey);
                localStorage.setItem(`table_${tableId}_encryptedKeys`, JSON.stringify(encryptedKeys));

                // НЕ сохраняем флаг encrypted в localStorage - он теперь на сервере
                // setIsEncrypted(true); - теперь управляется сервером через пропс
                setIsLocked(false);
                onEncryptionChange?.(true, false);
                showMessage('Таблица успешно зашифрована!', 'success');
                resetModal();

                // Перезагружаем данные чтобы получить зашифрованные транзакции с сервера
                window.location.reload();
            } else {
                throw new Error(`Сервер вернул статус: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка шифрования или отправки на сервер:', error);
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Ошибка сервера';
                showMessage(`Ошибка сервера: ${errorMessage}`, 'error');
            } else if (error.request) {
                showMessage('Ошибка сети: не удалось отправить данные на сервер', 'error');
            } else {
                showMessage(`Ошибка: ${error.message}`, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Расшифровка таблицы
    const handleDecrypt = async () => {
        try {
            setLoading(true);

            // TODO: Отправляем запрос на сервер для расшифровки
            // После успеха сервер должен вернуть is_encrypted: false

            // Очищаем локальные ключи
            localStorage.removeItem(`table_${tableId}_dataKey`);
            localStorage.removeItem(`table_${tableId}_encryptedKeys`);

            // setIsEncrypted(false); - теперь управляется сервером
            setIsLocked(false);
            onEncryptionChange?.(false, false);
            showMessage('Таблица успешно расшифрована!', 'success');
            resetModal();

            // Перезагружаем данные
            window.location.reload();

        } catch (error) {
            console.error('Ошибка расшифровки:', error);
            showMessage('Ошибка при расшифровке данных', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Разблокировка данных
    const handleUnlock = async () => {
        try {
            if (!currentPassword) {
                showMessage('Введите пароль', 'error');
                return;
            }

            setLoading(true);

            // Получаем зашифрованные ключи
            const storedEncryptedKeys = localStorage.getItem(`table_${tableId}_encryptedKeys`);
            if (!storedEncryptedKeys) {
                showMessage('Данные шифрования не найдены', 'error');
                return;
            }

            const encryptedKeys = JSON.parse(storedEncryptedKeys);
            const currentUserKey = encryptedKeys[currentUser.id];

            if (!currentUserKey) {
                showMessage('Ключ для вашего пользователя не найден', 'error');
                return;
            }

            // Расшифровываем ключ данных
            const salt = EncryptionService.hexToUint8Array(currentUserKey.salt);
            const kek = await EncryptionService.deriveKeyFromPassword(currentPassword, salt);
            const dataKey = await EncryptionService.decryptDataKey(currentUserKey.encryptedDataKey, kek);

            // Сохраняем расшифрованный ключ
            const exportedDataKey = await EncryptionService.exportKey(dataKey);
            localStorage.setItem(`table_${tableId}_dataKey`, exportedDataKey);

            setIsLocked(false);
            onEncryptionChange?.(true, false);
            showMessage('Данные успешно разблокированы!', 'success');
            resetModal();

        } catch (error) {
            console.error('Ошибка разблокировки:', error);

            // Пробуем использовать серверные ключи если они есть
            if (serverTableKey && serverSalt) {
                try {
                    showMessage('Пробуем использовать серверные ключи...', 'info');

                    // TODO: Реализовать расшифровку серверных ключей
                    // Это потребует изменения логики на сервере

                } catch (serverKeyError) {
                    showMessage('Неверный пароль или ошибка разблокировки', 'error');
                }
            } else {
                showMessage('Неверный пароль или ошибка разблокировки', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Блокировка данных
    const handleLock = () => {
        // Очищаем только локальные ключи, но оставляем серверные метаданные
        localStorage.removeItem(`table_${tableId}_dataKey`);
        setIsLocked(true);
        onEncryptionChange?.(true, true);
        showMessage('Данные заблокированы', 'success');
    };

    const openModal = async (type) => {
        setModalType(type);
        if (type === 'encrypt') {
            await fetchTableUsers();
        }
        setShowModal(true);
    };

    const handleModalSubmit = () => {
        switch (modalType) {
            case 'encrypt':
                handleEncrypt();
                break;
            case 'decrypt':
                handleDecrypt();
                break;
            case 'unlock':
                handleUnlock();
                break;
            default:
                break;
        }
    };

    const handlePasswordChange = (userId, value) => {
        setPasswords(prev => ({
            ...prev,
            [userId]: value
        }));
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
                {tableUsers.map((user, index) => {
                    const isCurrentUser = user.id === currentUser.id;

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

                                {/* Поле подтверждения пароля только для текущего пользователя */}
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
                                        {passwords[currentUser.id] && confirmPassword && (
                                            <div className={`text-xs mt-1 ${
                                                passwords[currentUser.id] === confirmPassword
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}>
                                                {passwords[currentUser.id] === confirmPassword
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

    const renderModal = () => {
        if (!showModal) return null;

        const modalConfig = {
            encrypt: {
                title: '🔐 Шифрование таблицы',
                content: (
                    <>
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-blue-700 dark:text-blue-300 text-sm">
                                <strong>Установите пароли для всех пользователей таблицы.</strong><br/>
                                Каждый пользователь сможет расшифровать данные только своим паролем.
                            </p>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Загружаем пользователей...</p>
                                </div>
                            </div>
                        ) : (
                            renderUserPasswordInputs()
                        )}
                    </>
                )
            },
            decrypt: {
                title: '🔓 Расшифровка таблицы',
                content: (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            ⚠️ <strong>Внимание!</strong> Все данные будут полностью расшифрованы и станут доступны всем пользователям без пароля.
                        </p>
                    </div>
                )
            },
            unlock: {
                title: '🔑 Разблокировка данных',
                content: (
                    <>
                        <p className="mb-4 text-gray-400">
                            Введите ваш пароль для доступа к данным:
                        </p>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Ваш пароль шифрования"
                            className={`w-full p-3 border rounded ${themeClasses.input}`}
                        />
                    </>
                )
            }
        };

        const config = modalConfig[modalType];

        return (
            <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${themeClasses.modalOverlay}`}>
                <div className={`rounded-lg p-6 max-w-lg w-full border ${themeClasses.modalContent}`}>
                    <h2 className="text-lg font-bold mb-4">
                        {config.title}
                    </h2>

                    {config.content}

                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            onClick={resetModal}
                            className={`px-4 py-2 rounded ${themeClasses.buttonSecondary}`}
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleModalSubmit}
                            className={`px-4 py-2 rounded ${themeClasses.buttonPrimary}`}
                            disabled={loading}
                        >
                            {loading ? 'Обработка...' : 'OK'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Если не владелец - не показываем контролы
    if (!isOwner) {
        return null;
    }

    return (
        <div className={`mb-6 p-4 rounded-lg border ${themeClasses.container}`}>
            {message && (
                <div className={`mb-4 p-3 rounded ${
                    messageType === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {message}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xl">
                        {isEncrypted ? (isLocked ? '🔒' : '🔓') : '📄'}
                    </span>
                    <div>
                        <div className="font-medium">
                            {isEncrypted
                                ? (isLocked ? 'Данные зашифрованы и заблокированы' : 'Данные зашифрованы и разблокированы')
                                : 'Данные не зашифрованы'
                            }
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {isEncrypted
                                ? (isLocked ? 'Введите пароль для просмотра данных' : 'Данные доступны для редактирования')
                                : 'Все данные видны в открытом виде'
                            }
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isEncrypted ? (
                        <button
                            onClick={() => openModal('encrypt')}
                            className={`px-4 py-2 rounded text-sm font-medium ${themeClasses.buttonPrimary}`}
                        >
                            Зашифровать таблицу
                        </button>
                    ) : isLocked ? (
                        <button
                            onClick={() => openModal('unlock')}
                            className={`px-4 py-2 rounded text-sm font-medium ${themeClasses.buttonPrimary}`}
                        >
                            Разблокировать данные
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleLock}
                                className={`px-4 py-2 rounded text-sm font-medium ${themeClasses.buttonSecondary}`}
                            >
                                Заблокировать
                            </button>
                            <button
                                onClick={() => openModal('decrypt')}
                                className={`px-4 py-2 rounded text-sm font-medium ${themeClasses.buttonPrimary}`}
                            >
                                Расшифровать
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {renderModal()}
        </div>
    );
};

export default TableEncryptionControls;
