// components/DesktopTableRow.jsx
export default function DesktopTableRow({
                                            item,
                                            theme,
                                            formatCurrency,
                                            onEdit,
                                            onDelete,
                                            permissions,
                                            isLocked = false
                                        }) {

    const displayTitle = isLocked ? '••••••••' : item.title;
    const displaySum = isLocked ? '•••••' : formatCurrency(item.sum);

    return (
        <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {displayTitle}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.changeBalance
                        ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                        : theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                }`}>
                    {item.changeBalance ? 'Приход' : 'Расход'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">{displaySum}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">{item.date}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex space-x-2 action_row">
                    {((permissions.is_owner || permissions.permissions.includes('editTransactions')) && !isLocked ) && (
                        <button
                            onClick={() => !isLocked && onEdit(item)}
                            className={`${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-900'}`}
                            title={isLocked ? "Данные заблокированы" : "Редактировать"}
                            disabled={isLocked}
                        >
                            ✏️
                        </button>
                    )}
                    {((permissions.is_owner || permissions.permissions.includes('deleteTransactions')) && !isLocked) && (
                        <button
                            onClick={() => !isLocked && onDelete(item.id)}
                            className={`${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                            title={isLocked ? "Данные заблокированы" : "Удалить"}
                            disabled={isLocked}
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
