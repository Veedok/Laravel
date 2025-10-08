import React from 'react';
import { getUserCardClasses } from '@/Utils/userHelpers.js';
const UserPasswordCard = ({
                              user,
                              isCurrentUser,
                              password,
                              confirmPassword,
                              onPasswordChange,
                              onConfirmPasswordChange,
                              theme
                          }) => {
    const classes = getUserCardClasses(isCurrentUser, theme);
    return (
        <div className={`p-4 rounded-lg border ${classes.card} ${classes.ring}`}>
            <div className="flex items-center mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${classes.badge}`}>
                    {isCurrentUser ? '👤' : '👥'}
                </div>
                <div>
                    <div className="font-medium flex items-center">
                        {user.name}
                        {isCurrentUser && (
                            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                Вы
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.mail}
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Пароль {isCurrentUser && 'для вас'}:
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => onPasswordChange(user.id, e.target.value)}
                        placeholder={`Введите пароль${isCurrentUser ? ' для себя' : ` для ${user.name}`}`}
                        className={`w-full p-2 border rounded text-sm ${
                            theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } ${isCurrentUser ? 'border-blue-500' : ''}`}
                        minLength={6}
                    />
                </div>
                {isCurrentUser && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Подтверждение пароля:
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => onConfirmPasswordChange(e.target.value)} // ИСПРАВЛЕНО: передаем значение
                                placeholder="Повторите ваш пароль"
                                className={`w-full p-2 border rounded text-sm ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } border-blue-500`}
                                minLength={6}
                            />
                            {password && confirmPassword && (
                                <div className={`text-xs mt-1 ${
                                    password === confirmPassword
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {password === confirmPassword
                                        ? '✓ Пароли совпадают'
                                        : '✗ Пароли не совпадают'
                                    }
                                </div>
                            )}
                        </div>
                        <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-sm text-blue-700 dark:text-blue-300">
                            <strong>Важно:</strong> Запомните этот пароль! Он понадобится для доступа к вашим данным.
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserPasswordCard;
