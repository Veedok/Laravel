import { useState, useEffect } from 'react';
export default function useWindowSize() {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;
    const compactTotals = windowWidth < 640;
    return {
        windowWidth,
        isMobile,
        compactTotals
    };
}
