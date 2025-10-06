// components/TransactionFormModal.jsx
import { useState, useEffect, useRef } from 'react';

export default function TransactionFormModal({
                                                 isOpen,
                                                 onClose,
                                                 onSubmit,
                                                 formData,
                                                 onInputChange,
                                                 errorMessage,
                                                 theme,
                                                 editingId,
                                                 userTags = [],
                                                 onAddNewTag,
                                                 isProcessing
                                             }) {
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const tagInputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Инициализируем теги при открытии модального окна или изменении formData.tags
    useEffect(() => {
        if (formData.tags && typeof formData.tags === 'string') {
            setTags(formData.tags.split(' ').filter(tag => tag.trim() !== ''));
        } else if (Array.isArray(formData.tags)) {
            setTags(formData.tags.filter(tag => tag.trim() !== ''));
        } else {
            setTags([]);
        }
        setTagInput('');
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
    }, [formData.tags, isOpen]);

    // Обновляем подсказки при изменении ввода
    useEffect(() => {
        if (tagInput.trim() && userTags.length > 0) {
            const input = tagInput.trim().toLowerCase();
            const filteredSuggestions = userTags
                .filter(tag =>
                    tag.toLowerCase().includes(input) &&
                    !tags.includes(tag)
                )
                .slice(0, 3); // Ограничиваем количество подсказок до 3

            setSuggestions(filteredSuggestions);
            setShowSuggestions(filteredSuggestions.length > 0);
            setActiveSuggestionIndex(-1);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [tagInput, userTags, tags]);

    // Закрываем подсказки при клике вне области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                tagInputRef.current && !tagInputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const handleAddTag = (tag = null) => {
        const newTag = tag ? tag : tagInput.trim().toLowerCase();
        if (newTag && !tags.includes(newTag)) {
            const updatedTags = [...tags, newTag];
            setTags(updatedTags);
            onInputChange('tags', updatedTags.join(' '));
            setTagInput('');
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
            if (!userTags.includes(newTag)) {
                onAddNewTag(newTag);
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        const updatedTags = tags.filter(tag => tag !== tagToRemove);
        setTags(updatedTags);
        onInputChange('tags', updatedTags.join(' '));
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                handleAddTag(suggestions[activeSuggestionIndex]);
            } else if (tagInput.trim()) {
                handleAddTag();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
        } else if (e.key === ' ' && tagInput.trim()) {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleAddTag(suggestion);
    };

    const handleInputChange = (e) => {
        setTagInput(e.target.value);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg shadow-xl w-full max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-6">
                    <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                        {editingId ? 'Редактировать запись' : 'Добавить запись'}
                    </h2>

                    {errorMessage && (
                        <div className={`mb-4 p-3 rounded-md ${
                            theme === 'dark'
                                ? 'bg-red-900 text-red-100'
                                : 'bg-red-100 text-red-700'
                        }`}>
                            <ul className="list-disc pl-5">
                                {errorMessage.split('\n').map((line, index) => (
                                    <li key={index}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Название
                            </label>
                            <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                }`}
                                value={formData.title}
                                onChange={(e) => onInputChange('title', e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Тип операции
                            </label>
                            <select
                                className={`w-full px-3 py-2 border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                }`}
                                value={formData.changeBalance}
                                onChange={(e) => onInputChange('changeBalance', e.target.value === 'true')}
                                required
                            >
                                <option value={true}>Приход</option>
                                <option value={false}>Расход</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Сумма
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className={`w-full px-3 py-2 border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                }`}
                                value={formData.sum}
                                onChange={(e) => onInputChange('sum', e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Дата
                            </label>
                            <input
                                type="date"
                                className={`w-full px-3 py-2 border rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                }`}
                                value={formData.date}
                                onChange={(e) => onInputChange('date', e.target.value)}
                                required
                            />
                        </div>

                        {/* ОБНОВЛЕННОЕ ПОЛЕ: ТЕГИ С АВТОДОПОЛНЕНИЕМ */}
                        <div className="mb-4 relative">
                            <label className={`block text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Теги
                            </label>

                            {/* Контейнер для отображения добавленных тегов */}
                            {tags.length > 0 ? (
                                <div className={`flex flex-wrap gap-2 mb-2 p-2 rounded-md ${
                                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                                theme === 'dark'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className={`ml-2 rounded-full ${
                                                    theme === 'dark'
                                                        ? 'hover:bg-blue-700'
                                                        : 'hover:bg-blue-200'
                                                }`}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className={`mb-2 p-2 rounded-md text-center ${
                                    theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    Тегов нет
                                </div>
                            )}

                            {/* Поле для ввода нового тега с автодополнением */}
                            <div className="relative">
                                <input
                                    ref={tagInputRef}
                                    type="text"
                                    placeholder="Введите тег..."
                                    className={`w-full px-3 py-2 border rounded-md ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'border-gray-300 placeholder-gray-500'
                                    }`}
                                    value={tagInput}
                                    onChange={handleInputChange}
                                    onKeyDown={handleTagInputKeyDown}
                                    onFocus={() => setShowSuggestions(suggestions.length > 0)}
                                />

                                {/* Выпадающий список подсказок */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div
                                        ref={suggestionsRef}
                                        className={`absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border shadow-lg z-50 ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        {suggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                className={`px-4 py-2 cursor-pointer ${
                                                    index === activeSuggestionIndex
                                                        ? theme === 'dark'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-blue-100 text-blue-800'
                                                        : theme === 'dark'
                                                            ? 'hover:bg-gray-600 text-gray-100'
                                                            : 'hover:bg-gray-100 text-gray-900'
                                                }`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                onMouseEnter={() => setActiveSuggestionIndex(index)}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className={`text-xs mt-1 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                Вводите теги по одному. Нажмите Enter для добавления.
                                Используйте стрелки ↑↓ для навигации по подсказкам.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 rounded-md ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-colors ${
                                    theme === 'dark' ? 'bg-blue-700' : 'bg-blue-600'
                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? 'Сохранение...' : (editingId ? 'Обновить' : 'Сохранить')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
