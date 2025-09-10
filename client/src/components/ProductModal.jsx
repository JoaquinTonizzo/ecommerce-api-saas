import React from 'react';

export default function ProductModal({ producto, onClose, onAddToCart }) {
    if (!producto) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-1 sm:px-8">
            <div
                className="bg-white dark:bg-gray-950 rounded-3xl max-w-3xl w-full p-0 relative shadow-[0_8px_32px_0_rgba(60,0,120,0.18)] animate-fadeInUp flex flex-col md:flex-row border-2 border-blue-200 dark:border-blue-900"
                onClick={e => e.stopPropagation()} // evita cerrar modal al click dentro
            >
                {/* Botón de cierre flotante */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow hover:bg-blue-100 dark:hover:bg-blue-900 transition border border-blue-200 dark:border-blue-700"
                    title="Cerrar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-700 dark:text-blue-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Imagen cuadrada y visual mejorada */}
                <div className="md:w-1/2 w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden p-4">
                    <div className="w-full max-w-[400px] aspect-square bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex items-center justify-center border-2 border-blue-100 dark:border-blue-800 group">
                        <img
                            src={producto.thumbnails?.[0] || 'https://placehold.co/400x400'}
                            alt={producto.title}
                            className="w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-105"
                            style={{ maxHeight: '380px', maxWidth: '380px' }}
                        />
                    </div>
                </div>

                {/* Contenido visual mejorado */}
                <div className="flex flex-col justify-between md:w-1/2 w-full p-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-300 dark:via-purple-300 dark:to-pink-300 drop-shadow">
                            {producto.title}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base font-medium border-b border-blue-100 dark:border-blue-800 pb-2">
                            {producto.description}
                        </p>

                        <div className="space-y-2 text-gray-800 dark:text-gray-200 mb-4 text-xs sm:text-sm">
                            <p><span className="font-semibold">Código:</span> {producto.code}</p>
                            <p><span className="font-semibold">Categoría:</span> {producto.category}</p>
                            <p><span className="font-semibold">Stock:</span> {producto.stock}</p>
                            <p><span className="font-semibold">Precio:</span> <span className="text-blue-600 dark:text-blue-300 font-bold">${producto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            <p><span className="font-semibold">Estado:</span> {producto.status ? <span className="text-green-600 font-bold">Disponible</span> : <span className="text-red-500 font-bold">No disponible</span>}</p>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 text-blue-900 dark:text-blue-200 hover:from-blue-300 hover:to-purple-300 dark:hover:from-blue-800 dark:hover:to-purple-800 font-semibold shadow transition border border-blue-300 dark:border-blue-700"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
