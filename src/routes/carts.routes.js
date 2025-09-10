import express from 'express';
import cartManager from '../managers/CartManager.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();
const manager = cartManager;

// POST /api/carts/ => Crear nuevo carrito
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { storeId } = req.body;
    if (!storeId) return res.status(400).json({ error: 'storeId es requerido' });

    // Verificar si ya existe un carrito en progreso para ese usuario y tienda
    const existing = await manager.getCartByUserId(userId, storeId);
    if (existing) return res.status(409).json({ error: 'El usuario ya tiene un carrito en progreso para esta tienda' });

    const newCart = await manager.createCart(userId, storeId);
    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
});

// GET /api/carts/history => Obtener historial de pedidos pagados del usuario
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const history = await manager.getPurchaseHistoryByUserId(userId);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// GET /api/carts/paid => Obtener todos los carritos pagados (solo admin)
router.get('/paid', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    // Obtener el storeId del admin
    const adminStoreId = req.user.store;
    if (!adminStoreId) {
      return res.status(403).json({ error: 'El admin no tiene tienda asociada' });
    }
    // Obtener solo los carritos pagados de la tienda del admin
    const allCarts = await manager.getCarts();
    const paidCarts = allCarts.filter(cart => cart.status === 'paid' && cart.storeId?.toString() === adminStoreId.toString());
    res.json(paidCarts);
  } catch (error) {
    next(error);
  }
});

// GET /api/carts/:cid => Obtener productos del carrito
router.get('/:cid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // Solo el dueño o admin
    const userId = (req.user._id || req.user.id);
    // Si cart.userId es un ObjectId, conviértelo a string para comparar
    if (userId.toString() !== cart.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para ver este carrito' });
    }

    res.json(cart.products);
  } catch (error) {
    next(error);
  }
});

// POST /api/carts/:cid/product/:pid => Agregar producto al carrito
router.post('/:cid/product/:pid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // Validar que el carrito pertenezca al usuario autenticado
    const userId = (req.user._id || req.user.id);
    if (userId.toString() !== cart.userId.toString()) {
      return res.status(403).json({ error: 'No autorizado para modificar este carrito' });
    }

    const updatedCart = await manager.addProductToCart(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (error) {
    if (
      error.message === 'Producto no encontrado' ||
      error.message === 'Cantidad supera stock disponible' ||
      error.message === 'Producto sin stock disponible'
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/carts/:cid/product/:pid => Quitar producto del carrito
router.delete('/:cid/product/:pid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const userId = (req.user._id || req.user.id);
    if (userId.toString() !== cart.userId.toString()) {
      return res.status(403).json({ error: 'No autorizado para modificar este carrito' });
    }

    const updatedCart = await manager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (error) {
    if (error.message === 'Carrito no encontrado' || error.message === 'Producto no encontrado en el carrito') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// PUT /api/carts/:cid/product/:pid => Actualizar cantidad de producto en carrito
router.put('/:cid/product/:pid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const userId = (req.user._id || req.user.id);
    if (userId.toString() !== cart.userId.toString()) {
      return res.status(403).json({ error: 'No autorizado para modificar este carrito' });
    }

    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Cantidad inválida. Debe ser un número entero mayor o igual a 1.' });
    }

    const updatedCart = await manager.updateProductQuantity(req.params.cid, req.params.pid, quantity);

    if (!updatedCart) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.json(updatedCart);
  } catch (error) {
    if (
      error.message === 'Producto no encontrado' ||
      error.message === 'Cantidad supera stock disponible'
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/carts/:cid => Eliminar carrito (sólo dueño)
router.delete('/:cid', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // Validar que el carrito pertenezca al usuario autenticado
    const userId = (req.user._id || req.user.id);
    if (userId.toString() !== cart.userId.toString()) {
      return res.status(403).json({ error: 'No autorizado para eliminar este carrito' });
    }

    await manager.deleteCart(req.params.cid);

    res.json({ message: 'Carrito eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

// POST /api/carts/:cid/pay => Pagar el carrito
router.post('/:cid/pay', authenticateToken, async (req, res, next) => {
  try {
    const cart = await manager.getCartById(req.params.cid);

    // Validar que el carrito pertenezca al usuario autenticado o sea admin
    const userId = (req.user._id || req.user.id);
    if (userId.toString() !== cart.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para pagar este carrito' });
    }

    const result = await manager.payCart(req.params.cid);
    res.json({ message: 'Carrito pagado correctamente', cart: result });
  } catch (error) {
    if (error.status) {
      // Si el error tiene status, lo usás para responder
      res.status(error.status).json({ error: error.message });
    } else {
      // Si es otro error inesperado, lo pasás al middleware de manejo de errores
      next(error);
    }
  }
});

export default router;
