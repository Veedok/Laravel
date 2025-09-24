import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import UsersMobileCards from "@/Components/UsersMobileCards.jsx";
import BanModal from "@/Components/BanModal.jsx";
import UsersTable from "@/Components/UsersTable.jsx";

export default function UsersIndex({ users }) {
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
                    ? { ...user, banned_until: expiredAt }
                    : user
            );
            setUserList(updatedUsers);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors || 'Ошибка при бане пользователя');
        } finally {
            setLoading(false);
            closeBanModal();
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
                    ? { ...user, banned_until: '1970-01-01 00:00:00' }
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

    // Пропсы для дочерних компонентов
    const commonProps = {
        users: userList,
        loading,
        theme,
        onBan: openBanModal,
        onUnban: handleUnban,
        isBanned
    };

    return (
        <AuthenticatedLayout>
            <Head title="Управление пользователями" />

            <div className="py-4 md:py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                    <div className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                        <div className="p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                    Управление пользователями
                                </h1>
                                <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                                    Всего пользователей: <span className="font-semibold text-blue-500">{userList.length}</span>
                                </div>
                            </div>

                            {/* Уведомления */}
                            <Notification
                                type="error"
                                message={error}
                                theme={theme}
                                onClose={() => setError('')}
                            />
                            <Notification
                                type="success"
                                message={success}
                                theme={theme}
                                onClose={() => setSuccess('')}
                            />

                            {/* Десктопная таблица */}
                            <div className="hidden md:block">
                                <UsersTable {...commonProps} />
                            </div>

                            {/* Мобильные карточки */}
                            <div className="md:hidden">
                                <UsersMobileCards {...commonProps} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно бана */}
            <BanModal
                isOpen={showBanModal}
                user={selectedUser}
                theme={theme}
                loading={loading}
                banDuration={banDuration}
                banComment={banComment}
                onDurationChange={setBanDuration}
                onCommentChange={setBanComment}
                onConfirm={handleBan}
                onCancel={closeBanModal}
            />
        </AuthenticatedLayout>
    );
}

// Компонент уведомления
const Notification = ({ type, message, theme, onClose }) => {
    if (!message) return null;

    const config = {
        error: {
            bg: theme === 'dark' ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-400',
            text: theme === 'dark' ? 'text-red-200' : 'text-red-700',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            )
        },
        success: {
            bg: theme === 'dark' ? 'bg-green-900/20 border-green-500' : 'bg-green-50 border-green-400',
            text: theme === 'dark' ? 'text-green-200' : 'text-green-700',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            )
        }
    };

    const { bg, text, icon } = config[type];

    return (
        <div className={`rounded-lg mb-6 p-4 border-l-4 ${bg} ${text}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {icon}
                    {message}
                </div>
                <button
                    onClick={onClose}
                    className="ml-4 hover:opacity-70 transition-opacity"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
