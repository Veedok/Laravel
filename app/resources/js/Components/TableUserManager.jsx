import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

export default function TableUserManager({ tableId, permissions }) {
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
            console.error('Failed to fetch users:', err);
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
            console.error('Failed to update permissions:', err);
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
            console.error('Failed to remove user:', err);
            setError('Не удалось удалить пользователя');
        } finally {
            setUserToDelete(null);
        }
    };

    return (
        <div className="mt-1">
            {/* Индикатор расширения - улучшенный вариант */}
            <div
                className="flex justify-center cursor-pointer py-2 bg-gray-50 hover:bg-gray-100 rounded-b-lg transition-colors border-t"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                )}
                <span className="ml-2 text-sm text-gray-600">
                    {isExpanded ? 'Скрыть' : 'Показать'} доступы
                </span>
            </div>

            {/* Расширяемое содержимое */}
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="py-3">
                    {isLoading ? (
                        <div className="text-center py-4">Загрузка...</div>
                    ) : error ? (
                        <div className="text-red-500 text-center py-4">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">Нет приглашенных пользователей</div>
                    ) : (
                        <div className="space-y-3">
                            {users.map(user => (
                                <div key={user.id} className="border rounded-lg p-3 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h4 className="font-medium">{user.name}</h4>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => confirmRemoveUser(user)}
                                            className="p-1 text-red-500 hover:text-red-700 rounded"
                                            title="Удалить доступ"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                        {Object.entries(permissions).map(([key, label]) => (
                                            <label key={key} className="flex items-center space-x-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={user.permissions.includes(key)}
                                                    onChange={(e) => handlePermissionChange(user.id, key, e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{label}</span>
                                            </label>
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Удаление доступа
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Вы уверены, что хотите удалить доступ пользователя {userToDelete?.name} ({userToDelete?.email}) к таблице?
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
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
