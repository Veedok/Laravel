import { useState } from 'react';

const UsersMobileCards = ({ users, loading, theme, onBan, onUnban, isBanned }) => {
    const [expandedCards, setExpandedCards] = useState(new Set());

    const toggleCard = (userId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
        }
        setExpandedCards(newExpanded);
    };

    const cardHeaderClass = theme === 'dark'
        ? 'bg-gray-750 hover:bg-gray-700'
        : 'bg-gray-50 hover:bg-gray-100';

    const statusBadgeMobileClass = (banned) => theme === 'dark'
        ? banned
            ? 'bg-red-900/40 text-red-300 border border-red-600/50'
            : 'bg-green-900/40 text-green-300 border border-green-600/50'
        : banned
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-green-100 text-green-800 border border-green-200';

    const roleBadgeMobileClass = theme === 'dark'
        ? 'bg-blue-900/40 text-blue-300 border border-blue-600/50'
        : 'bg-blue-100 text-blue-800 border border-blue-200';

    const buttonBanClass = theme === 'dark'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-red-500 hover:bg-red-600 text-white';

    const buttonUnbanClass = theme === 'dark'
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-green-500 hover:bg-green-600 text-white';

    return (
        <div className="space-y-3">
            {users.map((user) => {
                const isExpanded = expandedCards.has(user.id);
                const banned = isBanned(user);

                return (
                    <div key={user.id} className={`rounded-xl border shadow-sm transition-all duration-300 overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}>

                        {/* Заголовок карточки */}
                        <div
                            className={`p-4 cursor-pointer transition-all duration-200 ${cardHeaderClass}`}
                            onClick={() => toggleCard(user.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {user.email}
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeMobileClass(banned)}`}>
                                                {banned ? 'Заблокирован' : 'Активен'}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeMobileClass}`}>
                                                {user.roles?.[0]?.name || 'user'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Содержимое карточки */}
                        <div className={`transition-all duration-300 overflow-hidden ${
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-3">
                                        <div>
                                            <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Имя пользователя
                                            </div>
                                            <div className="text-sm font-medium">{user.name}</div>
                                        </div>
                                        <div>
                                            <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                ID пользователя
                                            </div>
                                            <div className="text-sm font-mono">#{user.id}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Дата регистрации
                                            </div>
                                            <div className="text-sm">{new Date(user.created_at).toLocaleDateString('ru-RU')}</div>
                                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {new Date(user.created_at).toLocaleTimeString('ru-RU', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        {banned && user.banned_until && (
                                            <div>
                                                <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Блокировка до
                                                </div>
                                                <div className="text-sm">
                                                    {new Date(user.banned_until).toLocaleDateString('ru-RU')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center pt-2">
                                    {banned ? (
                                        <button
                                            onClick={() => onUnban(user.id)}
                                            disabled={loading}
                                            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${buttonUnbanClass} shadow-sm hover:shadow-md flex-1 justify-center max-w-xs`}
                                        >
                                            Разбанить
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onBan(user)}
                                            disabled={loading}
                                            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${buttonBanClass} shadow-sm hover:shadow-md flex-1 justify-center max-w-xs`}
                                        >
                                            Забанить
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UsersMobileCards;
