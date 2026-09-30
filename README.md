# 🛍️ MARKETPLACE MODULE MONOREPO

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?style=for-the-badge&logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-4.x-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-18%2F19-61DAFB?style=for-the-badge&logo=react)
![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socketdotio)
![SweetAlert2](https://img.shields.io/badge/SweetAlert2-Notifications-FF69B4?style=for-the-badge&logo=sweetalert2)

An enterprise-grade, full-stack **Marketplace Monorepo Platform** featuring:
- **📱 Dual-Role Flutter Mobile Web App (Port 3000)**
- **🖥️ React Admin Moderation Panel in Crisp Light Mode (Port 3001)**
- **🌐 React Client Web Storefront (Port 3002)**
- **⚡ Node.js / Express + MongoDB + Socket.io Backend API (Port 5000)**

---

## 🌟 Key Recent Enhancements & Features

### 1. 🖥️ Admin Panel Light Mode & Order Management (`/admin-panel`)
- **☀️ Light Mode Default**: Clean, modern high-contrast Light Theme for the entire Admin Moderation Panel with seamless dark mode toggle.
- **🗑️ Permanent Order Deletion**: Admin can delete orders permanently from MongoDB with interactive SweetAlert2 confirmation dialogs.
- **🏷️ Promo / Discount Code Manager**: Dynamic management of discount codes (`/api/promos`) allowing creation, real-time editing, active/inactive status toggling, and deletion.
- **📂 Categories & Taxonomy Sync**: Real-time management of product and business directory categories (`/api/categories`) auto-seeded with default categories (*Electronics*, *Fashion*, *Groceries*, *Furniture*, *Vehicles*, *Business Services*, *Sports*).
- **📥 CSV Sales Exporter**: Export customer sales queue reports containing buyer name, email, item title, price, status, and shipping address.

### 2. 🔔 SweetAlert2 Alert & Toast Notification System
- Replaced native browser popups with **SweetAlert2** animated modals and toasts across Web and Admin apps.
- **Warning Modals**: *"Are you sure you want to delete this order / promo / item permanently?"* with confirm & cancel actions.
- **Success Toasts**: Instant toast notifications when orders are deleted, status updated, or promo codes claimed to clipboard.
- **Error Popups**: Graceful error feedback for invalid inputs or network failures.

### 3. 🌐 Client Web Storefront & Brand Sync (`/client-web`)
- **🎨 Brand & Typography Sync**: Integrated Google Font **`Plus Jakarta Sans`** (weights 400–900) matching the mobile app.
- **🛍️ Logo & Header Design**: HSL gradient logo icon box (`#4F46E5`, `#6366F1`, `#8B5CF6`), extra-bold `MARKETPLACE` title, and green gradient `PRO` badge (`#10B981` to `#0D9488`).
- **✨ Animated Glassmorphic Hero Slider**: Dynamic auto-slider pulling live admin promo codes from MongoDB (`/api/promos`) with 1-click clipboard copy.

---

## 🛠️ Monorepo Microservices & Architecture

| Microservice | Location | Technology | Port |
| :--- | :--- | :--- | :--- |
| **Mobile Web App** | `/mobile-app` | Flutter 3.x, Provider, Dart | `3000` |
| **Admin Panel** | `/admin-panel` | React 18, Vite, SweetAlert2, Light Theme | `3001` |
| **Client Web App** | `/client-web` | React 19, Vite, Plus Jakarta Sans, SweetAlert2 | `3002` |
| **Backend API Service** | `/backend` | Node.js, Express, Socket.io, Mongoose | `5000` |
| **Database** | `/backend` | MongoDB (`localhost:27017`) | `27017` |

---

## 📂 Monorepo Folder Structure

```
MARKETPLACE MODULE/
├── admin-panel/           # React 18 + Vite Admin Panel (Light Mode, Orders, Promos)
│   ├── dist/              # Production static web bundle
│   └── src/               # React components, pages & index.css
├── backend/               # Node.js + Express + Socket.io Server
│   └── src/               # Controllers, models (PromoCode, Category, Order), routes, sockets
├── client-web/            # React 19 + Vite Web Storefront
│   ├── dist/              # Production static web bundle
│   └── src/               # Navbar, HeroBanner, Cart, Checkout, Profile
├── mobile-app/            # Flutter Mobile & Web Client
│   ├── build/web/         # Production Flutter Web build
│   └── lib/               # Dart screens, models, providers, services
├── start_all.js           # All-in-one monorepo production launcher script
└── package.json           # Monorepo dependencies & scripts
```

---

## 🚀 How to Run locally

### 1. Fast Launch All Services (Recommended)
Run all 4 microservices simultaneously using the root launcher:
```bash
node start_all.js
```
This automatically starts:
- 🚀 **Backend API**: `http://localhost:5000`
- 🖥️ **Admin Panel**: `http://localhost:3001`
- 🌐 **Client Web App**: `http://localhost:3002`
- 📱 **Mobile Web App**: `http://localhost:3000`

### 2. Manual Service Launch

- **Backend API Server** (Port 5000):
  ```bash
  cd backend && npm start
  ```

- **Admin Panel** (Port 3001):
  ```bash
  cd admin-panel && npm run dev
  ```

- **Client Web App** (Port 3002):
  ```bash
  cd client-web && npm run dev
  ```

- **Mobile Web App** (Port 3000):
  ```bash
  cd mobile-app && flutter run -d web-server --web-port=3000
  ```

---

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/promos` | Fetch active promo codes for hero banner & checkout |
| `POST` | `/api/promos` | Create a new promo discount code (Admin) |
| `PUT` | `/api/promos/:id` | Edit an existing promo discount code (Admin) |
| `DELETE` | `/api/promos/:id` | Delete a promo discount code (Admin) |
| `PATCH` | `/api/promos/:id/toggle` | Toggle promo code active/inactive state |
| `GET` | `/api/categories` | Fetch category taxonomy list (Auto-seeded) |
| `POST` | `/api/categories` | Add a new product/directory category (Admin) |
| `DELETE` | `/api/categories/:id` | Delete a category (Admin) |
| `GET` | `/api/orders` | Fetch customer orders |
| `POST` | `/api/orders` | Create a new order and auto-deduct stock |
| `DELETE` | `/api/orders/:id` | Permanently delete an order from MongoDB (Admin) |
| `PATCH` | `/api/orders/:id/status` | Update order status (Processing, Dispatched, Delivered) |

---

## 📄 License
This project is proprietary software created for the Marketplace Module Platform.
