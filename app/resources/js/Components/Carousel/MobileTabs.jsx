// components/MobileTabs.jsx
export default function MobileTabs({ activeTab, onTabChange, items, theme }) {
    const tabs = [
        { value: 'my', label: 'Мои', count: items.owned.length },
        { value: 'shared', label: 'Доступные', count: items.shared.length },
        { value: 'all', label: 'Все', count: items.all.length }
    ];

    return (
        <div className="mobile-tabs-container">
            {tabs.map(tab => (
                <button
                    key={tab.value}
                    className={`mobile-tab ${activeTab === tab.value ? 'active' : ''} ${theme === 'dark' ? 'dark' : ''}`}
                    onClick={() => onTabChange(tab.value)}
                >
                    {tab.label} ({tab.count})
                </button>
            ))}
        </div>
    );
}
