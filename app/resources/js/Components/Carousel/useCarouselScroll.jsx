// hooks/useCarouselScroll.js
import { useState, useCallback, useRef } from 'react';

export default function useCarouselScroll() {
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const containerRef = useRef(null);
    const itemsRef = useRef([]);

    const checkScroll = useCallback(() => {
        if (!containerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }, []);

    const calculateScrollAmount = useCallback((direction) => {
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
    }, []);

    const handleScroll = useCallback((direction) => {
        if (!containerRef.current) return;

        const scrollAmount = calculateScrollAmount(direction);
        const newScroll = containerRef.current.scrollLeft + scrollAmount;

        containerRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
        setTimeout(checkScroll, 300);
    }, [calculateScrollAmount, checkScroll]);

    return {
        containerRef,
        itemsRef,
        canScrollLeft,
        canScrollRight,
        checkScroll,
        handleScroll
    };
}
