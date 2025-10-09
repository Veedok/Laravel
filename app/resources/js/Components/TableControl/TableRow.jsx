import {useState} from 'react';
import {CheckIcon, XMarkIcon} from '@heroicons/react/24/outline';
import TableUserManager from '../TableUserManager.jsx';
export default function TableRow({
                                     table,
                                     theme,
                                     permissions,
                                     onEditStart,
                                     onShare,
                                     onDelete,
                                     onEncrypt,
                                     onDecrypt,
                                     onPasswordChange,
                                     hasPermission
                                 }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(table.name);
    const [editError, setEditError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const handleEditSave = async () => {
        if (editName === table.name) {
            setIsShaking(true);
            setEditError('Необходимо изменить имя таблицы');
            setTimeout(() => setIsShaking(false), 500);
            setTimeout(() => setEditError(''), 5000);
            return;
        }
        try {
            const response = await axios.patch(route('tableEdit'), {
                id: table.id,
                name: editName
            });
            onEditStart(table.id, editName);
            setIsEditing(false);
            setEditError('');
        } catch (error) {
            if (error.response) {
                setEditError(
                    error.response.data.message ||
                    `Ошибка при обновлении (код: ${error.response.status})`
                );
            } else {
                setEditError('Не удалось выполнить обновление. Проверьте соединение.');
            }
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            setTimeout(() => setEditError(''), 5000);
        }
    };
    const handleEditCancel = () => {
        setIsEditing(false);
        setEditName(table.name);
        setEditError('');
    };
    return (
        <div key={table.id} className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {isEditing ? (
                    <div className="flex flex-col flex-grow">
                        <div className={`flex items-center gap-2 flex-grow ${isShaking ? 'animate-shake' : ''}`}>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className={`flex-grow px-3 py-1 border ${
                                    editError ? 'border-red-500' : theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave();
                                    if (e.key === 'Escape') handleEditCancel();
                                }}
                                autoFocus
                            />
                            <button
                                onClick={handleEditSave}
                                className={`p-1 rounded-full ${theme === 'dark' ? 'text-green-400 hover:text-green-300 hover:bg-gray-700' : 'text-green-600 hover:text-green-800 hover:bg-green-100'}`}
                                title="Сохранить"
                            >
                                <CheckIcon className="h-5 w-5"/>
                            </button>
                            <button
                                onClick={handleEditCancel}
                                className={`p-1 rounded-full ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' : 'text-red-600 hover:text-red-800 hover:bg-red-100'}`}
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
                        <div className="flex items-center gap-4 flex-grow">
                            <div
                                className={`font-medium truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                {table.name}
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                theme === 'dark' ? 'text-blue-300 bg-blue-900' : 'text-blue-700 bg-blue-100'
                            }`}>
                                {table.owner}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                table.crypt
                                    ? (theme === 'dark' ? 'text-green-300 bg-green-900' : 'text-green-700 bg-green-100')
                                    : (theme === 'dark' ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-200')
                            }`}>
                                {table.crypt ? '🔒 Зашифрована' : '📄 Открыта'}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {table.permissions?.is_owner && (
                                <>
                                    {!table.crypt ? (
                                        <button
                                            onClick={onEncrypt}
                                            className={`px-3 py-1 rounded-md text-sm ${
                                                theme === 'dark'
                                                    ? 'bg-violet-900 text-violet-300 hover:bg-violet-800'
                                                    : 'bg-violet-100 text-violet-800 hover:bg-violet-200'
                                            }`}
                                        >
                                            🔐 Шифровать
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onDecrypt}
                                            className={`px-3 py-1 rounded-md text-sm ${
                                                theme === 'dark'
                                                    ? 'bg-orange-900 text-orange-300 hover:bg-orange-800'
                                                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                            }`}
                                        >
                                            🔓 Расшифровать
                                        </button>
                                    )}
                                </>
                            )}
                            {table.crypt && (
                                <button
                                    onClick={() => onPasswordChange(table)}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                        theme === 'dark'
                                            ? 'bg-purple-900 text-purple-300 hover:bg-purple-800'
                                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                    }`}
                                >
                                    🔑 Сменить пароль
                                </button>
                            )}
                            {hasPermission(table.permissions, 'editTables') && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                        theme === 'dark'
                                            ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    }`}
                                >
                                    Редактировать
                                </button>
                            )}
                            {hasPermission(table.permissions, 'invite') && (
                                <button
                                    onClick={() => onShare(table)}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                        theme === 'dark'
                                            ? 'bg-green-900 text-green-300 hover:bg-green-800'
                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                    }`}
                                >
                                    Поделиться
                                </button>
                            )}
                            {hasPermission(table.permissions, 'removeTable') && (
                                <button
                                    onClick={() => onDelete(table)}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                        theme === 'dark'
                                            ? 'bg-red-900 text-red-300 hover:bg-red-800'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                >
                                    Удалить
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            {hasPermission(table.permissions, 'changeUsers') && (
                <TableUserManager
                    tableId={table.id}
                    permissions={permissions}
                    theme={theme}
                />
            )}
        </div>
    );
}
