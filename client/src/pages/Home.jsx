import { FaShieldAlt, FaShippingFast, FaHeadset, FaStar, FaShoppingCart, FaTags } from 'react-icons/fa';
import { FaUserPlus } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import { FaUserCircle, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    useEffect(() => {
        document.title = 'TuTienda - Inicio';
        // Redirección automática según rol
        if (user) {
            if (user.role === 'admin') {
                // Redirigir admin a su tienda
                if (user.store) {
                    navigate(`/tienda/${user.store}`);
                } else {
                    navigate('/auth?tab=store'); // Si no tiene tienda asociada
                }
            } else {
                // Redirigir usuario normal a tiendas
                navigate('/products');
            }
        }
    }, [user, navigate]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center px-2 sm:px-6 py-0 text-center">
            {/* SaaS Hero Section */}
            <section className="w-full flex flex-col items-center justify-center py-20 sm:py-28 animate-fadeInDown">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-300 dark:to-pink-300 mb-4 drop-shadow-xl">
                    TuTienda Ecommerce
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mb-6 animate-fadeInUp font-medium">
                    Crea tu propia tienda online en minutos o regístrate para comprar en cientos de tiendas. ¡Todo en una sola plataforma!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                    <button
                        onClick={() => navigate('/auth?tab=login')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-base shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
                    >
                        <FaUserCircle className="text-lg" /> Iniciar sesión
                    </button>
                    <button
                        onClick={() => navigate('/auth?tab=register')}
                        className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-2 rounded-full font-bold text-base shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
                    >
                        <FaUserPlus className="text-lg" /> Registrarse
                    </button>
                    <button
                        onClick={() => navigate('/auth?tab=store')}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full font-bold text-base shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
                    >
                        <FaStore className="text-lg" /> Crear mi tienda
                    </button>
                </div>
            </section>

            {/* Features SaaS */}
            <section className="w-full flex flex-wrap justify-center gap-4 sm:gap-6 max-w-4xl mb-10 sm:mb-14 animate-fadeInUp">
                <div className="flex flex-col items-center w-full sm:w-44 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-blue-500 dark:border-blue-400 backdrop-blur-md">
                    <FaShieldAlt className="w-8 h-8 mb-2 text-blue-600 dark:text-blue-400 animate-spin-slow" />
                    <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">Seguro y confiable</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">
                        Tecnología robusta para proteger tus datos y transacciones.
                    </p>
                </div>
                <div className="flex flex-col items-center w-full sm:w-44 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-green-500 dark:border-green-400 backdrop-blur-md">
                    <FaWhatsapp className="w-8 h-8 mb-2 text-green-500 dark:text-green-400 animate-bounce" />
                    <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">WhatsApp directo</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">
                        Contacta al vendedor por WhatsApp para consultas, pedidos y atención personalizada.
                    </p>
                </div>
                <div className="flex flex-col items-center w-full sm:w-44 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-purple-500 dark:border-purple-400 backdrop-blur-md">
                    <FaHeadset className="w-8 h-8 mb-2 text-purple-600 dark:text-purple-400 animate-pulse" />
                    <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">Soporte 24/7</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">
                        Ayuda personalizada para tiendas y clientes en todo momento.
                    </p>
                </div>
            </section>
        </main>
    );
}
