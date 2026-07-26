# GIGEXA Bangladesh 🛒

A complete full-stack e-commerce platform for Networking, Server, Security & Lifestyle tech products in Bangladesh.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, CSS Modules |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **File Upload** | Multer |

---

## 📁 Project Structure

```
gigexa/
├── backend/
│   ├── models/          # Mongoose models (Product, Category, User, Order)
│   ├── routes/          # Express API routes
│   ├── middleware/       # Auth middleware + DB seeder
│   ├── uploads/         # Product image uploads
│   ├── server.js        # Entry point
│   └── .env.example
│
└── frontend/
    ├── public/
    └── src/
        ├── components/   # Navbar, Footer, ProductCard
        ├── context/      # AuthContext, CartContext
        ├── pages/        # Home, Products, ProductDetail, Cart, Checkout
        │   └── admin/   # Dashboard, Products, Orders, Categories
        ├── services/     # Axios API service
        └── App.jsx
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1️⃣ Clone & Install Backend

```bash
cd gigexa/backend

# Copy env file
cp .env.example .env

# Edit .env with your MongoDB URI
# MONGO_URI=mongodb://localhost:27017/gigexa
# or use Atlas: MONGO_URI=mongodb+srv://...

# Install dependencies
npm install

# Start backend
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### 2️⃣ Install & Run Frontend

```bash
cd gigexa/frontend

# Copy env file
cp .env.example .env

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend runs on: **http://localhost:3000**

---

### 3️⃣ Database Seeding

The database **auto-seeds** on first run with:
- ✅ 5 categories (Networking, Server & Storage, Security, Lifestyle, IP Camera)
- ✅ 13 real products (MikroTik, Cisco, Fortinet, Panda, Dell, Synology, Samsung, Sony, Apple...)
- ✅ Admin user

---

## 🔑 Admin Login

```
URL:      http://localhost:3000/login
Email:    admin@gigexa.com.bd
Password: admin1234
```

Admin Dashboard: **http://localhost:3000/admin**

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/:slug` | Get single product |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

**Query Parameters:**
- `search` - Text search
- `category` - Category ID
- `brand` - Brand name
- `featured=true` - Featured only
- `newIn=true` - New arrivals
- `sort` - Sort field (e.g. `-price`, `price`, `-rating`)
- `page`, `limit` - Pagination

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order (public) |
| GET | `/api/orders` | List orders (Admin) |
| PUT | `/api/orders/:id/status` | Update order status (Admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create (Admin) |
| PUT | `/api/categories/:id` | Update (Admin) |
| DELETE | `/api/categories/:id` | Delete (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Stats & analytics (Admin) |

---

## 🏪 Features

### Storefront
- 🏠 Homepage with hero, categories, featured products, brands
- 🔍 Search & filter by category, brand, price
- 📦 Product detail with image gallery, specs, related products
- 🛒 Cart with quantity management (localStorage)
- 💳 Checkout (COD, bKash, Nagad, Card)
- ✅ Order confirmation page

### Admin Dashboard
- 📊 Stats: Revenue, Orders, Products, Customers
- 📦 Product management (CRUD + image upload)
- 🛒 Order management with status updates
- 🏷️ Category management
- ⚠️ Low stock alerts

---

## 📦 Pre-loaded Products

### Networking
- MikroTik RB750Gr3 hEX Router
- Cisco SG350-28 Managed Switch
- Fortinet FortiGate 60F Firewall
- Ubiquiti UniFi Dream Machine Pro
- TP-Link SG1024D Unmanaged Switch

### Server & Storage
- Dell PowerEdge T150 Tower Server
- Synology DS923+ NAS 4-Bay
- Seagate Exos X18 18TB Enterprise HDD

### Security & Antivirus
- Panda Dome Essential (1yr/3PC)
- Panda Dome Complete (1yr/5PC)

### Lifestyle & Wearables
- Samsung Galaxy Watch 6 Classic 47mm
- Sony WF-1000XM5 Earbuds
- Apple AirPods Pro 2nd Gen

---

## 🚢 Deployment

### Backend (Railway / Render / VPS)
1. Set `MONGO_URI` to your MongoDB Atlas connection string
2. Set `JWT_SECRET` to a strong secret
3. Set `CLIENT_URL` to your frontend domain

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your backend URL
2. Run `npm run build`
3. Deploy the `build/` folder

---

## 📞 Support

- WhatsApp: +880 1XXX-XXXXXX
- Email: info@gigexa.com.bd
- Dhaka, Bangladesh

---

**Built with ❤️ for Bangladesh businesses**
