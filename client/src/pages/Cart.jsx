import { useEffect, useState, useContext, useRef } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { UserContext } from '../context/UserContext.jsx';
import 'react-toastify/dist/ReactToastify.css';

export default function Cart() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    // carritosEnProgreso: { [storeId]: { cartId, products: [] } }
    const [carritosEnProgreso, setCarritosEnProgreso] = useState({});
    const [cartActionLoading, setCartActionLoading] = useState({}); // { [productId]: boolean }
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [products, setProducts] = useState([]);
    const [groupedProducts, setGroupedProducts] = useState([]);
    const [historialCarritos, setHistorialCarritos] = useState([]);
    const [historialVisible, setHistorialVisible] = useState(false);
    const [expandedHistorial, setExpandedHistorial] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL;
    const cartCreatedRef = useRef(false);
    const initCartRef = useRef();

    // Eliminar carritos vacíos del estado antes de renderizar
    useEffect(() => {
        if (Object.keys(carritosEnProgreso).length) {
            const nuevosCarritos = { ...carritosEnProgreso };
            let modificado = false;
            const eliminarCarritoBD = async (cartId) => {
                if (!cartId || !token) return;
                try {
                    await fetch(`${API_URL}/api/carts/${cartId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } catch (err) {
                    // No mostrar error al usuario
                }
            };
            Object.entries(carritosEnProgreso).forEach(([storeId, carrito]) => {
                if (!carrito.products || carrito.products.length === 0) {
                    delete nuevosCarritos[storeId];
                    modificado = true;
                    eliminarCarritoBD(carrito.cartId);
                }
            });
            if (modificado) setCarritosEnProgreso(nuevosCarritos);
        }
    }, [carritosEnProgreso, token, API_URL]);

    // Mover fetchProductDetails fuera del useEffect
    async function fetchProductDetails(productsInCart) {
        const detalles = await Promise.all(
            productsInCart.map(async ({ productId, quantity }) => {
                let prodId;
                if (typeof productId === 'object' && productId !== null) {
                    prodId = productId._id || productId.id || productId.toString();
                } else {
                    prodId = productId;
                }
                const res = await fetch(`${API_URL}/api/products/${prodId}`);
                if (!res.ok) throw new Error('Error al cargar producto ' + prodId);
                const product = await res.json();
                return { ...product, quantity };
            })
        );
        // Obtener info de tienda para cada producto
        const storeIds = [...new Set(detalles.map(p => p.store))];
        const storeInfoMap = {};
        await Promise.all(storeIds.map(async (storeId) => {
            if (!storeId) return;
            const res = await fetch(`${API_URL}/api/store/${storeId}`);
            if (res.ok) {
                const data = await res.json();
                // Si el endpoint devuelve { store, products }
                storeInfoMap[storeId] = data.store || data;
            }
        }));
        // Adjuntar info de tienda a cada producto
        const productosConTienda = detalles.map(p => ({
            ...p,
            storeInfo: storeInfoMap[p.store] || null
        }));
        return productosConTienda;
    }

    useEffect(() => {
        // Redirigir si no hay usuario o si es admin
        if (!user || user.role === 'admin') {
            navigate('/');
            return;
        }

        if (!token) {
            setError('Debes iniciar sesión para ver el carrito');
            setLoading(false);
            return;
        }

        async function initCart() {
            try {
                setLoading(true);
                setError(null);
                // Obtener historial para buscar carritos in_progress
                const historyRes = await fetch(`${API_URL}/api/carts/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const history = await historyRes.json();
                if (!historyRes.ok) throw new Error(history.error || 'Error al obtener historial');

                // Agrupar carritos in_progress por tienda
                const carritosPorTienda = {};
                for (const cart of history) {
                    if (cart.status === 'in_progress' && cart.storeId) {
                        // Obtener productos del carrito
                        const productosRes = await fetch(`${API_URL}/api/carts/${cart._id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const productosInCart = await productosRes.json();
                        if (!productosRes.ok) continue;
                        // Obtener detalles completos de productos y añadir cantidades
                        const productosConDetalles = await fetchProductDetails(productosInCart);
                        carritosPorTienda[cart.storeId] = {
                            cartId: cart._id,
                            products: productosConDetalles,
                            storeId: cart.storeId
                        };
                    }
                }
                setCarritosEnProgreso(carritosPorTienda);
                // Seleccionar la primera tienda por defecto si hay alguna
                if (!selectedStoreId && Object.keys(carritosPorTienda).length > 0) {
                    setSelectedStoreId(Object.keys(carritosPorTienda)[0]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        initCartRef.current = initCart;
        initCart();
    }, [token, user, navigate]);

    // Calcular total del carrito seleccionado
    const total = selectedStoreId && carritosEnProgreso[selectedStoreId]
        ? carritosEnProgreso[selectedStoreId].products.reduce((acc, p) => acc + (p.price || 0) * p.quantity, 0)
        : 0;

    async function handleAddToCart(product) {
        const storeId = product.store;
        const carrito = carritosEnProgreso[storeId];
        if (cartActionLoading[product._id]) return;
        setCartActionLoading(prev => ({ ...prev, [product._id]: true }));
        if (!token || !carrito?.cartId) {
            setCartActionLoading(prev => ({ ...prev, [product._id]: false }));
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/carts/${carrito.cartId}/product/${product._id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al agregar producto');
            toast.success('Producto agregado al carrito');
            // Refrescar productos del carrito
            const productosRes = await fetch(`${API_URL}/api/carts/${carrito.cartId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const productosInCart = await productosRes.json();
            if (!productosRes.ok) throw new Error(productosInCart.error || 'Error al cargar carrito');
            const productosConDetalles = await fetchProductDetails(productosInCart);
            setCarritosEnProgreso(prev => ({
                ...prev,
                [storeId]: {
                    ...prev[storeId],
                    products: productosConDetalles
                }
            }));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCartActionLoading(prev => ({ ...prev, [product._id]: false }));
        }
    }

    async function handleRemoveFromCart(product) {
        const storeId = product.store;
        const carrito = carritosEnProgreso[storeId];
        if (cartActionLoading[product._id]) return;
        setCartActionLoading(prev => ({ ...prev, [product._id]: true }));
        if (!token || !carrito?.cartId || product.quantity === 0) {
            setCartActionLoading(prev => ({ ...prev, [product._id]: false }));
            return;
        }
        try {
            if (product.quantity > 1) {
                // PUT para actualizar cantidad
                const res = await fetch(`${API_URL}/api/carts/${carrito.cartId}/product/${product._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ quantity: product.quantity - 1 })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al descontar producto');
                toast.success('Cantidad actualizada');
            } else {
                // DELETE para eliminar producto
                const res = await fetch(`${API_URL}/api/carts/${carrito.cartId}/product/${product._id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al quitar producto');
                toast.success('Producto quitado del carrito');
            }
            // Refrescar productos del carrito
            const productosRes = await fetch(`${API_URL}/api/carts/${carrito.cartId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const productosInCart = await productosRes.json();
            if (!productosRes.ok) throw new Error(productosInCart.error || 'Error al cargar carrito');
            // Si el carrito quedó vacío, eliminarlo en el backend y del estado
            if (!productosInCart.length) {
                await fetch(`${API_URL}/api/carts/${carrito.cartId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCarritosEnProgreso(prev => {
                    const nuevo = { ...prev };
                    delete nuevo[storeId];
                    return nuevo;
                });
            } else {
                const productosConDetalles = await fetchProductDetails(productosInCart);
                setCarritosEnProgreso(prev => ({
                    ...prev,
                    [storeId]: {
                        ...prev[storeId],
                        products: productosConDetalles
                    }
                }));
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCartActionLoading(prev => ({ ...prev, [product._id]: false }));
        }
    }

    // Nueva función para productos inactivos o sin stock
    async function handleRemoveInactiveOrNoStock(product) {
        const storeId = product.store;
        const carrito = carritosEnProgreso[storeId];
        if (cartActionLoading[product._id]) return;
        setCartActionLoading(prev => ({ ...prev, [product._id]: true }));
        if (!token || !carrito?.cartId || product.quantity === 0) {
            setCartActionLoading(prev => ({ ...prev, [product._id]: false }));
            return;
        }
        try {
            // DELETE para eliminar producto
            const res = await fetch(`${API_URL}/api/carts/${carrito.cartId}/product/${product._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al quitar producto');
            toast.success('Producto quitado del carrito');
            // Refrescar productos del carrito
            const productosRes = await fetch(`${API_URL}/api/carts/${carrito.cartId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const productosInCart = await productosRes.json();
            if (!productosRes.ok) throw new Error(productosInCart.error || 'Error al cargar carrito');
            const productosConDetalles = await fetchProductDetails(productosInCart);
            setCarritosEnProgreso(prev => ({
                ...prev,
                [storeId]: {
                    ...prev[storeId],
                    products: productosConDetalles
                }
            }));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCartActionLoading(prev => ({ ...prev, [product._id]: false }));
        }
    }

    async function cargarHistorial() {
        try {
            setError(null);
            const res = await fetch(`${API_URL}/api/carts/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al obtener historial');
            const pagos = data.filter(c => c.status === 'paid');
            // Para cada carrito pagado, obtener detalles de productos y agrupar por tienda
            const pagosConDetalles = await Promise.all(
                pagos.map(async (carrito) => {
                    // carrito.products: [{ productId, quantity }]
                    const productos = await Promise.all(
                        (carrito.products || []).map(async ({ productId, quantity }) => {
                            let prodId = productId;
                            if (typeof prodId === 'object' && prodId !== null) {
                                prodId = prodId._id || prodId.id || prodId.toString();
                            }
                            const res = await fetch(`${API_URL}/api/products/${prodId}`);
                            if (!res.ok) return { title: 'Producto eliminado', price: 0, quantity };
                            const prod = await res.json();
                            return { ...prod, quantity };
                        })
                    );
                    // Agrupar productos por tienda (incluyendo los que no tienen tienda)
                    // Agrupar productos por tienda (incluyendo los que no tienen tienda)
                    const grouped = {};
                    // Primero obtener todos los storeIds únicos
                    const storeIds = [...new Set(productos.map(p => p.store || 'no-store'))];
                    // Obtener info de tienda para cada storeId
                    const storeInfoMap = {};
                    await Promise.all(storeIds.map(async (storeId) => {
                        if (storeId !== 'no-store') {
                            const res = await fetch(`${API_URL}/api/store/${storeId}`);
                            if (res.ok) {
                                const data = await res.json();
                                storeInfoMap[storeId] = data.store || data;
                            }
                        } else {
                            storeInfoMap[storeId] = { storeName: 'Sin tienda', whatsapp: '', _id: 'no-store' };
                        }
                    }));
                    // Agrupar productos por tienda
                    storeIds.forEach(storeId => {
                        grouped[storeId] = { storeInfo: storeInfoMap[storeId], products: [] };
                    });
                    productos.forEach(p => {
                        const storeId = p.store || 'no-store';
                        grouped[storeId].products.push(p);
                    });
                    return { ...carrito, groupedStores: Object.values(grouped) };
                })
            );
            setHistorialCarritos(pagosConDetalles);
            setHistorialVisible(true);
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <span className="text-lg font-semibold">Cargando carrito...</span>
            </div>
        </div>
    );
    if (error) {
        return (
            <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-6 py-12">
                <div className="animate-fadeInDown bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto text-center shadow">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </main>
        );
    }


    return (
        <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-6 py-12">
            <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <h1 className="animate-fadeInDown text-3xl font-bold mb-8 text-gray-900 dark:text-white">Tu Carrito</h1>

            {Object.keys(carritosEnProgreso).length ? (
                <ul className="space-y-10 max-w-3xl mx-auto">
                    {Object.values(carritosEnProgreso)
                        .filter(carrito => carrito.products && carrito.products.length > 0)
                        .map((carrito, idx) => (
                            <li key={carrito.cartId || idx} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                                        {carrito.products[0]?.storeInfo?.storeName || 'Tienda desconocida'}
                                    </span>
                                    {carrito.products[0]?.storeInfo?.whatsapp && (
                                        <a
                                            href={`https://wa.me/${carrito.products[0].storeInfo.whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-green-600 hover:text-green-800"
                                            title="Contactar por WhatsApp"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.624.39 3.21 1.13 4.63L2 22l5.486-1.115A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.57 0-3.1-.37-4.47-1.08l-.32-.16-3.25.66.62-3.17-.21-.33A7.963 7.963 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.13-5.19c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.15-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.29-1.22-1.51-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.5-1.21-.68-1.66-.18-.44-.36-.38-.5-.39-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.28-.21.22-.8.78-.8 1.9s.82 2.21.93 2.37c.11.15 1.62 2.48 3.93 3.38.55.19.98.3 1.31.38.55.14 1.05.12 1.45.07.44-.05 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.14-.42-.25z" /></svg>
                                        </a>
                                    )}
                                </div>
                                <ul className="space-y-6">
                                    {carrito.products.map((p) => (
                                        <li
                                            key={p._id}
                                            className="animate-fadeInDown bg-white dark:bg-gray-800 p-4 rounded shadow flex flex-col sm:flex-row items-center gap-4 justify-between"
                                        >
                                            <img
                                                src={p.thumbnails?.[0] || 'https://placehold.co/120x120'}
                                                alt={p.title}
                                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md shadow-md flex-shrink-0 bg-gray-100 dark:bg-gray-900 mx-auto sm:mx-0"
                                            />
                                            <div className="flex-1 min-w-0 w-full">
                                                <h2 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{p.title}</h2>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                    Precio: ${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'}
                                                </p>
                                                {(p.stock === 0 || p.status === false) && (
                                                    <div className="mt-2 flex gap-2 items-center">
                                                        {p.stock === 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-red-400 to-red-600 text-white text-xs font-bold shadow">
                                                                Sin stock
                                                            </span>
                                                        )}
                                                        {p.status === false && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-bold shadow">
                                                                Producto inactivo
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-row items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                                {(p.stock === 0 || p.status === false) ? (
                                                    <button
                                                        onClick={() => handleRemoveInactiveOrNoStock(p)}
                                                        className="bg-gray-300 hover:bg-red-600 text-gray-700 hover:text-white px-3 py-2 rounded-full shadow-md"
                                                        title="Eliminar producto"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleRemoveFromCart(p)}
                                                            className={`rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white h-9 w-9 flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400${cartActionLoading[p._id] ? ' opacity-50 cursor-not-allowed' : ''}`}
                                                            title={p.quantity > 1 ? "Quitar uno" : "Eliminar producto"}
                                                            disabled={cartActionLoading[p._id]}
                                                        >
                                                            {p.quantity > 1 ? '–' : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                                                        </button>
                                                        <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-full px-3 py-2 text-base shadow-sm text-center min-w-[40px]">
                                                            {p.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleAddToCart(p)}
                                                            className={`rounded-full bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white h-9 w-9 flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400${cartActionLoading[p._id] ? ' opacity-50 cursor-not-allowed' : ''}`}
                                                            title="Agregar uno"
                                                            disabled={cartActionLoading[p._id]}
                                                        >
                                                            +
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            <span className="px-2 font-semibold text-gray-900 dark:text-white text-base">
                                                ${(p.price * p.quantity).toFixed(2)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="animate-fadeInDown mt-8 flex justify-between items-center max-w-3xl mx-auto">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">Total: {carrito.products.reduce((acc, p) => acc + (p.price || 0) * p.quantity, 0).toFixed(2)}</p>
                                    <button
                                        onClick={async () => {
                                            try {
                                                // Confirmar compra
                                                const res = await fetch(`${API_URL}/api/carts/${carrito.cartId}/pay`, {
                                                    method: 'POST',
                                                    headers: { Authorization: `Bearer ${token}` },
                                                });
                                                const data = await res.json();
                                                if (!res.ok) throw new Error(data.error || 'Error al confirmar la compra. Por Favor, refresca la página e intenta nuevamente.');
                                                toast.success('Compra realizada con éxito');
                                                // Refrescar carritos
                                                setCarritosEnProgreso(prev => {
                                                    const nuevo = { ...prev };
                                                    delete nuevo[carrito.storeId];
                                                    return nuevo;
                                                });
                                                // SweetAlert antes de abrir WhatsApp
                                                await Swal.fire({
                                                    title: '¡Muchas gracias!',
                                                    text: 'A continuación se abrirá una pantalla para que puedas contactar al vendedor por WhatsApp y finalizar tu compra. Podés ver tu compra en tu historial de pedidos.',
                                                    icon: 'success',
                                                    confirmButtonText: 'Contactar por WhatsApp'
                                                });
                                                // WhatsApp
                                                if (carrito && user) {
                                                    const productos = carrito.products.map(p => `- ${p.title} x${p.quantity} ($${(p.price * p.quantity).toFixed(2)})`).join('%0A');
                                                    let nombreUsuario = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                                                    if (!nombreUsuario) nombreUsuario = user.name || user.username || 'Cliente';
                                                    const mensaje = `Hola, mi nombre es ${nombreUsuario}, me comunico desde TuTienda Ecommerce para comprar:%0A${productos}%0A%0AMuchas gracias`;
                                                    const telefonoVendedor = carrito.products[0]?.storeInfo?.whatsapp || '549XXXXXXXXXX'; // Reemplaza por el número real
                                                    const url = `https://wa.me/${telefonoVendedor}?text=${mensaje}`;
                                                    window.open(url, '_blank');
                                                }
                                            } catch (err) {
                                                toast.error(err.message);
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                                    >
                                        Confirmar compra
                                    </button>
                                </div>
                            </li>
                        ))}
                </ul>
            ) : (
                <p className="animate-fadeInDown text-center text-gray-600 dark:text-gray-300">No tienes carritos en progreso.</p>
            )}

            <div className="animate-fadeInDown mt-10 text-center max-w-3xl mx-auto">
                {!historialVisible ? (
                    <button
                        onClick={cargarHistorial}
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Ver historial de compras
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => setHistorialVisible(false)}
                            className="animate-fadeInDown text-red-600 hover:underline font-medium mb-4"
                        >
                            Ocultar historial
                        </button>
                        <h2 className="animate-fadeInDown text-xl font-semibold mt-4 mb-4 text-gray-900 dark:text-white">Historial de Compras</h2>
                        {historialCarritos.length ? (
                            <ul className="animate-fadeInDown space-y-4">
                                {historialCarritos.map((carrito) => {
                                    const id = carrito._id || carrito.id;
                                    const expanded = expandedHistorial[id];
                                    return (
                                        <li
                                            key={id}
                                            className="bg-white dark:bg-gray-800 p-4 rounded shadow"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-gray-800 dark:text-gray-200 font-semibold">ID Pedido: {id}</p>
                                                    <p className="text-sm text-gray-500">Productos: {carrito.products?.length || 0}</p>
                                                    <p className="text-sm text-gray-500">Estado: {carrito.status}</p>
                                                    {carrito.paidAt && (
                                                        <p className="text-sm text-gray-500">Pagado: {new Date(carrito.paidAt).toLocaleString()}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setExpandedHistorial(e => ({ ...e, [id]: !expanded }))}
                                                    className="ml-4 px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-medium"
                                                >
                                                    {expanded ? 'Cerrar' : 'Ver productos'}
                                                </button>
                                            </div>
                                            {expanded && (
                                                <ul className="mt-4 space-y-6">
                                                    {carrito.groupedStores.map((group, idx) => (
                                                        <li key={group.storeInfo?._id || idx} className="bg-gray-50 dark:bg-gray-900 p-3 rounded mb-2">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-bold text-base text-gray-900 dark:text-white">
                                                                    {group.storeInfo?.storeName || 'Tienda desconocida'}
                                                                </span>
                                                                {group.storeInfo?.whatsapp && (
                                                                    <a
                                                                        href={`https://wa.me/${group.storeInfo.whatsapp}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="ml-2 text-green-600 hover:text-green-800"
                                                                        title="Contactar por WhatsApp"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.624.39 3.21 1.13 4.63L2 22l5.486-1.115A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.57 0-3.1-.37-4.47-1.08l-.32-.16-3.25.66.62-3.17-.21-.33A7.963 7.963 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.13-5.19c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.15-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.29-1.22-1.51-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.5-1.21-.68-1.66-.18-.44-.36-.38-.5-.39-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.28-.21.22-.8.78-.8 1.9s.82 2.21.93 2.37c.11.15 1.62 2.48 3.93 3.38.55.19.98.3 1.31.38.55.14 1.05.12 1.45.07.44-.05 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.14-.42-.25z" /></svg>
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <ul className="space-y-2">
                                                                {group.products.map((p, idx2) => (
                                                                    <li key={p._id || idx2} className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                                                                        <img
                                                                            src={p.thumbnails?.[0] || 'https://placehold.co/80x80'}
                                                                            alt={p.title}
                                                                            className="w-12 h-12 object-cover rounded-md shadow bg-gray-100 dark:bg-gray-900 flex-shrink-0"
                                                                        />
                                                                        <span className="font-semibold text-gray-900 dark:text-white truncate">{p.title}</span>
                                                                        <span className="ml-2 text-gray-700 dark:text-gray-300">x{p.quantity}</span>
                                                                        <span className="ml-2 text-gray-700 dark:text-gray-300">${typeof p.price === 'number' ? p.price.toFixed(2) : 'N/A'}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">No hay compras anteriores.</p>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
