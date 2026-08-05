# 🍔 Foodie — Food Delivery Platform

A full-stack, Swiggy/Zomato-style food delivery web application built with the MERN-like stack of **React + Express + MySQL (Sequelize)**. It supports four roles — **customer, restaurant owner, delivery partner, and admin** — with JWT authentication, a database-persisted cart, order tracking, payments, coupons & offers, reviews, wishlist, in-app notifications, and analytics dashboards.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white) ![Express](https://img.shields.io/badge/Express-4-000000) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white) ![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?logo=sequelize&logoColor=white)

---

## ✨ Features

### 👤 Customers
- Browse restaurants & food by search, category, veg/non-veg filters
- Restaurant & food detail pages with ratings and reviews
- Add to cart (single-restaurant carts, persisted in the database), apply **coupons & offers**
- Checkout with saved addresses and a gateway-ready **payment flow**
- Live **order tracking** (placed → accepted → preparing → out for delivery → delivered)
- Order history, reorder-friendly order details
- **Wishlist**, in-app **notifications**, profile & password management

### 🏪 Restaurant Owners
- Create & manage restaurant profile (admin approval workflow)
- Manage menu: foods, availability toggle, categories
- Accept/reject incoming orders, mark orders as preparing
- **Analytics dashboard**: revenue, top dishes, recent orders (Recharts)

### 🛵 Delivery Partners
- Go online/offline, see available orders nearby
- Accept deliveries and mark orders delivered
- **Earnings & delivery history**

### 🛡️ Admin
- Platform-wide **dashboard** with revenue charts & status mix (Recharts)
- Manage users (block/unblock), approve/reject restaurants
- Overview of foods, orders & delivery partners
- **Coupons & offers CRUD**, downloadable **reports** (customers / restaurants / delivery)

### 🔐 Authentication & Security
- JWT-based auth with role-guarded routes (backend + frontend)
- Bcrypt password hashing, forgot/reset password via email
- Express-rate-limit, input validation (express-validator)
- Cloudinary image uploads with local-disk fallback

---

## 🧱 Tech Stack

| Layer    | Technologies |
|----------|--------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Recharts, react-icons, react-toastify |
| Backend  | Node.js, Express 4, Sequelize 6 ORM |
| Database | MySQL 8 |
| Auth     | JSON Web Tokens, bcryptjs, Nodemailer |
| Storage  | Cloudinary (with local `uploads/` fallback) |

---

## 📁 Project Structure

```
food-delivery-system/
├── backend/
│   ├── src/
│   │   ├── config/        # env, database, cloudinary, sync
│   │   ├── controllers/   # business logic (MVC)
│   │   ├── middleware/    # auth, upload, validate, error handlers
│   │   ├── models/        # 17 Sequelize models + associations
│   │   ├── routes/        # RESTful API routes
│   │   ├── seeders/       # demo data
│   │   ├── services/      # payment, notification, email
│   │   ├── utils/         # AppError, catchAsync, ApiFeatures, sendSuccess
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   └── src/
│       ├── api/           # axios client with interceptors
│       ├── components/    # layout, ui, common, restaurant cards…
│       ├── context/       # Auth, Cart, Wishlist, Notification
│       ├── hooks/         # useDebounce, useFetch, useDocumentTitle
│       ├── pages/         # public, auth, customer, restaurant, delivery, admin
│       └── App.jsx        # all routes
└── docs/
    └── database-schema.md # ER overview of all tables
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **MySQL** 8 running locally
- npm

### 1. Backend

```bash
cd backend
npm install

# configure environment
cp .env.example .env
# edit .env — set DB_PASSWORD, JWT secrets (Cloudinary & mail are optional:
# the app falls back to local uploads and logs password-reset links)

# create the database, then:
npm run seed        # creates tables + demo data (roles, users, restaurants, foods…)
npm run dev         # start API at http://localhost:5000
```

> Tables are created automatically by the seed script (Sequelize `sync`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # start Vite dev server at http://localhost:5173
```

Open http://localhost:5173 — the Vite dev server proxies `/api` and `/uploads` to the backend.

---

## 🔑 Demo Accounts

All passwords are `password123`.

| Role             | Email                  |
|------------------|------------------------|
| Admin            | `admin@foodie.com`     |
| Customer         | `customer@foodie.com`  |
| Restaurant owner | `owner@foodie.com`     |
| Delivery partner | `partner@foodie.com`   |

Extra demo users: `priya@foodie.com`, `rahul@foodie.com` (owners).

---

## 🔌 API Overview

RESTful JSON API mounted at `/api`. All protected routes require `Authorization: Bearer <token>`.

| Module       | Base path            | Highlights |
|--------------|----------------------|------------|
| Auth         | `/api/auth`          | register, login, me, forgot/reset password |
| Users        | `/api/users`         | profile, addresses, delivery profile |
| Restaurants  | `/api/restaurants`   | public browse + owner CRUD |
| Foods        | `/api/foods`         | catalogue, search, owner CRUD |
| Categories   | `/api/categories`    | global + per-restaurant |
| Cart         | `/api/cart`          | DB-persisted cart |
| Orders       | `/api/orders`        | place, status updates, cancel |
| Payments     | `/api/payments`      | initiate, confirm, history |
| Reviews      | `/api/reviews`       | rate food & restaurant |
| Coupons      | `/api/coupons`       | validate + admin CRUD |
| Offers       | `/api/offers`        | active offers + admin CRUD |
| Wishlist     | `/api/wishlist`      | add/remove/list |
| Delivery     | `/api/delivery`      | available orders, accept, delivered, earnings |
| Admin        | `/api/admin`         | stats, users, restaurants, orders, reports |
| Analytics    | `/api/analytics`     | admin & owner dashboards |
| Notifications| `/api/notifications` | list, mark read |

---

## 🧠 Design Notes

- **Gateway-ready payments**: `paymentService.js` exposes `createPaymentIntent` / `verifyPayment` behind an internal gateway; a Stripe/Razorpay adapter can be dropped in without changing controllers.
- **Single-restaurant carts** keep order logic simple and realistic.
- **MVC backend** with `controllers → services → models`, centralized error handling (`AppError` + `catchAsync`), and a reusable `ApiFeatures` query helper.
- **Sequelize associations** in `models/index.js` power eager-loaded relations (orders with items/address/payment, etc.).
- **Recharts** renders revenue trends, status distribution and top-selling dishes in the admin & owner dashboards.

---

## 📄 License

MIT
