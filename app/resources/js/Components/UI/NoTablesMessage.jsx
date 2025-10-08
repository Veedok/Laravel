import React from 'react';

const NoTablesMessage = ({ onAddTable }) => (
    <div className="max-w-md mx-auto p-6 bg-blue-50 rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
            </div>
            <p className="text-blue-600 font-medium text-center">У вас нет ни одной таблицы. Создайте таблицу для начала
                работы.</p>
            <button
                onClick={() => onAddTable("Новая таблица")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Создать таблицу
            </button>
        </div>
    </div>
);
export default NoTablesMessage;
