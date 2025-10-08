export const getUserCardClasses = (isCurrentUser, theme) => {
    if (isCurrentUser) {
        return {
            card: theme === 'dark'
                ? 'bg-blue-900/30 border-blue-700'
                : 'bg-blue-50 border-blue-200',
            ring: 'ring-2 ring-blue-500',
            badge: 'bg-blue-500 text-white'
        };
    } else {
        return {
            card: theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-50 border-gray-200',
            ring: '',
            badge: 'bg-gray-500 text-white'
        };
    }
};
export const getThemeClasses = (theme) => ({
    modalOverlay: theme === 'dark'
        ? 'bg-black bg-opacity-70'
        : 'bg-black bg-opacity-50',
    modalContent: theme === 'dark'
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200 text-gray-900',
    buttonPrimary: theme === 'dark'
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-blue-500 hover:bg-blue-600 text-white',
    buttonSecondary: theme === 'dark'
        ? 'bg-gray-600 hover:bg-gray-700 text-white'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    input: theme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    currentUserInput: theme === 'dark'
        ? 'border-blue-500'
        : 'border-blue-500'
});
