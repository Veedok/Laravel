// components/TransactionFormModal.jsx
export default function TransactionFormModal({
                                                 isOpen,
                                                 onClose,
                                                 onSubmit,
                                                 formData,
                                                 onInputChange,
                                                 errorMessage,
                                                 theme,
                                                 editingId
                                             }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg shadow-xl w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-6">
                    <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                        {editingId ? 'Редактировать запись' : 'Добавить запись'}
                    </h2>

                    {errorMessage && (
                        <div className={`mb-4 p-3 rounded-md ${
                            theme === 'dark'
                                ? 'bg-red-900 text-red-100'
                                : 'bg-red-100 text-red-700'
                        }`}>
                            <ul className="list-disc pl-5">
                                {errorMessage.split('\n').map((line, index) => (
                                    <li key={index}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Название
                            </label>
                            <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                }`}
                                value={formData.title}
                                onChange={(e) => onInputChange('title', e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Тип операции
                            </label>
                            <select
                                className={`w-full px-3 py-2 border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                }`}
                                value={formData.changeBalance}
                                onChange={(e) => onInputChange('changeBalance', e.target.value === 'true')}
                                required
                            >
                                <option value={true}>Приход</option>
                                <option value={false}>Расход</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Сумма
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className={`w-full px-3 py-2 border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                }`}
                                value={formData.sum}
                                onChange={(e) => onInputChange('sum', e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Дата
                            </label>
                            <input
                                type="date"
                                className={`w-full px-3 py-2 border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                }`}
                                value={formData.date}
                                onChange={(e) => onInputChange('date', e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-colors ${
                                    theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'
                                }`}
                            >
                                {editingId ? 'Обновить' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
