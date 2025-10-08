export const formatDateForInput = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    if (dateString.includes('.')) {
        const [day, month, year] = dateString.split('.');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString;
};

export const formatDateForDisplay = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('ru-RU');
    if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    }
    return dateString;
};
