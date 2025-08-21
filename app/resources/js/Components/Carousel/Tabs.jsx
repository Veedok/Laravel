// components/Tabs.jsx
export default function Tabs({ activeTab, onTabChange, items, theme }) {
    const tabs = [
        { id: 'my', label: `Мои таблицы (${items.owned.length})` },
        { id: 'shared', label: `Доступные мне (${items.shared.length})` },
        { id: 'all', label: `Все таблицы (${items.all.length})` }
    ];

    return (
        <ul className={`nav nav-tabs ${theme === 'dark' ? 'dark' : ''}`}>
            {tabs.map(tab => (
                <li key={tab.id} className="nav-item">
                    <button
                        className={`nav-link ${activeTab === tab.id ? 'active' : ''} ${theme === 'dark' ? 'dark' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                </li>
            ))}
        </ul>
    );
}
