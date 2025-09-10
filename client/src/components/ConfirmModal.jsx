import React from 'react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[80vh]">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">{title}</h2>
                <p className="mb-8 text-gray-700 dark:text-gray-300 text-center font-medium">{message}</p>
                <div className="flex justify-center gap-6 mt-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
