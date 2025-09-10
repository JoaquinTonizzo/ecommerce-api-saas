import React, { useState, useEffect } from 'react';

export default function HistoryModal({ open, loading, history, onClose }) {
    const [expanded, setExpanded] = useState({});
    const [details, setDetails] = useState({});
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Limpia detalles al cerrar modal
        if (!open) setDetails({});
    }, [open]);

    async function fetchDetails(cartId, products) {
        if (details[cartId]) return; // Ya cargado
        const productosConDetalles = await Promise.all(
            products.map(async (p) => {
                const prodId = p.productId?._id || p.productId || p._id;
                try {
                    const res = await fetch(`${API_URL}/api/products/${prodId}`);
                    if (!res.ok) return { ...p, title: 'Producto eliminado', price: 0 };
                    const prod = await res.json();
                    return { ...prod, quantity: p.quantity };
                } catch {
                    return { ...p, title: 'Error', price: 0 };
                }
            })
        );
        setDetails(prev => ({ ...prev, [cartId]: productosConDetalles }));
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4" onClick={onClose}>
            <div className="relative w-full max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Historial de compras</h2>
                    {loading ? (
                        <div className="text-center">Cargando...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-gray-500">No hay compras registradas.</div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {history.map((h, i) => {
                                const cartId = h._id || h.id || i;
                                return (
                                    <li key={cartId} className="py-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">Carrito: {cartId} - Estado: {h.status || 'N/A'}</div>
                                                <div className="text-sm text-gray-700 dark:text-gray-300">Usuario: {h.userId || 'N/A'}</div>
                                            </div>
                                            <button
                                                className="ml-4 px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium"
                                                onClick={async () => {
                                                    setExpanded(e => ({ ...e, [cartId]: !e[cartId] }));
                                                    if (!expanded[cartId] && Array.isArray(h.products)) {
                                                        await fetchDetails(cartId, h.products);
                                                    }
                                                }}
                                            >
                                                {expanded[cartId] ? 'Cerrar' : 'Ver productos'}
                                            </button>
                                        </div>
                                        {expanded[cartId] && Array.isArray(details[cartId]) && (
                                            <>
                                                <ul className="mt-4 space-y-2">
                                                    {details[cartId].map((p, idx) => (
                                                        <li key={p._id || p.id || idx} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                                                            <span className="font-semibold text-gray-900 dark:text-white">{p.title}</span>
                                                            <span className="ml-2 text-gray-700 dark:text-gray-300">x{p.quantity}</span>
                                                            <span className="ml-2 text-gray-700 dark:text-gray-300">${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-2 text-right font-bold text-lg text-gray-900 dark:text-white">
                                                    Total: ${details[cartId].reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0).toFixed(2)}
                                                </div>
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
