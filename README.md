# MARKETPLACE MODULE MONOREPO

A complete end-to-end Marketplace application platform featuring a **Dual-Role Mobile App (Buyer & Seller)**, an **Admin Moderation Web Panel**, and a **Node.js/Express + MongoDB + Socket.io Backend Service**.

---

## 📱 Project Components

### 1. 📱 BUYER/SELLER APP (`/mobile-app`)
Built with React Native & Expo Web capabilities. Supports dual-role switching (Buyer & Seller).
- **Auth Flow**: Splash screen, Onboarding slider, Login, Register, OTP verification, Location permission screen.
- **Main Tab Navigation**:
  - **Home Tab**: Category grid (Electronics, Fashion, Groceries, Furniture, Vehicles, Businesses), Featured/Trending listings, Nearby listings, Business spotlight banners.
  - **Search Tab**: Instant keyword search, Filter modal (price min/max range, condition badges, distance radius, category select), recent searches.
  - **Sell Tab (+)**: 5-Step Create Listing wizard (Category, Photo Upload grid, Item Details form, Price & Negotiable toggle, Location confirm, Preview & Publish).
  - **Chats Tab**: In-chat conversation list, real-time negotiation flow with interactive **Offer Card** (`[Accept]`, `[Reject]`, `[Counter Offer]`), deal confirmed state & suggested meetup location pin share.
  - **Profile Tab**: Dual role switcher, My Listings (active/sold), Saved Favorites, Wallet & Earnings balance, Safety tips & scam prevention guidelines.
- **Business Directory & Seller Dashboard**: Business directory listing, detailed Business Profile (About, Products, Customer Reviews), write review modal, seller business dashboard.

### 2. 🖥️ ADMIN PANEL (`/admin-panel`)
Modern glassmorphism React Web dashboard for platform administrators.
- **Dashboard**: High-level platform KPIs (Active listings, Registered users, Business directory count, Platform GMV) + live activity stream.
- **Listing Moderation Queue**: Approve, flag, or remove listings with report counters.
- **Business Verification Queue**: Inspect submitted business permits and grant verified business badges.
- **User Management**: View user ratings, toggle account status (`Active`, `Suspended`, `Banned`).
- **Category Management**: Create new categories, configure parent/child hierarchy, toggle business directory flag.
- **Reports & Disputes Queue**: Manage user complaints and issue resolution.
- **Review Moderation**: Audit merchant and seller reviews.
- **Analytics & Insights**: Listings by category distribution, negotiation conversion rate, average response times.

### 3. ⚙️ BACKEND API & SOCKET SERVICE (`/backend`)
Node.js + Express + MongoDB + Socket.io service.
- **Mongoose Models**:
  1. `User` (roles: `user`, `seller`, `business_owner`, `admin`, 2dsphere location)
  2. `Listing` (2dsphere index & full-text search index)
  3. `Category` (isBusinessCategory flag)
  4. `Business` (local business listings, opening hours, verified state)
  5. `BusinessReview` (ratings, reviews & owner replies)
  6. `Chat` & `Message` (direct messaging & offer cards)
  7. `Offer` (negotiation state machine: `pending`, `accepted`, `rejected`, `countered`)
  8. `Favorite` (saved items per user)
  9. `Report` (content & user moderation reports)
  10. `Notification` (user alert system)
- **Services & Sockets**:
  - `searchService.js`: MongoDB `$near` 2dsphere geo-spatial proximity search + price/condition/text query filters.
  - `chatSocket.js`: Socket.io real-time chat & live offer negotiation updates (`join_chat`, `send_message`, `respond_offer`).
  - `seed.js`: Database seeder script loading sample listings, categories, businesses, chats, offers, and reports.

---

## 🚀 How to Run

### Install Dependencies
```bash
cd backend && npm install
cd ../admin-panel && npm install
cd ../mobile-app && npm install
```

### Seed Database
```bash
cd backend && npm run seed
```

### Run Services
- **Backend API**: `cd backend && npm start` (Runs on http://localhost:5000)
- **Admin Panel**: `cd admin-panel && npm run dev` (Runs on http://localhost:3001)
- **Mobile App**: `cd mobile-app && npm run dev` (Runs on http://localhost:3000)
