import { useState, useRef, useEffect } from 'react';
import {Head, router} from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

export default function TableManager({ tables }) {
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [email, setEmail] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const inputRef = useRef(null);

    const handleEditStart = (id, name) => {
        setEditingId(id);
        setEditName(name);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleEditSave = (id) => {
        // Заглушка для API запроса
        console.log(`Updating table ${id} to name: ${editName}`);
        // Реальный запрос будет выглядеть так:
        // router.patch(`/tables/${id}`, { name: editName }, {
        //     onSuccess: () => setEditingId(null)
        // });
        setEditingId(null);
    };

    const handleShare = (table) => {
        setCurrentTable(table);
        setShareModalOpen(true);
    };

    const handleDelete = (table) => {
        setCurrentTable(table);
        setDeleteModalOpen(true);
    };

    const submitShare = () => {
        // Заглушка для API запроса
        console.log(`Sharing table ${currentTable.id} with email: ${email}`);
        // Реальный запрос:
        // router.post(`/tables/${currentTable.id}/share`, { email }, {
        //     onSuccess: () => setShareModalOpen(false)
        // });
        setShareModalOpen(false);
        setEmail('');
    };

    const submitDelete = () => {
        // Заглушка для API запроса
        console.log(`Deleting table ${currentTable.id}`);
        // Реальный запрос:
        // router.delete(`/tables/${currentTable.id}`, {
        //     onSuccess: () => setDeleteModalOpen(false)
        // });
        setDeleteModalOpen(false);
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
                    {Object.entries(tables).map(([id, name]) => (
                        <div key={id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {editingId === id ? (
                                <div className="flex items-center gap-2 flex-grow">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-grow px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleEditSave(id);
                                            if (e.key === 'Escape') handleEditCancel();
                                        }}
                                    />
                                    <button
                                        onClick={() => handleEditSave(id)}
                                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full"
                                        title="Сохранить"
                                    >
                                        <CheckIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleEditCancel}
                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
                                        title="Отменить"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="font-medium text-gray-900 truncate flex-grow">{name}</div>

                                    <div className="flex space-x-2 sm:space-x-3">
                                        <button
                                            onClick={() => handleEditStart(id, name)}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm sm:text-base"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            onClick={() => handleShare({ id, name })}
                                            className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm sm:text-base"
                                        >
                                            Поделиться
                                        </button>
                                        <button
                                            onClick={() => handleDelete({ id, name })}
                                            className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm sm:text-base"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Модальное окно доступа */}
            <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)}>
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Предоставить доступ к "{currentTable?.name}"
                </Dialog.Title>
                <div className="mt-4">
                    <input
                        type="email"
                        placeholder="Email пользователя"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => setShareModalOpen(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={submitShare}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Поделиться
                    </button>
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
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => setDeleteModalOpen(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={submitDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Удалить
                    </button>
                </div>
            </Modal>
        </div>
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
