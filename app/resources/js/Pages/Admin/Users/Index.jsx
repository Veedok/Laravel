import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, usePage} from '@inertiajs/react';
import axios from 'axios';
import {useState} from 'react';

export default function UsersIndex({users}) {
    const theme = usePage().props.theme || 'light';
    const [userList, setUserList] = useState(users);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [banDuration, setBanDuration] = useState('permanent');
    const [banComment, setBanComment] = useState('');

    const openBanModal = (user) => {
        setSelectedUser(user);
        setBanDuration('permanent');
        setBanComment('');
        setShowBanModal(true);
    };

    const closeBanModal = () => {
        setShowBanModal(false);
        setSelectedUser(null);
    };

    const handleBan = async (duration) => {
        if (!selectedUser) return;

        let expiredAt = null;
        switch (duration) {
            case '1hour':
                expiredAt = new Date(Date.now() + 60 * 60 * 1000);
                break;
            case '1day':
                expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                break;
            case '1week':
                expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                break;
            case '1month':
                expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                break;
            case 'permanent':
                expiredAt = null;
                break;
        }

        try {
            setLoading(true);
            setError('');

            const response = await axios.post(route('admin.users.ban'), {
                user_id: selectedUser.id,
                expired_at: expiredAt,
                comment: banComment || 'Нарушение правил'
            });

            setSuccess(response.data.message);

            const updatedUsers = userList.map(user =>
                user.id === selectedUser.id
                    ? {...user, banned_until: expiredAt}
                    : user
            );
            setUserList(updatedUsers);

            closeBanModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при бане пользователя');
        } finally {
            setLoading(false);
        }
    };

    const handleUnban = async (userId) => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post(route('admin.users.unban'), {
                user_id: userId
            });

            setSuccess(response.data.message);

            const updatedUsers = userList.map(user =>
                user.id === userId
                    ? {...user, banned_until: '1970-01-01 00:00:00'}
                    : user
            );
            setUserList(updatedUsers);

        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при разбане пользователя');
        } finally {
            setLoading(false);
        }
    };

    const isBanned = (user) => {
        if (!user.banned_until) return true;
        const bannedUntil = new Date(user.banned_until);
        const now = new Date();
        return bannedUntil > now;
    };

    // Классы для тем
    const containerClass = theme === 'dark'
        ? 'bg-gray-900 text-white'
        : 'bg-white text-gray-900';

    const cardClass = theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200';

    const buttonBanClass = theme === 'dark'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-red-500 hover:bg-red-600 text-white';

    const buttonUnbanClass = theme === 'dark'
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-green-500 hover:bg-green-600 text-white';

    const modalClass = theme === 'dark'
        ? 'bg-gray-800 text-white'
        : 'bg-white text-gray-900';

    const inputClass = theme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'bg-white border-gray-300 text-gray-900';

    return (
        <AuthenticatedLayout>
            <Head title="Управление пользователями"/>

            <div className="py-4 md:py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                    <div className={`rounded-lg shadow-sm ${containerClass}`}>
                        <div className="p-4 md:p-6">
                            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Управление пользователями</h1>

                            {error && (
                                <div
                                    className={`border rounded mb-4 p-3 ${theme === 'dark' ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-700'}`}>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div
                                    className={`border rounded mb-4 p-3 ${theme === 'dark' ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-100 border-green-400 text-green-700'}`}>
                                    {success}
                                </div>
                            )}

                            {/* Десктопная версия - таблица */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                    <tr className={theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}>
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">Имя</th>
                                        <th className="px-4 py-2">Email</th>
                                        <th className="px-4 py-2">Роль</th>
                                        <th className="px-4 py-2">Статус</th>
                                        <th className="px-4 py-2">Дата регистрации</th>
                                        <th className="px-4 py-2">Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {userList.map((user) => (
                                        <tr key={user.id}
                                            className={theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}>
                                            <td className="border px-4 py-2">{user.id}</td>
                                            <td className="border px-4 py-2">{user.name}</td>
                                            <td className="border px-4 py-2">{user.email}</td>
                                            <td className="border px-4 py-2">{user.roles?.[0]?.name || 'user'}</td>
                                            <td className="border px-4 py-2">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${isBanned(user) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {isBanned(user) ? 'Заблокирован ' + (!user.banned_until ? "навсегда" : "до " + user.banned_until.toLocaleString()): 'Активен'}
                                                    </span>
                                            </td>
                                            <td className="border px-4 py-2">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {isBanned(user) ? (
                                                    <button
                                                        onClick={() => handleUnban(user.id)}
                                                        disabled={loading}
                                                        className={`px-3 py-1 rounded text-sm ${buttonUnbanClass}`}
                                                    >
                                                        Разбанить
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openBanModal(user)}
                                                        disabled={loading}
                                                        className={`px-3 py-1 rounded text-sm ${buttonBanClass}`}
                                                    >
                                                        Забанить
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Мобильная версия - карточки */}
                            <div className="md:hidden space-y-3">
                                {userList.map((user) => (
                                    <div key={user.id} className={`p-4 rounded-lg border ${cardClass}`}>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="text-sm text-gray-500">ID:</div>
                                            <div>{user.id}</div>

                                            <div className="text-sm text-gray-500">Имя:</div>
                                            <div>{user.name}</div>

                                            <div className="text-sm text-gray-500">Email:</div>
                                            <div>{user.email}</div>

                                            <div className="text-sm text-gray-500">Роль:</div>
                                            <div>{user.roles?.[0]?.name || 'user'}</div>

                                            <div className="text-sm text-gray-500">Статус:</div>
                                            <div>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${isBanned(user) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {isBanned(user) ? "Заблокирован " + (!user.banned_until ? "навсегда" : "до " + user.banned_until.toLocaleString()): 'Активен'}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-500">Регистрация:</div>
                                            <div>{new Date(user.created_at).toLocaleDateString()}</div>
                                        </div>

                                        <div className="flex justify-center">
                                            {isBanned(user) ? (
                                                <button
                                                    onClick={() => handleUnban(user.id)}
                                                    disabled={loading}
                                                    className={`px-4 py-2 rounded ${buttonUnbanClass}`}
                                                >
                                                    Разбанить
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openBanModal(user)}
                                                    disabled={loading}
                                                    className={`px-4 py-2 rounded ${buttonBanClass}`}
                                                >
                                                    Забанить
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно бана */}
            {showBanModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`rounded-lg p-6 max-w-md w-full ${modalClass}`}>
                        <h2 className="text-lg font-bold mb-4">
                            Блокировка пользователя
                        </h2>

                        <p className="mb-4">
                            Вы точно хотите заблокировать пользователя <strong>{selectedUser.email}</strong>?
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Срок блокировки:
                            </label>
                            <select
                                value={banDuration}
                                onChange={(e) => setBanDuration(e.target.value)}
                                className={`w-full p-2 border rounded ${inputClass}`}
                            >
                                <option value="1hour">1 час</option>
                                <option value="1day">1 день</option>
                                <option value="1week">1 неделя</option>
                                <option value="1month">1 месяц</option>
                                <option value="permanent">Навсегда</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Причина (опционально):
                            </label>
                            <textarea
                                value={banComment}
                                onChange={(e) => setBanComment(e.target.value)}
                                rows={3}
                                className={`w-full p-2 border rounded ${inputClass}`}
                                placeholder="Укажите причину блокировки"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeBanModal}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => handleBan(banDuration)}
                                disabled={loading}
                                className={`px-4 py-2 rounded ${buttonBanClass}`}
                            >
                                {loading ? 'Загрузка...' : 'Заблокировать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
