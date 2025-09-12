import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus, FaUserShield, FaHistory, FaEye, FaEyeSlash, FaChevronDown, FaList, FaFilter, FaSearch, FaListAlt, FaCheckCircle, FaBan } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';
import EditProductModal from '../components/EditProductModal';
import CreateProductModal from '../components/CreateProductModal';
import CreateAdminModal from '../components/CreateAdminModal';
import HistoryModal from '../components/HistoryModal';

export default function AdminPanel() {
    // Referencias para los detalles
    const adminDetailsRef = React.useRef(null);
    const productsDetailsRef = React.useRef(null);
    const [adminOpen, setAdminOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showActivos, setShowActivos] = useState(true);
    const [search, setSearch] = useState("");
    const [showList, setShowList] = useState(true);
    const [stockFilter, setStockFilter] = useState('todos'); // 'todos', 'conStock', 'sinStock'
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    async function handleShowHistory() {
        setShowHistory(true);
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/carts/paid`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener historial');
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message || 'Error al obtener historial');
        } finally {
            setLoadingHistory(false);
        }
    }

    async function handleCreateAdmin(form) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/create-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...form, role: 'admin' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear admin');
            toast.success('Admin creado correctamente');
            setShowCreateAdmin(false);
        } catch (err) {
            toast.error(err.message || 'Error al crear admin');
        }
    }

    useEffect(() => {
        // Obtener usuario desde el token (ejemplo simple)
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }
        // Decodificar el token para obtener el rol (puedes usar jwt-decode)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser(payload);
            if (payload.role !== 'admin') {
                navigate('/');
            }
        } catch {
            navigate('/auth');
        }
    }, [navigate]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/products/`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                setError('Error al cargar productos');
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    function handleDelete(id) {
        setDeleteId(id);
        setShowConfirm(true);
    }

    async function confirmDelete() {
        try {
            const token = localStorage.getItem('token');
            // Cambia el estado a inactivo y el stock a 0
            const res = await fetch(`${API_URL}/api/products/${deleteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: false, stock: 0 }),
            });
            if (!res.ok) throw new Error('Error al eliminar');
            setProducts(products.map(p => (p._id === deleteId || p.id === deleteId) ? { ...p, status: false, stock: 0 } : p));
        } catch {
            alert('No se pudo eliminar el producto');
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    }

    async function handleReactivate(id) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: true }),
            });
            if (!res.ok) throw new Error('Error al reactivar');
            setProducts(products.map(p => (p._id === id || p.id === id) ? { ...p, status: true } : p));
            toast.success('Producto reactivado');
        } catch {
            toast.error('No se pudo reactivar el producto');
        }
    }

    function handleEdit(product) {
        setEditProduct(product);
        setShowEdit(true);
    }

    async function saveEdit(form) {
        try {
            // Mostrar datos recibidos
            console.log('AdminPanel: saveEdit form:', form);
            const token = localStorage.getItem('token');
            // Usar id recibido del modal
            const productId = form.id;
            console.log('AdminPanel: saveEdit productId:', productId);
            console.log('AdminPanel: saveEdit body:', form.body);
            const res = await fetch(`${API_URL}/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form.body),
            });
            if (!res.ok) throw new Error('Error al editar producto');
            const updated = await res.json();
            setProducts(products.map(p => (p._id === productId || p.id === productId) ? updated : p));
            setShowEdit(false);
            setEditProduct(null);
        } catch (err) {
            console.error('AdminPanel: saveEdit error:', err);
            alert('No se pudo editar el producto');
        }
    }

    async function saveCreate(form) {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/products/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Error al crear producto');
            const created = await res.json();
            setProducts([...products, created]);
            setShowCreate(false);
        } catch {
            alert('No se pudo crear el producto');
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <span className="text-lg font-semibold">Cargando panel...</span>
            </div>
        </div>
    );
    if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

    return (
        <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-6 py-12">
            <ToastContainer position="top-right" autoClose={2500} />
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Panel de Administración</h1>
            {/* Menú desplegable de acciones admin */}
            <div className="mb-8 flex flex-col items-start relative">
                <details className="w-full" ref={adminDetailsRef} onToggle={e => setAdminOpen(adminDetailsRef.current?.open)}>
                    <summary className="cursor-pointer px-6 py-3 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-200 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between gap-3 select-none">
                        <span className="flex items-center gap-3">
                            Acciones de administrador
                        </span>
                        <FaChevronDown className={`text-xl opacity-70 ml-2 transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`} />
                    </summary>
                    <div className="flex flex-col gap-3 mt-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 backdrop-blur-md">
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-blue-200 hover:bg-blue-300 text-blue-800 shadow-sm transition-all duration-150"
                        >
                            <FaPlus className="text-xl" /> Crear producto
                        </button>
                        <button
                            onClick={() => setShowCreateAdmin(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-green-100 hover:bg-green-200 text-green-800 shadow-sm transition-all duration-150"
                        >
                            <FaUserShield className="text-xl" /> Crear admin
                        </button>
                        <button
                            onClick={handleShowHistory}
                            className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-purple-100 hover:bg-purple-200 text-purple-800 shadow-sm transition-all duration-150"
                        >
                            <FaHistory className="text-xl" /> Ver historial de compras
                        </button>
                    </div>
                </details>
                {/* Menú de productos con filtro y selector activos/inactivos */}
                {products.length > 0 && (
                    <details className="w-full mt-6" ref={productsDetailsRef} onToggle={e => setProductsOpen(productsDetailsRef.current?.open)}>
                        <summary className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 text-blue-700 dark:text-blue-200 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between gap-3 select-none">
                            <span className="flex items-center gap-3">
                                <FaList className="text-xl text-blue-400 dark:text-blue-300" /> Administrar productos
                            </span>
                            <FaChevronDown className={`text-xl opacity-70 ml-2 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
                        </summary>
                        <div className="flex flex-col gap-4 mt-4 p-4 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 backdrop-blur-md">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end w-full">
                                {/* Filtro: Estado */}
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                                        <FaFilter className="text-blue-400 text-[14px]" /> Estado
                                    </label>
                                    <select
                                        value={showActivos ? 'activos' : 'inactivos'}
                                        onChange={e => setShowActivos(e.target.value === 'activos')}
                                        className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-950 dark:text-white transition text-xs"
                                    >
                                        <option value="activos">Activos</option>
                                        <option value="inactivos">Inactivos</option>
                                    </select>
                                </div>
                                {/* Filtro: Buscar */}
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
                                        <FaSearch className="text-purple-400 text-[14px]" /> Buscar
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre..."
                                        className="w-full px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:bg-purple-950 dark:text-white transition text-xs"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                {/* Filtro: Stock */}
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                                        <FaListAlt className="text-green-400 text-[14px]" /> Stock
                                    </label>
                                    <select
                                        value={stockFilter}
                                        onChange={e => setStockFilter(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-green-200 dark:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-green-950 dark:text-white transition text-xs"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="conStock">Con stock</option>
                                        <option value="sinStock">Sin stock</option>
                                    </select>
                                </div>
                                {/* Filtro: Listado */}
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="flex items-center gap-1 text-xs font-semibold text-pink-700 dark:text-pink-300 mb-1">
                                        <FaListAlt className="text-pink-400 text-[14px]" /> Listado
                                    </label>
                                    <button
                                        onClick={() => setShowList(v => !v)}
                                        className={`w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium border border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-pink-950 text-pink-800 dark:text-pink-100 text-xs transition-all duration-150 ${showList ? 'opacity-100' : 'opacity-60'}`}
                                    >
                                        {showList ? <FaEyeSlash className="text-pink-500" /> : <FaEye className="text-green-500" />}
                                        {showList ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </details>
                )}
            </div>
            {/* Listado de productos filtrados */}
            {showList && productsOpen && (
                <ul className="space-y-4 max-w-3xl mx-auto">
                    {products
                        .filter(p => showActivos ? p.status : !p.status)
                        .filter(p => {
                            if (stockFilter === 'conStock') return p.stock > 0;
                            if (stockFilter === 'sinStock') return p.stock === 0;
                            return true;
                        })
                        .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))
                        .map((p) => (
                            <li key={p._id || p.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex items-center gap-4">
                                <img
                                    src={p.thumbnails?.[0] || 'https://placehold.co/100x100'}
                                    alt={p.title}
                                    className="w-16 h-16 object-cover rounded-md shadow-md flex-shrink-0 bg-gray-100 dark:bg-gray-900"
                                />
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{p.title}</h2>
                                    <p className="text-gray-700 dark:text-gray-300">${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
                                        style={{ display: p.status ? 'inline-block' : 'none' }}
                                    >
                                        Editar
                                    </button>
                                    {p.status ? (
                                        <button
                                            onClick={() => handleDelete(p._id || p.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                                        >
                                            Eliminar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReactivate(p._id || p.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                                        >
                                            Reactivar
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                </ul>
            )}

            <CreateAdminModal
                open={showCreateAdmin}
                onSave={handleCreateAdmin}
                onCancel={() => setShowCreateAdmin(false)}
            />

            {/* Modal para historial de compras */}
            <HistoryModal
                open={showHistory}
                loading={loadingHistory}
                history={history}
                onClose={() => setShowHistory(false)}
            />

            <CreateProductModal
                open={showCreate}
                onSave={saveCreate}
                onCancel={() => setShowCreate(false)}
            />
            <EditProductModal
                open={showEdit}
                product={editProduct}
                onSave={saveEdit}
                onCancel={() => { setShowEdit(false); setEditProduct(null); }}
            />
            <ConfirmModal
                open={showConfirm}
                title="Confirmar eliminación"
                message="¿Seguro que quieres eliminar este producto?"
                onConfirm={confirmDelete}
                onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
            />
        </main>
    );
}