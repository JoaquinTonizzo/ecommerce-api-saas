import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Tiendas = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStores = async () => {
            console.log('Iniciando fetch de tiendas...');
            try {
                const res = await fetch('/api/store/all');
                console.log('Respuesta recibida. Status:', res.status);
                if (!res.ok) {
                    const text = await res.text();
                    console.log('Texto recibido en error:', text.slice(0, 100));
                    if (text.startsWith('<!DOCTYPE')) {
                        console.log('Respuesta HTML detectada en /api/store/all:', text.slice(0, 100));
                        console.log('Redirigiendo a /auth...');
                        navigate('/auth');
                        return;
                    }
                    throw new Error('No se pudo cargar las tiendas');
                }
                const data = await res.json();
                console.log('Datos JSON recibidos:', data);
                setStores(data);
            } catch (err) {
                setError(err.message);
                console.log('Error en fetchStores:', err);
            } finally {
                setLoading(false);
                console.log('Finalizó fetchStores. loading:', false);
            }
        };
        fetchStores();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <span className="text-lg font-semibold">Cargando tiendas...</span>
            </div>
        </div>
    );
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-0 py-0 relative overflow-hidden">
            {/* Fondo animado */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 opacity-20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-20 rounded-full blur-3xl animate-float2" />
            </div>
            <div className="relative z-10 px-6 py-12 max-w-5xl mx-auto">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-300 dark:to-pink-300 mb-10 text-center animate-fadeInDown drop-shadow-lg">
                    Tiendas
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fadeInUp">
                    {stores.length === 0 ? (
                        <div className="col-span-3 text-gray-500">No hay tiendas registradas.</div>
                    ) : (
                        stores.map(store => (
                            <div key={store._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col justify-between border border-blue-100 dark:border-blue-900 min-h-[180px] group hover:scale-[1.02] hover:shadow-lg transition-all duration-200">
                                <div>
                                    <h2 className="font-bold text-2xl mb-2 text-blue-700 dark:text-blue-300 truncate drop-shadow transition-all duration-200">
                                        {store.storeName}
                                    </h2>
                                    <p className="text-gray-700 mb-1"><span className="font-semibold">Dueño:</span> {store.owner?.firstName} {store.owner?.lastName}</p>
                                    <p className="text-gray-600 mb-1"><span className="font-semibold">Dirección:</span> {store.address}</p>
                                </div>
                                <Link to={`/tienda/${store._id}`} className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded hover:bg-blue-700 text-center font-semibold transition-all duration-200 shadow-md">Ver tienda</Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
};

export default Tiendas;
