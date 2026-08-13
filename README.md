# 🛍️ MARKETPLACE MODULE MONOREPO

A complete, enterprise-grade Marketplace application platform featuring a **Dual-Role Flutter Mobile App (Buyer & Seller)**, a **React Admin Moderation Web Panel**, and a **Node.js/Express + MongoDB + Socket.io Backend API Service**.

---

## 📸 Visual Showcase & UI Highlights

### 📱 1. Dual-Role Mobile Web App (`/mobile-app`)
The Flutter Mobile App features dark glassmorphism aesthetics, dual-role capabilities for buyers and sellers, persistent local storage cart caching, and a 5-step seller listing wizard.

| 🏠 Home Feed & Store Items | ➕ 5-Step Seller Listing Wizard |
| :---: | :---: |
| ![Mobile Home Feed](screenshots/mobile_home.png) | ![Create Listing Wizard](screenshots/mobile_create_listing.png) |

| 🛒 Persistent Shopping Cart | 💻 Full HD Web View |
| :---: | :---: |
| ![Shopping Cart](screenshots/mobile_cart.png) | ![Desktop Web View](screenshots/desktop_web_app.png) |

---

## ✨ Features & Component Architecture

### 1. 📱 BUYER/SELLER APP (`/mobile-app`)
Built with Flutter & Flutter Web. Supports dual-role switching (Buyer & Seller).
- **Home Feed**: Category grid (Electronics, Fashion, Groceries, Furniture, Vehicles, Business Directory), Featured store items, price tags, and favorite badges.
- **🛒 Persistent Shopping Cart**: Shopping cart items persist locally across page refreshes and application restarts via `SharedPreferences` JSON caching.
- **➕ 5-Step Create Listing Wizard**:
  - **Step 1**: Category selection grid.
  - **Step 2**: Image URL & CDN photo upload preview.
  - **Step 3**: Product title, pricing, stock quantity, and condition badge.
  - **Step 4**: Counter-offer negotiation toggles, store badges, and pickup location.
  - **Step 5**: Live item preview card and instant publishing to MongoDB.
- **💬 Real-Time Chat & Negotiation**: Interactive offer negotiation cards (`[Accept]`, `[Reject]`, `[Counter Offer]`) synced via Socket.io.
- **👤 Profile & Wallet**: Balance display, account management, saved favorites, and theme switcher.

---

### 2. 🖥️ ADMIN MODERATION PANEL (`/admin-panel`)
Modern glassmorphism React Web dashboard for platform administrators.
- **Dashboard Overview**: Platform KPIs (Active listings, Registered users, Platform GMV, Order queue counters).
- **📥 CSV Report Exporter**: Download formatted CSV sales reports containing customer names, order IDs, product titles, prices, quantities, and shipping addresses.
- **Listing Moderation Queue**: Approve, flag, or remove listings with report counters.
- **Business Verification Queue**: Inspect submitted business permits and grant verified badges.
- **Orders & Sales Management**: Real-time status tracker (`Processing`, `Dispatched`, `Out for Delivery`, `Delivered`, `Cancelled`).

---

### 3. ⚙️ BACKEND API & SOCKET SERVICE (`/backend`)
Node.js + Express + MongoDB + Socket.io service.
- **Mongoose Models**:
  - `User`, `Listing`, `Category`, `Business`, `BusinessReview`, `Chat`, `Message`, `Offer`, `Favorite`, `Report`, `Order`, `Transaction`.
- **API Endpoints & Services**:
  - `searchService.js`: MongoDB `$near` 2dsphere geo-spatial proximity search + price/condition filters.
  - `chatSocket.js`: Socket.io real-time chat & live offer negotiation updates (`join_chat`, `send_message`, `respond_offer`).
  - `/api/upload`: Base64 & CDN image upload router for product & business photos.
  - `/api/orders`: Customer order creation, status management, and auto-stock deduction in MongoDB.

---

## 🚀 How to Run locally

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../admin-panel && npm install
cd ../mobile-app && flutter pub get
```

### 2. Run Services

- **Backend API & MongoDB**:
  ```bash
  cd backend && npm start
  # Runs on http://localhost:5000
  ```

- **Admin Panel**:
  ```bash
  cd admin-panel && npm run dev
  # Runs on http://localhost:3001
  ```

- **Mobile App (Production Static Server)**:
  ```bash
  cd mobile-app
  flutter build web
  npx serve -s build/web -l 3000
  # Runs on http://localhost:3000
  ```
