// components/TotalsSummary.jsx
export default function TotalsSummary({ totals, theme, formatCurrency }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${
                theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-green-300'
                    : 'bg-green-50 border-green-100 text-green-800'
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
