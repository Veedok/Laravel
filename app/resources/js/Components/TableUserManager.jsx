import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

export default function TableUserManager({ tableId, permissions, theme }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post(route('tableUsers', { id: tableId }));
            setUsers(response.data);
        } catch (err) {
            setError('Не удалось загрузить список пользователей');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isExpanded && users.length === 0) {
            fetchUsers();
        }
    }, [isExpanded]);

    const handlePermissionChange = async (userId, permission, isChecked) => {
        try {
            await axios.patch(route('tableUpdatePermissions'), {
                tableId,
                userId,
                permission,
                value: isChecked
            });

            setUsers(prev => prev.map(user => {
                if (user.id === userId) {
                    const newPermissions = isChecked
                        ? [...user.permissions, permission]
                        : user.permissions.filter(p => p !== permission);
                    return { ...user, permissions: newPermissions };
                }
                return user;
            }));
        } catch (err) {
            setError('Не удалось обновить права доступа');
        }
    };

    const confirmRemoveUser = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const handleRemoveUser = async () => {
        if (!userToDelete) return;

        try {
            await axios.delete(route('tableRemoveUser'), {
                data: { tableId, userId: userToDelete.id }
            });
            setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
            setDeleteModalOpen(false);
        } catch (err) {
            setError('Не удалось удалить пользователя');
        } finally {
            setUserToDelete(null);
        }
    };

    return (
        <div className="mt-1">
            {/* Индикатор расширения */}
            <div
                className={`flex justify-center cursor-pointer py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'} rounded-b-lg transition-colors border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                )}
                <span className="ml-2 text-sm">
                    {isExpanded ? 'Скрыть' : 'Показать'} доступы
                </span>
            </div>

            {/* Расширяемое содержимое */}
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="py-3">
                    {isLoading ? (
                        <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Загрузка...</div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : users.length === 0 ? (
                        <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Нет приглашенных пользователей</div>
                    ) : (
                        <div className="space-y-3">
                            {users.map(user => (
                                <div key={user.id} className={`border rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="min-w-0">
                                            <h4 className={`font-medium truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{user.name}</h4>
                                            <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => confirmRemoveUser(user)}
                                            className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 rounded"
                                            title="Удалить доступ"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 mt-3">
                                        {Object.entries(permissions).map(([key, label]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className={`text-sm flex-grow ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                                                <label className="inline-flex items-center cursor-pointer ml-3">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={user.permissions.includes(key)}
                                                        onChange={(e) => handlePermissionChange(user.id, key, e.target.checked)}
                                                    />
                                                    <div className={`relative w-11 h-6 ${theme === 'dark' ? 'bg-gray-600 peer-checked:bg-[#577ADE]' : 'bg-gray-300 peer-checked:bg-[#577ADE]'} rounded-full peer transition-colors duration-200`}>
                                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 ${theme === 'dark' ? 'bg-gray-300' : 'bg-white'} rounded-full shadow-md transform transition-transform duration-200 ${user.permissions.includes(key) ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно подтверждения удаления */}
            <Transition appear show={deleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setDeleteModalOpen(false)}>
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
                                <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 text-left align-middle shadow-xl transition-all`}>
                                    <Dialog.Title
                                        as="h3"
                                        className={`text-lg font-medium leading-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}
                                    >
                                        Удаление доступа
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                            Вы уверены, что хотите удалить доступ пользователя {userToDelete?.name} ({userToDelete?.email}) к таблице?
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                            onClick={() => setDeleteModalOpen(false)}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                            onClick={handleRemoveUser}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
