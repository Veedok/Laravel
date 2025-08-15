import { useState, useRef, useEffect } from 'react';
import {Head, router} from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import '../../css/TableControll.css';
import TableUserManager from '../Components/TableUserManager';

export default function TableManager({ tables, permissions }) {
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [emailSuggestions, setEmailSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [email, setEmail] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const inputRef = useRef(null);
    const [editError, setEditError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [localTables, setLocalTables] = useState(
        Object.entries(tables).map(([id, name]) => ({ id, name }))
    );
    const [deleteError, setDeleteError] = useState('');
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success' // 'success' или 'error'
    });

    const fetchEmailSuggestions = async (query) => {
        try {
            const response = await axios.get(route('userSearch'), {
                params: { query, limit: 5,  tableId: currentTable.id}
            });
            setEmailSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching email suggestions:', error);
            setEmailSuggestions([]);
        }
    };

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
    const showNotification = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });

        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    const showSuccess = (message) => showNotification(message, 'success');
    const showError = (message) => showNotification(message, 'error');
    const handleEditStart = (id, name) => {
        setEditingId(id);
        setEditName(name);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleEditSave = async (id) => {
        if (editName === localTables.find(t => t.id === id)?.name) {
            setIsShaking(true);
            setEditError('Необходимо изменить имя таблицы');
            setTimeout(() => setIsShaking(false), 500);
            setTimeout(() => setEditError(''), 5000);
            return;
        }

        try {
            const response = await axios.patch(route('tableEdit'), {
                id: id,
                name: editName
            });

            // Обновляем локальное состояние таблиц
            setLocalTables(prev =>
                prev.map(table =>
                    table.id === id ? { ...table, name: editName } : table
                )
            );

            setEditingId(null);
            setEditName('');
            setEditError('');
            showSuccess('Название таблицы успешно изменено');
        } catch (error) {
            if (error.response) {
                setEditError(
                    error.response.data.message ||
                    `Ошибка при обновлении (код: ${error.response.status})`
                );
            } else {
                setEditError('Не удалось выполнить обновление. Проверьте соединение.');
            }
            console.error('Update error:', error);

            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            setTimeout(() => setEditError(''), 5000);
        }
    };

    const handleShare = (table) => {
        setCurrentTable(table);
        setShareModalOpen(true);
    };

    const handleDelete = (table) => {
        setCurrentTable(table);
        setDeleteModalOpen(true);
    };

    const submitShare = async () => {
        if (!email || !currentTable?.id) {
            showError('Пожалуйста, введите email');
            return;
        }

        // Находим выбранного пользователя по email
        const selectedUser = emailSuggestions.find(user => user.email === email);

        if (!selectedUser) {
            showError('Пожалуйста, выберите пользователя из списка');
            return;
        }

        setIsSharing(true);

        try {
            const response = await axios.post(route('tableShare'), {
                userId: selectedUser.id,  // ID пользователя
                tableId: currentTable.id,  // ID таблицы
                permissions: selectedPermissions // Выбранные разрешения
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            showSuccess(`Доступ к таблице "${currentTable.name}" предоставлен ${email}`);
            setShareModalOpen(false);
            setEmail('');
            setEmailSuggestions([]);
            setSelectedPermissions([]);
        } catch (error) {
            if (error.response) {
                showError(error.response.data.message ||
                    `Ошибка при предоставлении доступа (код: ${error.response.status})`);
            } else {
                showError('Не удалось предоставить доступ. Проверьте соединение.');
            }
            console.error('Share error:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const submitDelete = async () => {
        if (!currentTable) {
            setDeleteModalOpen(false);
            return;
        }

        try {
            const response = await axios.delete(route('tableDelete'), {
                data: { id: currentTable.id }
            });

            // Удаляем таблицу из локального состояния
            setLocalTables(prev => prev.filter(table => table.id !== currentTable.id));

            showSuccess('Таблица успешно удалена');

        } catch (error) {
            if (error.response) {
                showError(error.response.data.message ||
                    `Ошибка при удалении (код: ${error.response.status})`);
            } else {
                showError('Не удалось выполнить удаление. Проверьте соединение.');
            }
            console.error('Delete error:', error);
        } finally {
            setDeleteModalOpen(false);
            setCurrentTable(null);
        }
    };

    // Автофокус на поле ввода при редактировании
    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Таблица баланса
                </h2>
            }
        >
            <Head title="Таблица Баланса"/>
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Управление таблицами</h2>
                </div>

                <div className="divide-y divide-gray-200">
                    {localTables.map(table => (
                        <div key={table.id} className="px-6 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {editingId === table.id ? (
                                <div className="flex flex-col flex-grow">
                                    <div
                                        className={`flex items-center gap-2 flex-grow ${isShaking ? 'animate-shake' : ''}`}>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className={`flex-grow px-3 py-1 border ${
                                                editError ? 'border-red-500' : 'border-gray-300'
                                            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleEditSave(table.id);
                                                if (e.key === 'Escape') handleEditCancel();
                                            }}
                                        />
                                        <button
                                            onClick={() => handleEditSave(table.id)}
                                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full"
                                            title="Сохранить"
                                        >
                                            <CheckIcon className="h-5 w-5"/>
                                        </button>
                                        <button
                                            onClick={handleEditCancel}
                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
                                            title="Отменить"
                                        >
                                            <XMarkIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                    {editError && (
                                        <div className="text-red-500 text-sm mt-1 animate-fadeIn">
                                            {editError}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="font-medium text-gray-900 truncate flex-grow">{table.name}</div>

                                    <div className="flex space-x-2 sm:space-x-3">
                                        <button
                                            onClick={() => handleEditStart(table.id, table.name)}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm sm:text-base"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            onClick={() => handleShare(table)}
                                            className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm sm:text-base"
                                        >
                                            Поделиться
                                        </button>
                                        <button
                                            onClick={() => handleDelete(table)}
                                            className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm sm:text-base"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </>
                            )}
                            </div>
                            <TableUserManager
                                tableId={table.id}
                                permissions={permissions}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Модальное окно доступа */}
            <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)}>
                <div className="relative">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Предоставить доступ к "{currentTable?.name}"
                    </Dialog.Title>
                    <div className="mt-4">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email пользователя"
                                value={email}
                                onChange={handleEmailChange}
                                onFocus={() => email.length >= 3 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {showSuggestions && emailSuggestions.length > 0 && (
                                <div className="absolute z-50 mt-1 w-full">
                                    <ul className="bg-white shadow-lg rounded-md border border-gray-200">
                                        {emailSuggestions.map((user) => (
                                            <li
                                                key={user.id}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setEmail(user.email);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Добавляем блок с чекбоксами */}
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Разрешения:</h4>
                            <div className="space-y-2">
                                {Object.entries(permissions).map(([key, label]) => (
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
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`permission-${key}`} className="ml-2 text-sm text-gray-700">
                                            {label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShareModalOpen(false);
                                setEmail('');
                                setEmailSuggestions([]);
                                setSelectedPermissions([]);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            onClick={submitShare}
                            disabled={isSharing || !email}
                            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
                                isSharing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSharing ? 'Отправка...' : 'Поделиться'}
                        </button>
                    </div>
                </div>
            </Modal>
            {/* Модальное окно удаления */}
            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Удалить таблицу
                </Dialog.Title>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Вы уверены, что хотите удалить таблицу "{currentTable?.name}"? Это действие нельзя отменить.
                    </p>
                    {deleteError && (
                        <p className="mt-2 text-sm text-red-500">{deleteError}</p>
                    )}
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => {
                            setDeleteModalOpen(false);
                            setDeleteError('');
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={submitDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        disabled={!currentTable}
                    >
                        Удалить
                    </button>
                </div>
            </Modal>
        </div>
            {toast.show && (
                <ToastNotification
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                />
            )}
        </AuthenticatedLayout>
    );
}

function Modal({ isOpen, onClose, children }) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
function ToastNotification({ message, type = 'success', onClose }) {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between min-w-[200px] animate-fadeIn`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                <XMarkIcon className="h-5 w-5" />
            </button>
        </div>
    );
}
