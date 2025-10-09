import React from 'react';

const LoadingSpinner = ({
                            size = 'medium',
                            color = 'primary',
                            className = '',
                            text = 'Загрузка...'
                        }) => {
    // Размеры спиннера
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-12 h-12',
        large: 'w-16 h-16',
        xlarge: 'w-24 h-24'
    };

    // Цвета спиннера
    const colorClasses = {
        primary: 'text-blue-600',
        secondary: 'text-gray-600',
        success: 'text-green-600',
        danger: 'text-red-600',
        warning: 'text-yellow-600',
        light: 'text-gray-300',
        dark: 'text-gray-800'
    };

    return (
        <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
            {/* Анимированный спиннер */}
            <div className="relative">
                {/* Внешнее кольцо */}
                <div
                    className={`
            ${sizeClasses[size]}
            border-4
            border-current
            border-opacity-25
            rounded-full
          `}
                />

                {/* Вращающаяся часть */}
                <div
                    className={`
            ${sizeClasses[size]}
            ${colorClasses[color]}
            border-4
            border-t-transparent
            border-current
            rounded-full
            absolute
            top-0
            left-0
            animate-spin
          `}
                />
            </div>

            {/* Текст под спиннером */}
            {text && (
                <p className={`mt-4 text-sm font-medium ${colorClasses[color]} animate-pulse`}>
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
