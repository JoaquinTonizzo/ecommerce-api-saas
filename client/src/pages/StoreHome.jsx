import React, { useEffect, useState, useContext, useRef } from 'react';
import EditableStoreInfo from '../components/EditableStoreInfo';
import { UserContext } from '../context/UserContext';
import ProductModal from '../components/ProductModal';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StoreHome = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  // cartInfo: { cartId, items } para la tienda actual
  const [cartInfo, setCartInfo] = useState({ cartId: null, items: {} });
  const [cartActionLoading, setCartActionLoading] = useState({}); // { [productId]: boolean }
  const modalRef = useRef();
  const { user } = useContext(UserContext);
  const isAdmin = user?.role === 'admin';
  const API_URL = import.meta.env.VITE_API_URL || '';

  async function handleAddToCart(producto) {
    if (cartActionLoading[producto._id]) return;
    setCartActionLoading(prev => ({ ...prev, [producto._id]: true }));
    if (isAdmin) {
      toast.error('Los administradores no pueden agregar productos al carrito');
      setCartActionLoading(prev => ({ ...prev, [producto._id]: false }));
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      setCartActionLoading(prev => ({ ...prev, [producto._id]: false }));
      return;
    }
    try {
      let cartId = cartInfo.cartId;
      // Si no hay carrito para esta tienda, crear uno
      if (!cartId) {
        const createRes = await fetch(`${API_URL}/api/carts`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ storeId: id }),
        });
        const nuevoCarrito = await createRes.json();
        if (!createRes.ok) throw new Error(nuevoCarrito.error || 'Error al crear carrito');
        cartId = nuevoCarrito._id;
      }
      // Agregar producto
      const addRes = await fetch(`${API_URL}/api/carts/${cartId}/product/${producto._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const addData = await addRes.json();
      if (!addRes.ok) throw new Error(addData.error || 'Error al agregar producto al carrito');
      // Sincronizar cantidades con backend
      const cartRes = await fetch(`${API_URL}/api/carts/${cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartProducts = await cartRes.json();
      if (!cartRes.ok) throw new Error(cartProducts.error || 'Error al obtener productos del carrito');
      const items = {};
      for (const p of cartProducts) {
        let prodId = p.productId;
        if (typeof prodId === 'object' && prodId !== null) {
          prodId = prodId._id || prodId.id || prodId.toString();
        }
        if (!prodId) prodId = p._id;
        items[prodId] = p.quantity;
      }
      setCartInfo({ cartId, items });
      toast.success('Producto agregado al carrito');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCartActionLoading(prev => ({ ...prev, [producto._id]: false }));
    }
  }

  async function handleRemoveFromCart(producto) {
    if (cartActionLoading[producto._id]) return;
    setCartActionLoading(prev => ({ ...prev, [producto._id]: true }));
    if (isAdmin) {
      toast.error('Los administradores no pueden quitar productos del carrito');
      setCartActionLoading(prev => ({ ...prev, [producto._id]: false }));
      return;
    }
    const token = localStorage.getItem('token');
    const cantidadActual = cartInfo.items[producto._id] || 0;
    if (!token || !cartInfo.cartId || cantidadActual < 1) {
      setCartActionLoading(prev => ({ ...prev, [producto._id]: false }));
      return;
    }
    try {
      if (cantidadActual === 1) {
        // Eliminar producto del carrito
        const res = await fetch(`${API_URL}/api/carts/${cartInfo.cartId}/product/${producto._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al quitar producto');
      } else {
        const nuevaCantidad = cantidadActual - 1;
        const res = await fetch(`${API_URL}/api/carts/${cartInfo.cartId}/product/${producto._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: nuevaCantidad }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar cantidad');
      }
      // Sincronizar cantidades con backend
      const cartRes = await fetch(`${API_URL}/api/carts/${cartInfo.cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartProducts = await cartRes.json();
      if (!cartRes.ok) throw new Error(cartProducts.error || 'Error al obtener productos del carrito');
      const items = {};
      for (const p of cartProducts) {
        let prodId = p.productId;
        if (typeof prodId === 'object' && prodId !== null) {
          prodId = prodId._id || prodId.id || prodId.toString();
        }
        if (!prodId) prodId = p._id;
        items[prodId] = p.quantity;
      }
      setCartInfo({ cartId: cartInfo.cartId, items });
      toast.success('Cantidad actualizada');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCartActionLoading(prev => ({ ...prev, [producto._id]: false }));
    }
  }
  useEffect(() => {
    async function fetchCart() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        // Obtener historial
        const historyRes = await fetch(`${API_URL}/api/carts/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const history = await historyRes.json();
        if (!historyRes.ok) throw new Error(history.error || 'Error al obtener historial de carritos');
        // Buscar carrito en progreso para esta tienda
        let carritoEnProgreso = history.find(c => c.status !== 'paid' && c.storeId === id);
        if (carritoEnProgreso) {
          const cartRes = await fetch(`${API_URL}/api/carts/${carritoEnProgreso._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const cartProducts = await cartRes.json();
          if (!cartRes.ok) throw new Error(cartProducts.error || 'Error al obtener productos del carrito');
          const items = {};
          for (const p of cartProducts) {
            let prodId = p.productId;
            if (typeof prodId === 'object' && prodId !== null) {
              prodId = prodId._id || prodId.id || prodId.toString();
            }
            if (!prodId) prodId = p._id;
            items[prodId] = p.quantity;
          }
          setCartInfo({ cartId: carritoEnProgreso._id, items });
        } else {
          setCartInfo({ cartId: null, items: {} });
        }
      } catch (err) {
        // No mostrar error si no hay carrito
      }
    }
    fetchCart();
  }, [products, id]);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`/api/store/${id}`);
        if (!res.ok) {
          const text = await res.text();
          if (text.startsWith('<!DOCTYPE')) {
            console.log('Respuesta HTML detectada en /api/store/:id:', text.slice(0, 100));
            navigate('/auth');
            return;
          }
          throw new Error('No se pudo cargar la tienda');
        }
        const data = await res.json();
        setStore(data.store);
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <span className="text-lg font-semibold">Cargando tienda...</span>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!store) return <div className="p-8 text-center">Tienda no encontrada</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-0 py-0 relative overflow-hidden">
  <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      {/* Fondo animado */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 opacity-20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-20 rounded-full blur-3xl animate-float2" />
      </div>
      <div className="relative z-10 px-6 py-12 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            {isAdmin ? (
              <EditableStoreInfo store={store} setStore={setStore} user={user} />
            ) : (
              <>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-300 dark:to-pink-300 mb-2 drop-shadow-lg">{store.storeName}</h1>
                {store.address && (
                  <p className="text-gray-600 mb-1"><span className="font-semibold">Dirección:</span> {store.address}</p>
                )}
                {store.whatsapp && (
                  <p className="text-green-600 mb-1">
                    <span className="font-semibold">WhatsApp:</span> <a href={`https://wa.me/${store.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline text-green-700 hover:text-green-900">{store.whatsapp}</a>
                  </p>
                )}
                {store.owner && (
                  <p className="text-gray-500 text-sm">Dueño: {store.owner.firstName} {store.owner.lastName}</p>
                )}
              </>
            )}
          </div>
        </div>
        {/* Productos */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200 text-center">Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fadeInUp">
          {products.length === 0 ? (
            <div className="col-span-3 text-gray-500">No hay productos en esta tienda.</div>
          ) : (
            products.map(product => {
              const sinStock = !product.stock || Number(product.stock) <= 0;
              const cantidad = cartInfo.items[product._id] || 0;
              return (
                <div
                  key={product._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-200 relative border border-blue-100 dark:border-blue-900 min-h-[120px] group flex flex-col"
                  onClick={() => setProductoSeleccionado(product)}
                >
                  {sinStock && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded font-bold text-[10px] shadow-sm z-20 pointer-events-none">SIN STOCK</span>
                  )}
                  <div className="flex flex-col gap-3 items-center h-full w-full">
                    <img
                      src={product.thumbnails?.[0] || 'https://placehold.co/250x250'}
                      alt={product.name}
                      className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] object-cover rounded-md shadow-md group-hover:scale-105 transition-all duration-200 flex-shrink-0 mx-auto"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/250x250'; }}
                    />
                    <div className="flex flex-col justify-between flex-1 h-full w-full items-center">
                      <h3 className="text-base font-bold mb-0.5 text-blue-700 dark:text-blue-300 truncate drop-shadow transition-all duration-200 text-center w-full">
                        {product.title || product.name}
                      </h3>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1 text-center w-full">
                        ${product.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-2 mt-2 justify-center w-full">
                        {!sinStock && (
                          <div className="flex w-full gap-2">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (isAdmin) {
                                  toast.error('Los administradores no pueden generar pedidos');
                                  return;
                                }
                                if (cantidad < 1) {
                                  toast.error('No puedes quitar productos si la cantidad es 0');
                                  return;
                                }
                                handleRemoveFromCart(product);
                              }}
                              className={`rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white h-8 flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 flex-1 min-w-0 text-base${cartActionLoading[product._id] ? ' opacity-50 cursor-not-allowed' : ''}`}
                              title={isAdmin ? "Los administradores no pueden generar pedidos" : cantidad < 1 ? "No puedes quitar productos si la cantidad es 0" : "Quitar uno"}
                              disabled={cartActionLoading[product._id]}
                            >
                              -
                            </button>
                            <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-full px-3 py-2 sm:py-1 text-base sm:text-xs shadow-sm text-center min-w-[40px]">
                              {cantidad}
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (isAdmin) {
                                  toast.error('Los administradores no pueden generar pedidos');
                                  return;
                                }
                                handleAddToCart(product);
                              }}
                              className={`rounded-full bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white h-8 flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 min-w-0 text-base${cartActionLoading[product._id] ? ' opacity-50 cursor-not-allowed' : ''}`}
                              title={isAdmin ? "Los administradores no pueden generar pedidos" : "Agregar uno"}
                              disabled={cartActionLoading[product._id]}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {productoSeleccionado && (
          <ProductModal
            producto={productoSeleccionado}
            onClose={() => setProductoSeleccionado(null)}
            onAddToCart={handleAddToCart}
            ref={modalRef}
          />
        )}
      </div>
    </main>
  );
}

export default StoreHome;
