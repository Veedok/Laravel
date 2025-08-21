// components/MobileTabs.jsx
export default function MobileTabs({ activeTab, onTabChange, items, theme }) {
    const options = [
        { value: 'my', label: `Мои таблицы (${items.owned.length})` },
        { value: 'shared', label: `Доступные мне (${items.shared.length})` },
        { value: 'all', label: `Все таблицы (${items.all.length})` }
    ];

    return (
        <select
            className={`mobile-tabs-select ${theme === 'dark' ? 'dark' : ''}`}
            value={activeTab}
            onChange={(e) => onTabChange(e.target.value)}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
