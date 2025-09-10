import Product from '../models/Product.js';

class ProductManager {
  // Obtiene todos los productos desde MongoDB
  async getProducts(filter = {}) {
    // Devuelve los productos y agrega storeId como alias de store
    const products = await Product.find(filter).lean();
    return products.map(p => ({ ...p, storeId: p.store?.toString() || p.store }));
  }

  // Busca un producto por ID, lanza error si no lo encuentra
  async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      throw error;
    }
    return product;
  }

  // Agrega un producto nuevo
  async addProduct(data) {
    const newProduct = new Product(data);
    await newProduct.save();
    return newProduct;
  }

  // Actualiza un producto existente, lanza error si no lo encuentra
  async updateProduct(id, updates) {
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      throw error;
    }
    return product;
  }

  // Elimina un producto por ID, lanza error si no lo encuentra
  async deleteProduct(id) {
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      throw error;
    }
    return true;
  }
}

const productManager = new ProductManager();
export default productManager;