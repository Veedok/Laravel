import React from 'react';

const ErrorMessage = ({ message, onRetry }) => (
    <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg className="w-10 h-10 text-red-500 animate-bounce" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            <p className="text-red-600 font-medium text-center">{message}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                Попробовать снова
            </button>
        </div>
    </div>
);
export default ErrorMessage;
