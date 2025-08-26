// components/TotalsSummary.jsx
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TotalsSummary({
                                          totals,
                                          theme,
                                          formatCurrency,
                                          compact,
                                          filterType,
                                          onIncomeClick,
                                          onExpenseClick,
                                          onClearFilter
                                      }) {
    if (compact) {
        return (
            <div className={`grid grid-cols-2 gap-2 p-3 rounded-lg text-sm ${
                theme === 'dark' ? '' : 'shadow-sm'
            }`}>
                <div
                    className={`text-center p-2 rounded relative cursor-pointer transition-all hover:opacity-90 ${
                        theme === 'dark'
                            ? 'bg-green-800/30 text-green-300'
                            : 'bg-green-100 text-green-800'
                    } ${filterType === 'income' ? 'ring-2 ring-green-400' : ''}`}
                    onClick={filterType === 'income' ? onClearFilter : onIncomeClick}
                >
                    {filterType === 'income' && (
                        <div className="absolute -top-1 -right-1">
                            <div className="bg-green-500 rounded-full p-1">
                                <XMarkIcon className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    )}
                    <div className="font-semibold">Доходы</div>
                    <div className="text-lg font-bold">{formatCurrency(totals.income)}</div>
                </div>
                <div
                    className={`text-center p-2 rounded relative cursor-pointer transition-all hover:opacity-90 ${
                        theme === 'dark'
                            ? 'bg-red-800/30 text-red-300'
                            : 'bg-red-100 text-red-800'
                    } ${filterType === 'expense' ? 'ring-2 ring-red-400' : ''}`}
                    onClick={filterType === 'expense' ? onClearFilter : onExpenseClick}
                >
                    {filterType === 'expense' && (
                        <div className="absolute -top-1 -right-1">
                            <div className="bg-red-500 rounded-full p-1">
                                <XMarkIcon className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    )}
                    <div className="font-semibold">Расходы</div>
                    <div className="text-lg font-bold">{formatCurrency(totals.expense)}</div>
                </div>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
                className={`p-4 rounded-lg cursor-pointer transition-all hover:opacity-90 ${
                    theme === 'dark'
                        ? 'text-green-300 bg-green-900/20'
                        : 'text-green-800 bg-green-50'
                } ${filterType === 'income' ? 'ring-2 ring-green-400' : ''}`}
                onClick={filterType === 'income' ? onClearFilter : onIncomeClick}
            >
                {filterType === 'income' && (
                    <div className="absolute top-2 right-2">
                        <div className="bg-green-500 rounded-full p-1">
                            <XMarkIcon className="w-3 h-3 text-white" />
                        </div>
                    </div>
                )}
                <h3 className="text-sm font-medium">Суммарный приход</h3>
                <p className="text-2xl font-semibold">{formatCurrency(totals.income)}</p>
            </div>
            <div
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:opacity-90 ${
                    theme === 'dark'
                        ? 'bg-red-900/20 border-red-800 text-red-300'
                        : 'bg-red-50 border-red-100 text-red-800'
                } ${filterType === 'expense' ? 'ring-2 ring-red-400' : ''}`}
                onClick={filterType === 'expense' ? onClearFilter : onExpenseClick}
            >
                {filterType === 'expense' && (
                    <div className="absolute top-2 right-2">
                        <div className="bg-red-500 rounded-full p-1">
                            <XMarkIcon className="w-3 h-3 text-white" />
                        </div>
                    </div>
                )}
                <h3 className="text-sm font-medium">Суммарный расход</h3>
                <p className="text-2xl font-semibold">{formatCurrency(totals.expense)}</p>
            </div>
        </div>
    );
}
