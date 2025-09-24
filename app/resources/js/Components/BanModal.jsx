const BanModal = ({
                      isOpen,
                      user,
                      theme,
                      loading,
                      banDuration,
                      banComment,
                      onDurationChange,
                      onCommentChange,
                      onConfirm,
                      onCancel
                  }) => {
    if (!isOpen || !user) return null;

    const modalClass = theme === 'dark'
        ? 'bg-gray-800 text-white'
        : 'bg-white text-gray-900';

    const inputClass = theme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'bg-white border-gray-300 text-gray-900';

    const buttonBanClass = theme === 'dark'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-red-500 hover:bg-red-600 text-white';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg p-6 max-w-md w-full ${modalClass}`}>
                <h2 className="text-lg font-bold mb-4">
                    Блокировка пользователя
                </h2>

                <p className="mb-4">
                    Вы точно хотите заблокировать пользователя <strong>{user.email}</strong>?
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Срок блокировки:
                    </label>
                    <select
                        value={banDuration}
                        onChange={(e) => onDurationChange(e.target.value)}
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
                        onChange={(e) => onCommentChange(e.target.value)}
                        rows={3}
                        className={`w-full p-2 border rounded ${inputClass}`}
                        placeholder="Укажите причину блокировки"
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={() => onConfirm(banDuration)}
                        disabled={loading}
                        className={`px-4 py-2 rounded ${buttonBanClass}`}
                    >
                        {loading ? 'Загрузка...' : 'Заблокировать'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BanModal;
