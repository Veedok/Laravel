// components/TotalsSummary.jsx
export default function TotalsSummary({ totals, theme, formatCurrency, compact }) {
    if (compact) {
        return (
            <div className={`grid grid-cols-2 gap-2 p-3 rounded-lg text-sm ${
                theme === 'dark'
                    ? ''
                    : 'shadow-sm'
            }`}>
                <div className={`text-center p-2 rounded ${
                    theme === 'dark' ? 'bg-green-800/30 text-green-300' : 'bg-green-100 text-green-800'
                }`}>
                    <div className="font-semibold">Доходы</div>
                    <div className="text-lg font-bold">{formatCurrency(totals.income)}</div>
                </div>
                <div className={`text-center p-2 rounded ${
                    theme === 'dark' ? 'bg-red-800/30 text-red-300' : 'bg-red-100 text-red-800'
                }`}>
                    <div className="font-semibold">Расходы</div>
                    <div className="text-lg font-bold">{formatCurrency(totals.expense)}</div>
                </div>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${
                theme === 'dark'
                    ? 'text-green-300'
                    : 'text-green-800'
            }`}>
                <h3 className="text-sm font-medium">Суммарный приход</h3>
                <p className="text-2xl font-semibold">{formatCurrency(totals.income)}</p>
            </div>

            <div className={`p-4 rounded-lg border ${
                theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-red-300'
                    : 'bg-red-50 border-red-100 text-red-800'
            }`}>
                <h3 className="text-sm font-medium">Суммарный расход</h3>
                <p className="text-2xl font-semibold">{formatCurrency(totals.expense)}</p>
            </div>
        </div>
    );
}
