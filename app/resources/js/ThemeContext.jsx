import { createContext, useContext, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { props } = usePage();
    const [theme, setTheme] = useState(props.theme || 'light');

    useEffect(() => {
        // Синхронизация при изменении props (например, после перезагрузки)
        if (props.theme && props.theme !== theme) {
            setTheme(props.theme);
        }
    }, [props.theme]);

    useEffect(() => {
        // Применяем тему к документу
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        router.post('/toggle-theme', { theme: newTheme }, {
            preserveScroll: true,
            onSuccess: () => {
                // После успешного сохранения на сервере
                document.documentElement.classList.toggle('dark', newTheme === 'dark');
            }
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
