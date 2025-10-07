// Dashboard.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import PayTable from '@/Components/PayTable.jsx';
import CarouselButtons from "@/Components/CarouselButtons.jsx";
import React, {useState, useEffect} from "react";
import axios from 'axios';
import EncryptionService from "@/Pages/Crypto/encryptionService.js";

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Загружаем данные...</p>
    </div>
);

const ErrorMessage = ({message, onRetry}) => (
    <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg className="w-10 h-10 text-red-500 animate-bounce" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            <p className="text-red-600 font-medium text-center">{message}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                Попробовать снова
            </button>
        </div>
    </div>
);

const NoTablesMessage = ({onAddTable}) => (
    <div className="max-w-md mx-auto p-6 bg-blue-50 rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
            </div>
            <p className="text-blue-600 font-medium text-center">У вас нет ни одной таблицы. Создайте таблицу для начала
                работы.</p>
            <button
                onClick={() => onAddTable("Новая таблица")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Создать таблицу
            </button>
        </div>
    </div>
);

// Компонент для ввода пароля при зашифрованных данных
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
        // Очищаем ошибку при изменении пароля
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

// Новый компонент-обертка для ограничения ширины
const TableContainer = ({ children }) => (
    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        {children}
    </div>
);

export default function Dashboard({ theme, tables: initialTables, auth }) {
    const [data, setData] = useState({
        transactions: [],
        userTags: [],
        permission: {
            is_owner: false,
            permissions: []
        },
        is_encrypted: false,
        tableKey: null,
        salt: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tables, setTables] = useState(initialTables);
    const [activeTableId, setActiveTableId] = useState(null);
    const [isTableEncrypted, setIsTableEncrypted] = useState(false);
    const [isTableLocked, setIsTableLocked] = useState(true);
    const [unlockLoading, setUnlockLoading] = useState(false);
    const [unlockError, setUnlockError] = useState(null);

    const hasTables = Object.keys(tables).length > 0;

    useEffect(() => {
        if (hasTables) {
            const initialActiveId = Object.keys(tables).find(key => tables[key].active === true);
            setActiveTableId(initialActiveId || Object.keys(tables)[0]);
        }
    }, [hasTables]);

    useEffect(() => {
        if (activeTableId) {
            fetchTransactions(activeTableId);
        }
    }, [activeTableId]);

    const handleEncryptionChange = (encrypted, locked) => {
        setIsTableEncrypted(encrypted);
        setIsTableLocked(locked);
    };

    const fetchTransactions = async (tableId) => {
        try {
            setLoading(true);
            setError(null);
            setUnlockError(null);
            const response = await axios.post(route('tableData'), {
                tableId: tableId
            });

            const serverData = response.data;
            setData(serverData);

            // Синхронизируем состояние шифрования с сервером
            setIsTableEncrypted(serverData.is_encrypted || false);

            if (serverData.is_encrypted) {
                const hasDecryptedKey = localStorage.getItem(`table_${tableId}_dataKey`);

                if (hasDecryptedKey) {
                    setIsTableLocked(false);
                } else if (serverData.tableKey && serverData.salt) {
                    localStorage.setItem(`table_${tableId}_serverKey`, serverData.tableKey);
                    localStorage.setItem(`table_${tableId}_serverSalt`, serverData.salt);
                    setIsTableLocked(true);
                } else {
                    setIsTableLocked(true);
                }
            } else {
                setIsTableLocked(false);
                localStorage.removeItem(`table_${tableId}_dataKey`);
                localStorage.removeItem(`table_${tableId}_serverKey`);
                localStorage.removeItem(`table_${tableId}_serverSalt`);
                localStorage.removeItem(`table_${tableId}_encryptedKeys`);
            }

        } catch (err) {
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlockData = async (password) => {
        if (!activeTableId) return;

        setUnlockLoading(true);
        setUnlockError(null);

        try {
            const storedEncryptedKeys = localStorage.getItem(`table_${activeTableId}_encryptedKeys`);
            if (storedEncryptedKeys) {
                const encryptedKeys = JSON.parse(storedEncryptedKeys);
                const currentUserKey = encryptedKeys[auth.user.id];

                if (currentUserKey) {
                    const salt = EncryptionService.hexToUint8Array(currentUserKey.salt);
                    const kek = await EncryptionService.deriveKeyFromPassword(password, salt);
                    const dataKey = await EncryptionService.decryptDataKey(currentUserKey.encryptedDataKey, kek);

                    const exportedDataKey = await EncryptionService.exportKey(dataKey);
                    localStorage.setItem(`table_${activeTableId}_dataKey`, exportedDataKey);

                    setIsTableLocked(false);
                    handleEncryptionChange(true, false);
                    return;
                }
            }

            const serverKey = localStorage.getItem(`table_${activeTableId}_serverKey`);
            const serverSalt = localStorage.getItem(`table_${activeTableId}_serverSalt`);

            if (serverKey && serverSalt) {
                try {
                    const salt = EncryptionService.hexToUint8Array(serverSalt);
                    const kek = await EncryptionService.deriveKeyFromPassword(password, salt);
                    const dataKey = await EncryptionService.decryptDataKey(serverKey, kek);

                    const exportedDataKey = await EncryptionService.exportKey(dataKey);
                    localStorage.setItem(`table_${activeTableId}_dataKey`, exportedDataKey);

                    setIsTableLocked(false);
                    handleEncryptionChange(true, false);
                    return;

                } catch (serverKeyError) {
                    console.error('Ошибка расшифровки серверных ключей:', serverKeyError);
                    throw new Error('Неверный пароль');
                }
            }

            throw new Error('Неверный пароль или ключи шифрования не найдены');

        } catch (error) {
            console.error('Ошибка разблокировки:', error);
            setUnlockError(error.message || 'Неверный пароль или ошибка разблокировки');
        } finally {
            setUnlockLoading(false);
        }
    };

    const handleLockTable = () => {
        if (!activeTableId) return;

        localStorage.removeItem(`table_${activeTableId}_dataKey`);
        setIsTableLocked(true);
        handleEncryptionChange(true, true);
    };

    const handleClearUnlockError = () => {
        setUnlockError(null);
    };

    const handleItemClick = (id) => {
        setTables(prev => {
            const updated = {};
            Object.keys(prev).forEach(key => {
                updated[key] = {
                    ...prev[key],
                    active: key === id.toString()
                };
            });
            return updated;
        });
        setActiveTableId(id.toString());
    };

    const handleRetry = () => {
        if (activeTableId) {
            fetchTransactions(activeTableId);
        }
    };

    const handleAddItem = async (name) => {
        try {
            setLoading(true);
            const response = await axios.put(`/table`, {
                name: name
            }, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (response.status === 200) {
                const newTableId = response.data.id;

                setTables(prevTables => {
                    const updatedTables = {};
                    Object.keys(prevTables).forEach(key => {
                        updatedTables[key] = {
                            ...prevTables[key],
                            active: false
                        };
                    });
                    updatedTables[newTableId] = {
                        name: name,
                        active: true,
                        owner: true
                    };
                    return updatedTables;
                });
                setActiveTableId(newTableId.toString());
                return true;
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setError('Таблица с таким именем уже существует');
            } else {
                setError('Не удалось создать таблицу');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Функция для отображения контента в зависимости от состояния шифрования
    const renderContent = () => {
        if (!hasTables) {
            return <NoTablesMessage onAddTable={handleAddItem} />;
        }

        if (loading) {
            return <LoadingSpinner />;
        }

        if (error) {
            return <ErrorMessage message={error} onRetry={handleRetry} />;
        }

        // Если данные зашифрованы и заблокированы - показываем запрос пароля
        if (isTableEncrypted && isTableLocked) {
            return (
                <PasswordPrompt
                    theme={theme}
                    onUnlock={handleUnlockData}
                    loading={unlockLoading}
                    error={unlockError}
                    onClearError={handleClearUnlockError}
                />
            );
        }

        // Во всех остальных случаях показываем таблицу с данными
        return (
            <PayTable
                data={data.transactions}
                activeTableId={activeTableId}
                permissions={data.permission}
                theme={theme}
                userTags={data.userTags}
                isEncrypted={isTableEncrypted}
                isLocked={isTableLocked}
                onLockTable={handleLockTable}
            />
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Таблица баланса
                </h2>
            }
        >
            <Head title="Таблица Баланса"/>

            {/* CarouselButtons оставляем на всю ширину */}
            <CarouselButtons
                items={tables}
                onItemClick={handleItemClick}
                onAddItem={handleAddItem}
                theme={theme}
                activeTableId={activeTableId}
            />

            {/* Оборачиваем только таблицу */}
            <TableContainer>
                {renderContent()}
            </TableContainer>
        </AuthenticatedLayout>
    );
}
