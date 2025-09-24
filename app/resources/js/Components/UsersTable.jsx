const UsersTable = ({ users, loading, theme, onBan, onUnban, isBanned }) => {
    const tableHeaderClass = theme === 'dark'
        ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 border-b border-gray-600'
        : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-b border-gray-200';

    const tableRowClass = theme === 'dark'
        ? 'border-b border-gray-700 hover:bg-gray-800/50 transition-all duration-200'
        : 'border-b border-gray-100 hover:bg-gray-50/80 transition-all duration-200';

    const statusBadgeClass = (banned) => theme === 'dark'
        ? banned
            ? 'bg-red-900/30 text-red-300 border border-red-700/50'
            : 'bg-green-900/30 text-green-300 border border-green-700/50'
        : banned
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200';

    const roleBadgeClass = theme === 'dark'
        ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50'
        : 'bg-blue-50 text-blue-700 border border-blue-200';

    const buttonBanClass = theme === 'dark'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-red-500 hover:bg-red-600 text-white';

    const buttonUnbanClass = theme === 'dark'
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-green-500 hover:bg-green-600 text-white';

    return (
        <div className="rounded-xl overflow-hidden border shadow-sm">
            <table className="min-w-full">
                <thead>
                <tr className={tableHeaderClass}>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Пользователь
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Роль</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Регистрация</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Действия</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => {
                    const banned = isBanned(user);
                    return (
                        <tr key={user.id} className={tableRowClass}>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium">{user.name}</div>
                                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {user.email}
                                        </div>
                                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass}`}>
                                        {user.roles?.[0]?.name || 'user'}
                                    </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col space-y-1">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(banned)}`}>
                                            {banned ? (
                                                <>
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                                                    </svg>
                                                    Заблокирован
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                    </svg>
                                                    Активен
                                                </>
                                            )}
                                        </span>
                                    {banned && user.banned_until && (
                                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                До: {new Date(user.banned_until).toLocaleDateString()}
                                            </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">
                                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                                </div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {new Date(user.created_at).toLocaleTimeString('ru-RU', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {banned ? (
                                    <button
                                        onClick={() => onUnban(user.id)}
                                        disabled={loading}
                                        className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${buttonUnbanClass} shadow-sm hover:shadow-md`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                                        </svg>
                                        Разбанить
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onBan(user)}
                                        disabled={loading}
                                        className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${buttonBanClass} shadow-sm hover:shadow-md`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                                        </svg>
                                        Забанить
                                    </button>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;
