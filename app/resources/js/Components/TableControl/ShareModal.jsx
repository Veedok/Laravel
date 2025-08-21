import { useState, useEffect } from 'react';
import Modal from "@/Components/TableControl/Modal.jsx";
import {Dialog} from '@headlessui/react';

export default function ShareModal({
                                       isOpen,
                                       onClose,
                                       table,
                                       theme,
                                       permissions: availablePermissions,
                                       onShare
                                   }) {
    const [email, setEmail] = useState('');
    const [emailSuggestions, setEmailSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isSharing, setIsSharing] = useState(false);

    const fetchEmailSuggestions = async (query) => {
        try {
            const response = await axios.get(route('userSearch'), {
                params: { query, limit: 5, tableId: table.id }
            });
            setEmailSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            setEmailSuggestions([]);
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        if (value.length >= 3) {
            fetchEmailSuggestions(value);
        } else {
            setEmailSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSubmit = async () => {
        if (!email || !table?.id) {
            return false;
        }

        const selectedUser = emailSuggestions.find(user => user.email === email);

        if (!selectedUser) {
            return false;
        }

        setIsSharing(true);

        try {
            await onShare({
                userId: selectedUser.id,
                tableId: table.id,
                permissions: selectedPermissions
            });

            setEmail('');
            setEmailSuggestions([]);
            setSelectedPermissions([]);
            return true;
        } catch (error) {
            throw error;
        } finally {
            setIsSharing(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setEmailSuggestions([]);
            setSelectedPermissions([]);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} theme={theme}>
            <div className="relative">
                <Dialog.Title as="h3" className={`text-lg font-medium leading-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                    Предоставить доступ к "{table?.name}"
                </Dialog.Title>
                <div className="mt-4">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Email пользователя"
                            value={email}
                            onChange={handleEmailChange}
                            onFocus={() => email.length >= 3 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                theme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300'
                            }`}
                        />
                        {showSuggestions && emailSuggestions.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full">
                                <ul className={`shadow-lg rounded-md border ${
                                    theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                                }`}>
                                    {emailSuggestions.map((user) => (
                                        <li
                                            key={user.id}
                                            className={`px-3 py-2 cursor-pointer transition-colors ${
                                                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                                            }`}
                                            onClick={() => {
                                                setEmail(user.email);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <div className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {user.name}
                                            </div>
                                            <div className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {user.email}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Разрешения:
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(availablePermissions).map(([key, label]) => (
                                <div key={key} className="flex items-center">
                                    <input
                                        id={`permission-${key}`}
                                        type="checkbox"
                                        checked={selectedPermissions.includes(key)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedPermissions([...selectedPermissions, key]);
                                            } else {
                                                setSelectedPermissions(selectedPermissions.filter(p => p !== key));
                                            }
                                        }}
                                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                                            theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
                                        }`}
                                    />
                                    <label htmlFor={`permission-${key}`} className={`ml-2 text-sm ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 rounded-md hover:bg-opacity-80 ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSharing || !email}
                        className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 ${
                            isSharing ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                            theme === 'dark' ? 'bg-green-700' : 'bg-green-600'
                        }`}
                    >
                        {isSharing ? 'Отправка...' : 'Поделиться'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
