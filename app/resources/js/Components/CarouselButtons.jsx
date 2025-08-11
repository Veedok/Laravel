import React, {useState, useEffect, useRef} from 'react';
import '../../css/CarouselButtons.css';

const CarouselButtons = ({items = {}, onAddClick, onItemClick}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const containerRef = useRef(null);
    const itemsRef = useRef([]);

    // Проверяем мобильное устройство и необходимость прокрутки
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

    const checkScroll = () => {
        if (!containerRef.current) return;

        const {scrollLeft, scrollWidth, clientWidth} = containerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    };

    const calculateScrollAmount = (direction) => {
        if (!containerRef.current || itemsRef.current.length === 0) return 0;

        const containerWidth = containerRef.current.clientWidth;
        const visibleWidth = containerWidth - 160; // Учитываем margin 80px с каждой стороны
        const scrollFraction = 0.75; // Прокручиваем 3/4 видимой области

        let scrollAmount = 0;
        let targetScroll = 0;
        const currentScroll = containerRef.current.scrollLeft;

        if (direction === 'right') {
            // Находим первую кнопку, которая не полностью видна справа
            for (let i = 0; i < itemsRef.current.length; i++) {
                const item = itemsRef.current[i];
                const itemRight = item.offsetLeft + item.offsetWidth;
                const containerRight = currentScroll + visibleWidth;

                if (itemRight > containerRight + 5) { // +5px для учета погрешности
                    targetScroll = item.offsetLeft - 80; // Отступ слева
                    scrollAmount = targetScroll - currentScroll;
                    break;
                }
            }
        } else {
            // Находим последнюю кнопку, которая не полностью видна слева
            for (let i = itemsRef.current.length - 1; i >= 0; i--) {
                const item = itemsRef.current[i];
                const itemLeft = item.offsetLeft;
                const containerLeft = currentScroll - visibleWidth;

                if (itemLeft < containerLeft - 5) { // +5px для учета погрешности
                    targetScroll = item.offsetLeft - 80; // Отступ слева
                    scrollAmount = targetScroll - currentScroll;
                    break;
                }
            }
        }

        // Если не нашли подходящую кнопку, прокручиваем на 3/4 видимой области
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

    // Преобразуем объект в массив
    const itemsArray = Object.entries(items).map(([id, data]) => ({id, ...data}));

    return (
        <div className={`carousel-buttons ${isMobile ? 'mobile' : ''}`}>
            {isMobile ? (
                <>
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        ☰
                    </button>

                    {showMobileMenu && (
                        <div className="mobile-menu">
                            {itemsArray.map((item) => (
                                <button
                                    key={item.id}
                                    className={`carousel-item ${item.active ? 'active' : ''}`}
                                    onClick={!item.active ? () => onItemClick(item.id) : undefined}
                                    disabled={item.active}
                                >
                                    {item.name}
                                </button>
                            ))}
                            <button className="add-button" onClick={onAddClick}>
                                Добавить
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="carousel-container-wrapper">
                        {(canScrollRight || canScrollLeft) && (
                            <button
                                className={`scroll-button left ${canScrollLeft ? '' : 'disabled'}`}
                                onClick={() => handleScroll('left')}
                                disabled={!canScrollLeft}
                            >
                                &lt;&lt;
                            </button>)}

                        <div
                            className="carousel-container"
                            ref={containerRef}
                            onScroll={checkScroll}
                        >
                            <div className="carousel-content">
                                {itemsArray.map((item, index) => (
                                    <button
                                        key={item.id}
                                        ref={el => itemsRef.current[index] = el}
                                        className={`carousel-item ${item.active ? 'active' : ''}`}
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
                                className={`scroll-button right ${canScrollRight ? '' : 'disabled'}`}
                                onClick={() => handleScroll('right')}
                                disabled={!canScrollRight}
                            >
                                &gt;&gt;
                            </button>)}
                    </div>

                    <div className="add-button-container">
                        <button className="add-button" onClick={onAddClick}>
                            Добавить
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CarouselButtons;
