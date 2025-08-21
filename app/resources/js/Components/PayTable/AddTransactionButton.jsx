export default function AddTransactionButton({ onClick, theme, permissions }) {
    if (!(permissions.is_owner || permissions.permissions.includes('addTransaction'))) {
        return null;
    }

    return (
        <div className="flex justify-end">
            <button
                onClick={onClick}
                className={`px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors ${
                    theme === 'dark'
                        ? 'bg-blue-700 text-white hover:bg-blue-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                + Добавить запись
            </button>
        </div>
    );
}
