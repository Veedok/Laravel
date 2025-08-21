import { useRef, useEffect } from 'react';

export default function AddItemForm({
                                        isAdding,
                                        newItemName,
                                        onNameChange,
                                        onSave,
                                        onCancel,
                                        theme,
                                        placeholder = "Введите название"
                                    }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    if (!isAdding) return null;

    return (
        <div className={`add-item-form ${theme === 'dark' ? 'dark' : ''}`}>
            <input
                type="text"
                value={newItemName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder={placeholder}
                ref={inputRef}
                className={theme === 'dark' ? 'dark' : ''}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onSave();
                    if (e.key === 'Escape') onCancel();
                }}
            />
            <div className="form-buttons">
                <button
                    className={theme === 'dark' ? 'dark' : ''}
                    onClick={onSave}
                >
                    Сохранить
                </button>
                <button
                    className={theme === 'dark' ? 'dark' : ''}
                    onClick={onCancel}
                >
                    Отмена
                </button>
            </div>
        </div>
    );
}
