
# Ecommerce SaaS

> Plataforma de e-commerce full stack con gestión de productos, carritos, usuarios y tiendas. Backend en Node.js/Express, frontend en React + Vite, base de datos MongoDB Atlas.

## Características principales
- Gestión de productos, tiendas y usuarios (roles: usuario y administrador)
- Carritos de compra multi-tienda, confirmación y contacto por WhatsApp
- Panel de administración para tiendas
- Filtros, búsqueda y ordenamiento de productos
- Autenticación JWT y edición de perfil
- Notificaciones y diseño responsive

## Instalación rápida

1. Clona el repositorio:
	```bash
	git clone https://github.com/JoaquinTonizzo/ecommerce-api-saas.git
	cd ecommerce-api-saas
	```
2. Instala dependencias backend:
	```bash
	npm install
	```
3. Instala dependencias frontend:
	```bash
	cd client
	npm install
	```
4. Configura variables de entorno en `.env` y `client/.env` (ver abajo)
5. Ejecuta backend:
	```bash
	npm run dev
	```
6. Ejecuta frontend:
	```bash
	cd client
	npm run dev
	```

## Estructura de carpetas

```
ecommerce-api-saas/
├── src/           # Backend (Express)
├── client/        # Frontend (React + Vite)
├── public/        # Archivos estáticos
├── .env           # Variables de entorno backend
├── client/.env    # Variables de entorno frontend
└── README.md
```

## Variables de entorno

**Backend (.env):**
```
MONGO_URI
JWT_SECRET
PORT
```

**Frontend (client/.env):**
```git push -u origin main
VITE_API_URL
```

## Enlaces útiles
- API Deploy: Pendiente

## Créditos y licencia
Desarrollado por Joaquin Tonizzo.
git push -u origin main