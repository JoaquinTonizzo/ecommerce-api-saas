import { Routes, Route } from 'react-router-dom';
import StoreHome from './pages/StoreHome';
import Tiendas from './pages/Tiendas';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Products from './pages/Products';
import AdminPanel from './pages/AdminPanel';
import Auth from './pages/Auth';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products" element={<Products />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/auth" element={<Auth />} />
  <Route path="/tienda/:id" element={<StoreHome />} />
  <Route path="/tiendas" element={<Tiendas />} />
      </Routes>
    </>
  );
}
