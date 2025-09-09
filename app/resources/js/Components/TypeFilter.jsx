import { CheckIcon } from '@heroicons/react/24/outline';

const TypeFilter = ({
                        theme,
                        selectedType,
                        onTypeChange,
                        incomeTotal,
                        expenseTotal,
                        formatCurrency = (value) => value.toFixed(2)
                    }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
            <div
                className={`p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] relative ${
                    theme === 'dark'
                        ? selectedType === 'income'
                            ? 'bg-green-900/50 border-green-600 text-green-200'
                            : 'bg-green-900/20 border-green-800 text-green-400 hover:bg-green-900/30'
                        : selectedType === 'income'
                            ? 'bg-green-100 border-green-300 text-green-800'
                            : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                } border-2`}
                onClick={() => onTypeChange('income')}
            >
                {selectedType === 'income' && (
                    <div className="absolute top-1 md:top-2 right-1 md:right-2">
                        <div className="bg-green-500 rounded-full p-1">
                            <CheckIcon className="w-2 h-2 md:w-3 md:h-3 text-white" />
                        </div>
                    </div>
                )}
                <div className="text-center">
                    <div className="text-xs md:text-sm font-medium mb-1">Доходы</div>
                    <div className="text-lg md:text-2xl font-bold">+{formatCurrency(incomeTotal)}</div>
                </div>
            </div>
            <div
                className={`p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] relative ${
                    theme === 'dark'
                        ? selectedType === 'expense'
                            ? 'bg-red-900/50 border-red-600 text-red-200'
                            : 'bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/30'
                        : selectedType === 'expense'
                            ? 'bg-red-100 border-red-300 text-red-800'
                            : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                } border-2`}
                onClick={() => onTypeChange('expense')}
            >
                {selectedType === 'expense' && (
                    <div className="absolute top-1 md:top-2 right-1 md:right-2">
                        <div className="bg-red-500 rounded-full p-1">
                            <CheckIcon className="w-2 h-2 md:w-3 md:h-3 text-white" />
                        </div>
                    </div>
                )}
                <div className="text-center">
                    <div className="text-xs md:text-sm font-medium mb-1">Расходы</div>
                    <div className="text-lg md:text-2xl font-bold">-{formatCurrency(expenseTotal)}</div>
                </div>
            </div>
        </div>
    );
};

export default TypeFilter;
