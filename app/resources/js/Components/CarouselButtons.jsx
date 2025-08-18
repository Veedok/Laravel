import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import '../../css/CarouselButtons.css';
import { Inertia } from '@inertiajs/inertia';

const CarouselButtons = ({items = {}, onItemClick, onAddItem, theme}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [errors, setErrors] = useState([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const containerRef = useRef(null);
    const itemsRef = useRef([]);
    const inputRef = useRef(null);

    const itemsArray = Object.entries(items).map(([id, data]) => ({id, ...data}));

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            checkScroll();
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [items]);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    const checkScroll = () => {
        if (!containerRef.current) return;

        const {scrollLeft, scrollWidth, clientWidth} = containerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    };

    const calculateScrollAmount = (direction) => {
        if (!containerRef.current || itemsRef.current.length === 0) return 0;

        const containerWidth = containerRef.current.clientWidth;
        const visibleWidth = containerWidth - 160;
        const scrollFraction = 0.75;

        let scrollAmount = 0;
        let targetScroll = 0;
        const currentScroll = containerRef.current.scrollLeft;

        if (direction === 'right') {
            for (let i = 0; i < itemsRef.current.length; i++) {
                const item = itemsRef.current[i];
                const itemRight = item.offsetLeft + item.offsetWidth;
                const containerRight = currentScroll + visibleWidth;

                if (itemRight > containerRight + 5) {
                    targetScroll = item.offsetLeft - 80;
                    scrollAmount = targetScroll - currentScroll;
                    break;
                }
            }
        } else {
            for (let i = itemsRef.current.length - 1; i >= 0; i--) {
                const item = itemsRef.current[i];
                const itemLeft = item.offsetLeft;
                const containerLeft = currentScroll - visibleWidth;

                if (itemLeft < containerLeft - 5) {
                    targetScroll = item.offsetLeft - 80;
                    scrollAmount = targetScroll - currentScroll;
                    break;
                }
            }
        }

        if (scrollAmount === 0) {
            scrollAmount = visibleWidth * scrollFraction * (direction === 'right' ? 1 : -1);
        }

        return scrollAmount;
    };

    const handleScroll = (direction) => {
        if (!containerRef.current) return;

        const scrollAmount = calculateScrollAmount(direction);
        const newScroll = containerRef.current.scrollLeft + scrollAmount;

        containerRef.current.scrollTo({
            left: newScroll,
            behavior: 'smooth'
        });

        setTimeout(checkScroll, 300);
    };

    const handleAddClick = () => {
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setNewItemName('');
        setErrors([]);
    };

    const handleSave = async () => {
        if (!newItemName.trim()) {
            setErrors(['Название не может быть пустым']);
            setShowErrorModal(true);
            return;
        }

        const success = await onAddItem(newItemName);
        if (success) {
            setIsAdding(false);
            setNewItemName('');
        } else {
            setErrors(['Не удалось добавить элемент']);
            setShowErrorModal(true);
        }
    };

    const closeErrorModal = () => {
        setShowErrorModal(false);
        setErrors([]);
    };

    const handleManageTables = () => {
        Inertia.visit('/tableControl');
    };

    return (
        <div className={`carousel-buttons ${isMobile ? 'mobile' : ''} ${theme === 'dark' ? 'dark-theme' : ''}`}>
            {isMobile ? (
                <>
                    <button
                        className={`mobile-menu-toggle ${theme === 'dark' ? 'dark' : ''}`}
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        Мои таблицы ☰
                    </button>

                    {showMobileMenu && (
                        <div className={`mobile-menu ${theme === 'dark' ? 'dark' : ''}`}>
                            {itemsArray.map((item) => (
                                <button
                                    key={item.id}
                                    className={`carousel-item ${item.active ? 'active' : ''} ${theme === 'dark' ? 'dark' : ''}`}
                                    onClick={!item.active ? () => onItemClick(item.id) : undefined}
                                    disabled={item.active}
                                >
                                    {item.name}
                                </button>
                            ))}

                            {isAdding ? (
                                <div className={`add-item-form ${theme === 'dark' ? 'dark' : ''}`}>
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        placeholder="Введите название"
                                        ref={inputRef}
                                        className={theme === 'dark' ? 'dark' : ''}
                                    />
                                    <div className="form-buttons">
                                        <button
                                            className={theme === 'dark' ? 'dark' : ''}
                                            onClick={handleSave}
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            className={theme === 'dark' ? 'dark' : ''}
                                            onClick={handleCancel}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className={`add-button ${theme === 'dark' ? 'dark' : ''}`}
                                    onClick={handleAddClick}
                                >
                                    Добавить
                                </button>
                            )}

                            <button
                                className={`manage-tables-button ${theme === 'dark' ? 'dark' : ''}`}
                                onClick={handleManageTables}
                            >
                                Управление таблицами
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="carousel-container-wrapper">
                        {(canScrollRight || canScrollLeft) && (
                            <button
                                className={`scroll-button left ${canScrollLeft ? '' : 'disabled'} ${theme === 'dark' ? 'dark' : ''}`}
                                onClick={() => handleScroll('left')}
                                disabled={!canScrollLeft}
                            >
                                &lt;&lt;
                            </button>)}

                        <div
                            className={`carousel-container ${theme === 'dark' ? 'dark' : ''}`}
                            ref={containerRef}
                            onScroll={checkScroll}
                        >
                            <div className="carousel-content">
                                {itemsArray.map((item, index) => (
                                    <button
                                        key={item.id}
                                        ref={el => itemsRef.current[index] = el}
                                        className={`carousel-item ${item.active ? 'active' : ''} ${theme === 'dark' ? 'dark' : ''}`}
                                        onClick={!item.active ? () => onItemClick(item.id) : undefined}
                                        disabled={item.active}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {(canScrollRight || canScrollLeft) && (
                            <button
                                className={`scroll-button right ${canScrollRight ? '' : 'disabled'} ${theme === 'dark' ? 'dark' : ''}`}
                                onClick={() => handleScroll('right')}
                                disabled={!canScrollRight}
                            >
                                &gt;&gt;
                            </button>)}
                    </div>

                    <div className={`add-button-container ${theme === 'dark' ? 'dark' : ''}`}>
                        {isAdding ? (
                            <div className={`add-item-form ${theme === 'dark' ? 'dark' : ''}`}>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Введите название"
                                    ref={inputRef}
                                    className={theme === 'dark' ? 'dark' : ''}
                                />
                                <div className="form-buttons">
                                    <button
                                        className={theme === 'dark' ? 'dark' : ''}
                                        onClick={handleSave}
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        className={theme === 'dark' ? 'dark' : ''}
                                        onClick={handleCancel}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                className={`add-button ${theme === 'dark' ? 'dark' : ''}`}
                                onClick={handleAddClick}
                            >
                                Добавить
                            </button>
                        )}
                    </div>

                    {showErrorModal && (
                        <div className={`error-modal ${theme === 'dark' ? 'dark' : ''}`}>
                            <div className={`error-modal-content ${theme === 'dark' ? 'dark' : ''}`}>
                                <h3>Ошибка</h3>
                                <ul>
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                                <button
                                    className={theme === 'dark' ? 'dark' : ''}
                                    onClick={closeErrorModal}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CarouselButtons;
