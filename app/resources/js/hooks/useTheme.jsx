import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export default function useTheme(initialTheme = 'light') {
    const [theme, setTheme] = useState(initialTheme);

    useEffect(() => {
        // Применяем тему при загрузке
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');

        router.post('/toggle-theme', { theme: newTheme }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return { theme, toggleTheme };
}
