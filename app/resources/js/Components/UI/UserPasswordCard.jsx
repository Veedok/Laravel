import React from 'react';
import { getUserCardClasses } from '@/Utils/userHelpers.js';
import PasswordInput from '@/Components/UI/PasswordInput.jsx';
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
                        {isCurrentUser ? user.mail : user.email}
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Пароль {isCurrentUser && 'для вас'}:
                    </label>
                    <PasswordInput
                        value={password}
                        onChange={(e) => onPasswordChange(user.id, e.target.value)}
                        placeholder={`Введите пароль${isCurrentUser ? ' для себя' : ` для ${user.name}`}`}
                        className={isCurrentUser ? 'border-blue-500' : ''}
                        theme={theme}
                        minLength={6}
                    />
                </div>
                {isCurrentUser && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Подтверждение пароля:
                            </label>
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                                placeholder="Повторите ваш пароль"
                                className="border-blue-500"
                                theme={theme}
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
