// CarouselButtons.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Inertia } from '@inertiajs/inertia';
import '../../css/CarouselButtons.css';
import useMobileDetection from "@/Components/Carousel/useMobileDetection.jsx";
import useCarouselScroll from "@/Components/Carousel/useCarouselScroll.jsx";
import Tabs from "@/Components/Carousel/Tabs.jsx";
import MobileTabs from "@/Components/Carousel/MobileTabs.jsx";
import CarouselItem from "@/Components/Carousel/CarouselItem.jsx";
import AddItemForm from "@/Components/Carousel/AddItemForm.jsx";
import ErrorModal from "@/Components/Carousel/ErrorModal.jsx";
import ToastNotification from "@/Components/common/ToastNotification.jsx";

const CarouselButtons = ({ items = {}, onItemClick, onAddItem, theme, activeTableId }) => {
    const isMobile = useMobileDetection();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [errors, setErrors] = useState([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('my');

    const {
        containerRef,
        itemsRef,
        canScrollLeft,
        canScrollRight,
        checkScroll,
        handleScroll
    } = useCarouselScroll();

    const itemsArray = Object.entries(items).map(([id, data]) => ({
        id,
        ...data,
        active: id === activeTableId
    }));

    const ownedItems = itemsArray.filter(item => item.owner);
    const sharedItems = itemsArray.filter(item => !item.owner);

    const getCurrentItems = () => {
        switch (activeTab) {
            case 'my': return ownedItems;
            case 'shared': return sharedItems;
            case 'all': return itemsArray;
            default: return ownedItems;
        }
    };

    const currentItems = getCurrentItems();

    useEffect(() => {
        checkScroll();
    }, [items, activeTableId, activeTab, checkScroll]);

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

        try {
            const success = await onAddItem(newItemName);
            if (success) {
                setIsAdding(false);
                setNewItemName('');
                setActiveTab('my');
                setSuccessMessage('Таблица успешно добавлена');
            } else {
                setErrors(['Не удалось добавить элемент']);
                setShowErrorModal(true);
            }
        } catch (error) {
            setErrors(['Произошла ошибка при добавлении']);
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

    const handleItemClick = (itemId) => {
        if (onItemClick && itemId !== activeTableId) {
            onItemClick(itemId);
        }
    };

    const renderDesktopView = () => (
        <>
            <Tabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                items={{
                    owned: ownedItems,
                    shared: sharedItems,
                    all: itemsArray
                }}
                theme={theme}
            />

            <div className="desktop-content-wrapper">
                <div className="carousel-container-wrapper">
                    {(canScrollRight || canScrollLeft) && (
                        <button
                            className={`scroll-button left ${canScrollLeft ? '' : 'disabled'} ${theme === 'dark' ? 'dark' : ''}`}
                            onClick={() => handleScroll('left')}
                            disabled={!canScrollLeft}
                        >
                            &lt;&lt;
                        </button>
                    )}

                    <div
                        className={`carousel-container ${theme === 'dark' ? 'dark' : ''}`}
                        ref={containerRef}
                        onScroll={checkScroll}
                    >
                        <div className="carousel-content">
                            {currentItems.map((item, index) => (
                                <CarouselItem
                                    key={item.id}
                                    item={{
                                        ...item,
                                        ref: el => itemsRef.current[index] = el
                                    }}
                                    isActive={item.active}
                                    onClick={handleItemClick}
                                    theme={theme}
                                />
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
                        </button>
                    )}
                </div>

                {activeTab === 'my' && (
                    <div className={`add-button-container ${theme === 'dark' ? 'dark' : ''}`}>
                        <AddItemForm
                            isAdding={isAdding}
                            newItemName={newItemName}
                            onNameChange={setNewItemName}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            theme={theme}
                        />

                        {!isAdding && (
                            <button
                                className={`add-button ${theme === 'dark' ? 'dark' : ''}`}
                                onClick={handleAddClick}
                            >
                                Добавить
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );

    const renderMobileView = () => (
        <>
            <button
                className={`mobile-menu-toggle ${theme === 'dark' ? 'dark' : ''}`}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
                Мои таблицы ☰
            </button>

            {showMobileMenu && (
                <div className={`mobile-menu ${theme === 'dark' ? 'dark' : ''}`}>
                    <MobileTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        items={{
                            owned: ownedItems,
                            shared: sharedItems,
                            all: itemsArray
                        }}
                        theme={theme}
                    />

                    {currentItems.map((item, index) => (
                        <CarouselItem
                            key={item.id}
                            item={{
                                ...item,
                                ref: el => itemsRef.current[index] = el
                            }}
                            isActive={item.active}
                            onClick={handleItemClick}
                            theme={theme}
                        />
                    ))}

                    {activeTab === 'my' && (
                        <AddItemForm
                            isAdding={isAdding}
                            newItemName={newItemName}
                            onNameChange={setNewItemName}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            theme={theme}
                        />
                    )}

                    {activeTab === 'my' && !isAdding && (
                        <button
                            className={`add-button ${theme === 'dark' ? 'dark' : ''}`}
                            onClick={handleAddClick}
                        >
                            Добавить таблицу
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
    );

    return (
        <div className={`carousel-buttons ${isMobile ? 'mobile' : ''} ${theme === 'dark' ? 'dark-theme' : ''}`}>
            {isMobile ? renderMobileView() : renderDesktopView()}

            <ErrorModal
                isOpen={showErrorModal}
                onClose={closeErrorModal}
                errors={errors}
                theme={theme}
            />

            {successMessage && (
                <ToastNotification
                    message={successMessage}
                    type="success"
                    theme={theme}
                    onClose={() => setSuccessMessage(null)}
                    autoClose={true}
                    autoCloseDuration={3000}
                />
            )}
        </div>
    );
};

export default CarouselButtons;
