import express from 'express';
import productManager from '../managers/ProductManager.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();
const manager = productManager;

// Endpoint público para obtener todos los productos de todas las tiendas
router.get('/all', async (req, res, next) => {
  try {
    const products = await manager.getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Ruta GET '/' -> Lista todos los productos
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // Si el usuario es admin, solo ve productos de su tienda
    if (req.user && req.user.role === 'admin' && req.user.store) {
      const products = await manager.getProducts({ store: req.user.store });
      return res.json(products);
    }
    // Si no es admin, ve todos los productos
    const products = await manager.getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Ruta GET '/:pid' -> Obtiene un producto por su ID
router.get('/:pid', async (req, res, next) => {
  try {
    const product = await manager.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Ruta POST '/' -> Crea un nuevo producto (solo admin)
router.post('/', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'El cuerpo de la solicitud está vacío o no es válido' });
    }

    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || price == null || status == null || stock == null || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Asociar el producto a la tienda del admin
    const storeId = req.user.store;
    if (!storeId) {
      return res.status(403).json({ error: 'El usuario admin no está vinculado a ninguna tienda' });
    }

    const newProduct = await manager.addProduct({ title, description, code, price, status, stock, category, thumbnails, store: storeId });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// Ruta PUT '/:pid' -> Actualiza un producto existente (solo admin)
router.put('/:pid', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    // Verificar que el producto pertenece a la tienda del admin
    const product = await manager.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    if (product.store.toString() !== req.user.store) {
      return res.status(403).json({ error: 'No tienes permiso para editar este producto' });
    }
    const updated = await manager.updateProduct(req.params.pid, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Ruta DELETE '/:pid' -> Elimina un producto por ID (solo admin)
router.delete('/:pid', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    // Verificar que el producto pertenece a la tienda del admin
    const product = await manager.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    if (product.store.toString() !== req.user.store) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto' });
    }
    const deleted = await manager.deleteProduct(req.params.pid);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export default router;