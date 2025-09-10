import { useState, useEffect, useContext } from 'react';
import { FaUserCircle, FaChevronDown, FaSignOutAlt, FaUserShield, FaUser } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import EditableProfile from './EditableProfile';

function Navbar() {
    const { user, setUser } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();

    // Al iniciar la app, el contexto UserContext debe poblarse una sola vez con los datos del token (por ejemplo, en el provider)
    // Aquí, Navbar solo usa el contexto y no decodifica el token en cada render

    // Helper to check if a path is active
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link
                    to={user ? (user.role === 'admin' && user.store ? `/tienda/${user.store}` : '/tiendas') : '/'}
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                >
                    <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Logo" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                        TuTienda
                    </span>
                </Link>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-default"
                    aria-expanded={isOpen}
                    aria-label="Toggle menu"
                >
                    <span className="sr-only">Open main menu</span>
                    <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 17 14"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 1h15M1 7h15M1 13h15"
                        />
                    </svg>
                </button>

                <div
                    className={`w-full md:block md:w-auto ${isOpen ? 'block' : 'hidden'}`}
                    id="navbar-default"
                >
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        {user && user.role === 'admin' && user.store && (
                            <li>
                                <Link
                                    to={`/tienda/${user.store}`}
                                    className={`block py-2 px-3 rounded-sm md:p-0 ${isActive(`/tienda/${user.store}`) ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`}
                                    aria-current={isActive(`/tienda/${user.store}`) ? 'page' : undefined}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Mi tienda
                                </Link>
                            </li>
                        )}
                        {(user && user.role !== 'admin') && (
                            <>
                                <li>
                                    <Link
                                        to="/tiendas"
                                        className={`block py-2 px-3 rounded-sm md:p-0 ${isActive('/tiendas') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`}
                                        aria-current={isActive('/tiendas') ? 'page' : undefined}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Tiendas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/products"
                                        className={`block py-2 px-3 rounded-sm md:p-0 ${isActive('/products') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`}
                                        aria-current={isActive('/products') ? 'page' : undefined}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        All Products
                                    </Link>
                                </li>
                            </>
                        )}
                        {!user && (
                            <>
                                <li>
                                    <Link
                                        to="/tiendas"
                                        className={`block py-2 px-3 rounded-sm md:p-0 ${isActive('/tiendas') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`}
                                        aria-current={isActive('/tiendas') ? 'page' : undefined}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Tiendas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/products"
                                        className={`block py-2 px-3 rounded-sm md:p-0 ${isActive('/products') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`}
                                        aria-current={isActive('/products') ? 'page' : undefined}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        All Products
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/auth"
                                        className={`block py-2 px-3 rounded-sm md:p-0 ${isActive('/auth') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Acceder
                                    </Link>
                                </li>
                            </>
                        )}
                        {user && (
                            <>
                                {user.role === 'admin' ? (
                                    <li>
                                        <Link
                                            to="/admin"
                                            className={`block py-2 px-3 rounded-sm md:p-0 ${isActive('/admin') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Admin
                                        </Link>
                                    </li>
                                ) : (
                                    <li>
                                        <Link
                                            to="/cart"
                                            className={`block py-2 px-3 rounded-sm md:p-0 ${isActive('/cart') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Cart
                                        </Link>
                                    </li>
                                )}
                                <li className="relative">
                                    <button
                                        className="flex items-center gap-2 py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent font-semibold"
                                        onClick={() => setProfileOpen((open) => !open)}
                                    >
                                        <span className="hidden sm:inline">Perfil</span>
                                        <FaChevronDown className={`ml-1 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {profileOpen && (
                                        <div>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setProfileOpen(false)}
                                            />
                                            <div
                                                className="absolute right-0 mt-2 w-72 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 z-50 flex flex-col items-center animate-fadeInDown backdrop-blur-md"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <div className="absolute top-3 right-3">
                                                    <button
                                                        onClick={() => {
                                                            // Abrir edición de perfil (usa setEditing de EditableProfile vía prop o contexto)
                                                            const editBtn = document.querySelector('.editable-profile-edit-btn');
                                                            if (editBtn) editBtn.click();
                                                        }}
                                                        aria-label="Editar perfil"
                                                        className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 editable-profile-edit-btn-modal"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.362z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <FaUserCircle className="text-6xl text-blue-400 dark:text-blue-200 mb-2" />
                                                    <div className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-300 mb-1">
                                                        {user.role === 'admin' ? <FaUserShield className="text-base" /> : <FaUser className="text-base" />}
                                                        <span className="font-semibold">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
                                                    </div>
                                                    {user.name && (
                                                        <div className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1 text-center">{user.name}</div>
                                                    )}
                                                </div>
                                                {/* Formulario para editar datos */}
                                                <EditableProfile user={user} setUser={setUser} editButtonClassName="editable-profile-edit-btn" />
                                                <button
                                                    onClick={() => {
                                                        localStorage.removeItem('token');
                                                        window.location.reload();
                                                    }}
                                                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition shadow-sm group"
                                                >
                                                    <FaSignOutAlt className="text-lg group-hover:scale-105 transition-transform duration-200" />
                                                    <span className="group-hover:underline">Cerrar sesión</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            </>
                        )}
                    </ul>

                </div>
            </div>
        </nav>
    );
}

export default Navbar;
