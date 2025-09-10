import { Router } from 'express';
import productManager from '../managers/ProductManager.js';

const router = Router();
const manager = productManager;


router.get('/', async (req, res) => {
  const products = await manager.getProducts();
  res.render('home', { products });
});

router.get('/realtimeproducts', async (req, res) => {
  const products = await manager.getProducts();
  res.render('realTimeProducts', { products });
});

export default router;
