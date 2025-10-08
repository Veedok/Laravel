// components/MobileTransactionCard.jsx
import { useState, useRef, useEffect } from 'react';

export default function MobileTransactionCard({
                                                  item,
                                                  theme,
                                                  formatCurrency,
                                                  onEdit,
                                                  onDelete,
                                                  permissions,
                                                  isLocked = false
                                              }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const contentRef = useRef(null);

    const toggleExpand = () => {
        if (!isLocked) {
            setIsExpanded(!isExpanded);
        }
    };

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [item]);

    return (
        <div className={`rounded-lg border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
        } ${isLocked ? 'opacity-70' : ''}`}>
            {/* Свернутое состояние */}
            <div
                className="p-4 cursor-pointer"
                onClick={toggleExpand}
            >
                <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.changeBalance
                            ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                            : theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                        {item.changeBalance ? 'Приход' : 'Расход'}
                    </span>

                    <span className="font-semibold text-lg">
                        {formatCurrency(item.sum)}
                    </span>
                </div>
            </div>

            {/* Развернутое состояние с анимацией */}
            <div
                ref={contentRef}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    height: isExpanded ? contentHeight : 0,
                    opacity: isExpanded ? 1 : 0
                }}
            >
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.changeBalance
                                ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                                : theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
                        }`}>
                            {item.changeBalance ? 'Приход' : 'Расход'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                            <span className="text-gray-500">Сумма:</span>
                            <p className="font-medium">{formatCurrency(item.sum)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Дата:</span>
                            <p className="font-medium">{item.date}</p>
                        </div>
                    </div>

                    {(permissions.is_owner || permissions.permissions.includes('editTransactions') || permissions.permissions.includes('deleteTransactions')) && (
                        <div className="flex space-x-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            {(permissions.is_owner || permissions.permissions.includes('editTransactions')) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isLocked) onEdit(item);
                                    }}
                                    className={`flex-1 py-2 px-3 rounded-md text-center ${
                                        theme === 'dark'
                                            ? 'bg-indigo-700 text-white hover:bg-indigo-600'
                                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLocked}
                                >
                                    ✏️ Изменить
                                </button>
                            )}
                            {(permissions.is_owner || permissions.permissions.includes('deleteTransactions')) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isLocked) onDelete(item.id);
                                    }}
                                    className={`flex-1 py-2 px-3 rounded-md text-center ${
                                        theme === 'dark'
                                            ? 'bg-red-700 text-white hover:bg-red-600'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLocked}
                                >
                                    🗑️ Удалить
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
