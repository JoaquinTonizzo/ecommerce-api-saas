import React, { useState, useContext } from 'react';
import { FaUserCircle, FaLock, FaUserPlus, FaEnvelope, FaUser, FaStore, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UserContext } from '../context/UserContext';

export default function Auth() {
    const [storeForm, setStoreForm] = useState({ firstName: '', lastName: '', email: '', password: '', storeName: '', address: '', whatsapp: '' });
    const [storeTouched, setStoreTouched] = useState({ firstName: false, lastName: false, email: false, password: false, storeName: false, address: false, whatsapp: false });

    async function handleStoreRegister(e) {
        e.preventDefault();
        setStoreTouched({ firstName: true, lastName: true, email: true, password: true, storeName: true, address: true, whatsapp: true });
        // Validaciones
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        const whatsappRegex = /^\+?\d{10,15}$/;
    let errorMsg = '';
    if (!storeForm.firstName) errorMsg = 'El nombre es obligatorio';
    else if (storeForm.firstName.length < 3) errorMsg = 'El nombre debe tener al menos 3 caracteres';
    else if (!storeForm.lastName) errorMsg = 'El apellido es obligatorio';
    else if (storeForm.lastName.length < 3) errorMsg = 'El apellido debe tener al menos 3 caracteres';
    else if (!storeForm.email) errorMsg = 'El email es obligatorio';
    else if (!emailRegex.test(storeForm.email)) errorMsg = 'El email no es válido';
    else if (!storeForm.password) errorMsg = 'La contraseña es obligatoria';
    else if (storeForm.password.length < 6) errorMsg = 'La contraseña debe tener al menos 6 caracteres';
    else if (!storeForm.storeName) errorMsg = 'El nombre de la tienda es obligatorio';
    else if (storeForm.storeName.length < 3) errorMsg = 'El nombre de la tienda debe tener al menos 3 caracteres';
    else if (!storeForm.address) errorMsg = 'La dirección es obligatoria';
    else if (storeForm.address.length < 5) errorMsg = 'La dirección debe tener al menos 5 caracteres';
    else if (!storeForm.whatsapp) errorMsg = 'El WhatsApp es obligatorio';
    else if (storeForm.whatsapp.length < 10) errorMsg = 'El WhatsApp debe tener al menos 10 caracteres';
    else if (!whatsappRegex.test(storeForm.whatsapp)) errorMsg = 'El WhatsApp debe tener formato internacional, ej: +5491123456789';
        if (errorMsg) {
            toast.error(errorMsg);
            return;
        }
        try {
            // Cambia la URL por la de tu endpoint real
            const res = await fetch(`${API_URL}/api/store/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storeForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al registrar tienda');
            toast.success('Tienda registrada exitosamente');
            setStoreForm({ firstName: '', lastName: '', email: '', password: '', storeName: '', address: '', whatsapp: '' });
            setStoreTouched({ firstName: false, lastName: false, email: false, password: false, storeName: false, address: false, whatsapp: false });
            setTab('login');
        } catch (err) {
            toast.error(err.message);
        }
    }
    const location = useLocation();
    function getTabFromQuery() {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'register' || tabParam === 'store' || tabParam === 'login') return tabParam;
        return 'login';
    }
    const [tab, setTab] = useState(getTabFromQuery());
    // Actualiza el tab si cambia la URL y limpia touched
    React.useEffect(() => {
        setTab(getTabFromQuery());
        setLoginTouched({ email: false, password: false });
        setRegisterTouched({ firstName: false, lastName: false, email: false, password: false });
        setStoreTouched({ firstName: false, lastName: false, email: false, password: false, storeName: false, address: false, whatsapp: false });
    }, [location.search]);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [loginTouched, setLoginTouched] = useState({ email: false, password: false });
    const [registerTouched, setRegisterTouched] = useState({ firstName: false, lastName: false, email: false, password: false });
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const API_URL = import.meta.env.VITE_API_URL;

    // Si ya está logueado, redirigir a home
    React.useEffect(() => {
        if (user) {
            if (user.role === 'admin' && user.store) {
                navigate(`/tienda/${user.store}`);
            } else {
                navigate('/tiendas');
            }
        }
    }, [user, navigate]);

    async function handleLogin(e) {
        e.preventDefault();
        setLoginTouched({ email: true, password: true });
        if (!loginForm.email || !loginForm.password) return;
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Decodificar el token y actualizar el contexto
            try {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                setUser(payload);
            } catch {
                setUser(null);
            }
            toast.success('Sesión iniciada');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setRegisterTouched({ firstName: true, lastName: true, email: true, password: true });
        // Validaciones
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        let errorMsg = '';
        if (!registerForm.firstName) errorMsg = 'El nombre es obligatorio';
        else if (registerForm.firstName.length < 3) errorMsg = 'El nombre debe tener al menos 3 caracteres';
        else if (!registerForm.lastName) errorMsg = 'El apellido es obligatorio';
        else if (registerForm.lastName.length < 3) errorMsg = 'El apellido debe tener al menos 3 caracteres';
        else if (!registerForm.email) errorMsg = 'El email es obligatorio';
        else if (!emailRegex.test(registerForm.email)) errorMsg = 'El email no es válido';
        else if (!registerForm.password) errorMsg = 'La contraseña es obligatoria';
        else if (registerForm.password.length < 6) errorMsg = 'La contraseña debe tener al menos 6 caracteres';
        if (errorMsg) {
            toast.error(errorMsg);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al registrarse');
            toast.success('Registro exitoso, ahora puedes iniciar sesión');
            setRegisterForm({ firstName: '', lastName: '', email: '', password: '' });
            setTab('login');
        } catch (err) {
            toast.error(err.message);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12 relative overflow-hidden">
            {/* Fondo animado */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 opacity-20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-20 rounded-full blur-3xl animate-float2" />
            </div>
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <div
                className={`w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 animate-fadeInDown relative z-10 ${tab === 'login' ? 'min-h-[400px]' : tab === 'register' ? 'min-h-[400px]' : 'min-h-[1000px]'
                    }`}
            >
                {/* Header con logo y bienvenida */}
                <div className="flex flex-col items-center mb-8">
                    <FaStore className="text-3xl text-blue-600 dark:text-blue-400 animate-bounce mb-2" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Bienvenido a TuTienda</h2>
                    <p className="text-gray-500 dark:text-gray-300 text-xs text-center">
                        ¿Querés comprar? Iniciá sesión o creá tu cuenta en segundos.
                        <br />
                        ¿Querés vender? Registrate como administrador de tienda y empezá hoy mismo.
                    </p>
                </div>
                <div className="flex mb-4">
                    <button
                        className={`flex-1 py-1 font-bold rounded-l-2xl transition-all duration-300 text-sm ${tab === 'login' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105 shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => {
                            setTab('login');
                            setLoginTouched({ email: false, password: false });
                            setRegisterTouched({ firstName: false, lastName: false, email: false, password: false });
                            setStoreTouched({ firstName: false, lastName: false, email: false, password: false, storeName: false, address: false, whatsapp: false });
                        }}
                    >
                        <span className="inline-flex items-center gap-2 justify-center"><FaUserCircle /> Login</span>
                    </button>
                    <button
                        className={`flex-1 py-1 font-bold transition-all duration-300 text-sm ${tab === 'register' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105 shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => {
                            setTab('register');
                            setLoginTouched({ email: false, password: false });
                            setRegisterTouched({ firstName: false, lastName: false, email: false, password: false });
                            setStoreTouched({ firstName: false, lastName: false, email: false, password: false, storeName: false, address: false, whatsapp: false });
                        }}
                    >
                        <span className="inline-flex items-center gap-2 justify-center"><FaUserPlus /> Registro</span>
                    </button>
                    <button
                        className={`flex-1 py-1 font-bold rounded-r-2xl transition-all duration-300 text-sm ${tab === 'store' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105 shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        onClick={() => {
                            setTab('store');
                            setLoginTouched({ email: false, password: false });
                            setRegisterTouched({ firstName: false, lastName: false, email: false, password: false });
                            setStoreTouched({ firstName: false, lastName: false, email: false, password: false, storeName: false, address: false, whatsapp: false });
                        }}
                    >
                        <span className="inline-flex items-center gap-2 justify-center"><FaStore /> Tienda</span>
                    </button>
                </div>
                <div className="relative min-h-[500px]">
                    <div
                        key={tab + '-store'}
                        className={
                            `absolute inset-0 transition-all duration-400 ease-in-out ` +
                            (tab === 'store' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-4 pointer-events-none z-0')
                        }
                        style={{ willChange: 'opacity, transform' }}
                    >
                        <form onSubmit={handleStoreRegister} className="animate-fadeInUp">
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Nombre</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-blue-500"><FaUser /></span>
                                    <input name="firstName" value={storeForm.firstName} onChange={e => setStoreForm(f => ({ ...f, firstName: e.target.value }))} onBlur={() => setStoreTouched(t => ({ ...t, firstName: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${storeTouched.firstName && !storeForm.firstName ? 'border-red-500' : ''}`} required placeholder="Ej: Juan" />
                                </div>
                                {storeTouched.firstName && !storeForm.firstName && <span className="text-xs text-red-500">El nombre es obligatorio</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Apellido</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-blue-500"><FaUser /></span>
                                    <input name="lastName" value={storeForm.lastName} onChange={e => setStoreForm(f => ({ ...f, lastName: e.target.value }))} onBlur={() => setStoreTouched(t => ({ ...t, lastName: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${storeTouched.lastName && !storeForm.lastName ? 'border-red-500' : ''}`} required placeholder="Ej: Pérez" />
                                </div>
                                {storeTouched.lastName && !storeForm.lastName && <span className="text-xs text-red-500">El apellido es obligatorio</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Email</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-blue-500"><FaEnvelope /></span>
                                    <input name="email" type="email" value={storeForm.email} onChange={e => setStoreForm(f => ({ ...f, email: e.target.value }))} onBlur={() => setStoreTouched(t => ({ ...t, email: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${storeTouched.email && !storeForm.email ? 'border-red-500' : ''}`} required placeholder="Ej: correo@dominio.com" />
                                </div>
                                {storeTouched.email && !storeForm.email && <span className="text-xs text-red-500">El email es obligatorio</span>}
                                {storeTouched.email && storeForm.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(storeForm.email) && (
                                    <span className="text-xs text-red-500">El email no es válido</span>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Contraseña</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-purple-500"><FaLock /></span>
                                    <input name="password" type="password" value={storeForm.password} onChange={e => setStoreForm(f => ({ ...f, password: e.target.value }))} onBlur={() => setStoreTouched(t => ({ ...t, password: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white ${storeTouched.password && !storeForm.password ? 'border-red-500' : ''}`} required placeholder="Mínimo 6 caracteres" />
                                </div>
                                {storeTouched.password && !storeForm.password && <span className="text-xs text-red-500">La contraseña es obligatoria</span>}
                                {storeTouched.password && storeForm.password && storeForm.password.length < 6 && (
                                    <span className="text-xs text-red-500">La contraseña debe tener al menos 6 caracteres</span>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Nombre de la tienda</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-blue-500"><FaStore /></span>
                                    <input name="storeName" value={storeForm.storeName} onChange={e => setStoreForm(f => ({ ...f, storeName: e.target.value }))} onBlur={() => setStoreTouched(t => ({ ...t, storeName: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${storeTouched.storeName && !storeForm.storeName ? 'border-red-500' : ''}`} required placeholder="Ej: TiendaTech" />
                                </div>
                                {storeTouched.storeName && !storeForm.storeName && <span className="text-xs text-red-500">El nombre de la tienda es obligatorio</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Dirección</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-purple-500"><FaMapMarkerAlt /></span>
                                    <input name="address" value={storeForm.address} onChange={e => setStoreForm(f => ({ ...f, address: e.target.value }))} onBlur={() => setStoreTouched(t => ({ ...t, address: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white ${storeTouched.address && !storeForm.address ? 'border-red-500' : ''}`} required placeholder="Ej: Av. 123, San Miguel, Buenos Aires, Argentina" />
                                </div>
                                {storeTouched.address && !storeForm.address && <span className="text-xs text-red-500">La dirección es obligatoria</span>}
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">WhatsApp</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-green-500"><FaWhatsapp /></span>
                                    <input name="whatsapp" value={storeForm.whatsapp} onChange={e => setStoreForm(f => ({ ...f, whatsapp: e.target.value }))} onBlur={() => setStoreTouched(t => ({ ...t, whatsapp: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:text-white ${storeTouched.whatsapp && !storeForm.whatsapp ? 'border-red-500' : ''}`} required placeholder="Ej: +5491123456789" />
                                </div>
                                {storeTouched.whatsapp && !storeForm.whatsapp && <span className="text-xs text-red-500">El WhatsApp es obligatorio</span>}
                                {storeTouched.whatsapp && storeForm.whatsapp && !/^\+?\d{10,15}$/.test(storeForm.whatsapp) && (
                                    <span className="text-xs text-red-500">El WhatsApp debe tener formato internacional, ej: +5491123456789</span>
                                )}
                            </div>
                            <button type="submit" className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:brightness-110"><FaStore /> Registrar tienda</button>
                        </form>
                    </div>
                    <div
                        key={tab}
                        className={
                            `absolute inset-0 transition-all duration-400 ease-in-out ` +
                            (tab === 'login' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-4 pointer-events-none z-0')
                        }
                        style={{ willChange: 'opacity, transform' }}
                    >
                        <form onSubmit={handleLogin} className="animate-fadeInUp">
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Email</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-blue-500"><FaEnvelope /></span>
                                    <input name="email" type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} onBlur={() => setLoginTouched(t => ({ ...t, email: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${loginTouched.email && !loginForm.email ? 'border-red-500' : ''}`} required placeholder="Ej: correo@dominio.com" />
                                </div>
                                {loginTouched.email && !loginForm.email && <span className="text-xs text-red-500">El email es obligatorio</span>}
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Contraseña</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-purple-500"><FaLock /></span>
                                    <input name="password" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} onBlur={() => setLoginTouched(t => ({ ...t, password: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white ${loginTouched.password && !loginForm.password ? 'border-red-500' : ''}`} required placeholder="Mínimo 6 caracteres" />
                                </div>
                                {loginTouched.password && !loginForm.password && <span className="text-xs text-red-500">La contraseña es obligatoria</span>}
                            </div>
                            <button type="submit" className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:brightness-110"><FaUserCircle /> Iniciar sesión</button>
                        </form>
                    </div>
                    <div
                        key={tab + '-register'}
                        className={
                            `absolute inset-0 transition-all duration-400 ease-in-out ` +
                            (tab === 'register' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-4 pointer-events-none z-0')
                        }
                        style={{ willChange: 'opacity, transform' }}
                    >
                        <form onSubmit={handleRegister} className="animate-fadeInUp">
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Nombre</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-blue-500"><FaUser /></span>
                                    <input name="firstName" value={registerForm.firstName} onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))} onBlur={() => setRegisterTouched(t => ({ ...t, firstName: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${registerTouched.firstName && !registerForm.firstName ? 'border-red-500' : ''}`} required placeholder="Ej: Juan" />
                                </div>
                                {registerTouched.firstName && !registerForm.firstName && <span className="text-xs text-red-500">El nombre es obligatorio</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Apellido</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-blue-500"><FaUser /></span>
                                    <input name="lastName" value={registerForm.lastName} onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))} onBlur={() => setRegisterTouched(t => ({ ...t, lastName: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${registerTouched.lastName && !registerForm.lastName ? 'border-red-500' : ''}`} required placeholder="Ej: Pérez" />
                                </div>
                                {registerTouched.lastName && !registerForm.lastName && <span className="text-xs text-red-500">El apellido es obligatorio</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Email</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-blue-500"><FaEnvelope /></span>
                                    <input name="email" type="email" value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} onBlur={() => setRegisterTouched(t => ({ ...t, email: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${registerTouched.email && !registerForm.email ? 'border-red-500' : ''}`} required placeholder="Ej: correo@dominio.com" />
                                </div>
                                {registerTouched.email && !registerForm.email && <span className="text-xs text-red-500">El email es obligatorio</span>}
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Contraseña</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-purple-500"><FaLock /></span>
                                    <input name="password" type="password" value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} onBlur={() => setRegisterTouched(t => ({ ...t, password: true }))} className={`w-full pl-8 px-2 py-1 rounded-md border text-sm focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white ${registerTouched.password && !registerForm.password ? 'border-red-500' : ''}`} required placeholder="Mínimo 6 caracteres" />
                                </div>
                                {registerTouched.password && !registerForm.password && <span className="text-xs text-red-500">La contraseña es obligatoria</span>}
                            </div>
                            <button type="submit" className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:brightness-110"><FaUserPlus /> Registrarse</button>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`
                .animate-fadeInDown { animation: fadeInDown 0.7s cubic-bezier(.39,.575,.565,1) both; }
                .animate-fadeInUp { animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1) both; }
                @keyframes fadeInDown { 0% { opacity: 0; transform: translateY(-30px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0); } }
                .animate-float { animation: float 6s ease-in-out infinite; }
                @keyframes float2 { 0% { transform: translateY(0); } 50% { transform: translateY(30px); } 100% { transform: translateY(0); } }
                .animate-float2 { animation: float2 8s ease-in-out infinite; }
            `}</style>
        </main>
    );
}
