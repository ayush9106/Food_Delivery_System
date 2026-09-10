# Foodie — Full-Stack Food Delivery Platform

A modern food-delivery web application built with **React, Tailwind CSS, Node.js, Express, and MySQL**. Demonstrates responsive frontend development, JWT authentication, restaurant browsing, cart and checkout flows, order management, and role-based dashboards.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?logo=sequelize&logoColor=white)

---

## Overview

Foodie is a full-stack food delivery platform featuring four distinct user roles with dedicated dashboards, a database-persisted cart, real-time order tracking, payment gateway architecture, coupons, offers, reviews, wishlist, and in-app notifications.

Built as a portfolio project demonstrating production-quality frontend development with React.js, responsive design, reusable components, API integration, and professional UX patterns.

---

## Features

### Customer Experience
- Browse restaurants with search, cuisine, city, and sort filters
- Restaurant detail pages with menu, categories, and reviews
- Food item pages with ratings, pricing, and add-to-cart
- Database-persisted cart with quantity controls
- Checkout with saved addresses, coupon validation, and payment selection
- Order tracking with visual progress stepper (5 stages)
- Order history, wishlist, notifications, and profile management
- Responsive mobile-first design with skeleton loaders

### Restaurant Owner
- Restaurant profile management with admin approval workflow
- Menu management: add/edit/delete foods, toggle availability
- Category management per restaurant
- Accept/reject incoming orders, mark as preparing
- Revenue and order analytics with Recharts charts

### Delivery Partner
- Online/offline availability toggle
- View and accept available orders
- Mark orders as delivered
- Earnings tracking and delivery history

### Admin
- Platform-wide dashboard with revenue charts and status breakdown
- User management with block/unblock functionality
- Restaurant approval workflow
- Foods, orders, and delivery partner management
- Coupon and offer CRUD
- Downloadable reports

### Authentication & Security
- JWT-based authentication with role-based access control
- Password hashing with bcrypt
- Forgot/reset password flow via email
- Rate limiting and input validation
- Protected routes (frontend + backend)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Recharts, react-icons, react-toastify |
| Backend | Node.js, Express 4, Sequelize 6 ORM |
| Database | MySQL 8 |
| Auth | JSON Web Tokens, bcryptjs, Nodemailer |
| Storage | Cloudinary (with local uploads fallback) |

---

## Project Structure

```
food-delivery-system/
├── backend/
│   ├── src/
│   │   ├── config/         # env, database, cloudinary, sync
│   │   ├── controllers/    # MVC business logic
│   │   ├── middleware/     # auth, upload, validation, error handling
│   │   ├── models/        # 17 Sequelize models with associations
│   │   ├── routes/        # RESTful API routes
│   │   ├── seeders/       # Demo data seeder
│   │   ├── services/      # payment, notification, email, token
│   │   ├── utils/         # AppError, catchAsync, ApiFeatures
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   └── src/
│       ├── api/            # Axios client with auth interceptors
│       ├── components/     # reusable UI (Navbar, Footer, Cards, etc.)
│       │   ├── common/     # Navbar, Footer, Loader, Skeleton, EmptyState, etc.
│       │   ├── layout/     # ProtectedRoute, DashboardLayout
│       │   ├── restaurant/ # RestaurantCard, FoodCard
│       │   └── ui/         # Modal, StatCard, StatusBadge, OrderTracker
│       ├── config/         # Shared navigation configs
│       ├── context/        # Auth, Cart, Wishlist, Notification providers
│       ├── hooks/          # useDebounce, useFetch, useDocumentTitle
│       ├── pages/          # 38 route pages across 5 role-based sections
│       ├── utils/          # formatINR, formatDate, helpers
│       ├── App.jsx         # Route definitions with lazy loading
│       └── main.jsx        # Provider setup
└── docs/
    └── database-schema.md  # ER diagram overview
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MySQL** 8 running locally
- npm

### 1. Backend

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DB_HOST, DB_PASSWORD, JWT_SECRET
# Cloudinary and mail are optional (dev fallback logs to console)

# Create database, seed demo data, and start
npm run seed
npm run dev
```

The API starts at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` to the backend.

### Production Build

```bash
cd frontend
npm run build    # Output in dist/
npm run preview  # Preview the production build
```

---

## Demo Accounts

All passwords: `password123`

| Role | Email |
|------|-------|
| Admin | `admin@foodie.com` |
| Customer | `customer@foodie.com` |
| Restaurant Owner | `owner@foodie.com` |
| Delivery Partner | `partner@foodie.com` |

---

## API Reference

RESTful JSON API mounted at `/api`. Protected routes require `Authorization: Bearer <token>`.

| Module | Base Path | Key Endpoints |
|--------|-----------|---------------|
| Auth | `/api/auth` | register, login, forgot/reset password |
| Users | `/api/users` | profile, addresses, delivery profile |
| Restaurants | `/api/restaurants` | browse, search, owner CRUD |
| Foods | `/api/foods` | catalogue, search, owner CRUD |
| Categories | `/api/categories` | global + per-restaurant |
| Cart | `/api/cart` | DB-persisted cart operations |
| Orders | `/api/orders` | place, status updates, cancel |
| Payments | `/api/payments` | initiate, confirm, history |
| Reviews | `/api/reviews` | rate food and restaurants |
| Coupons | `/api/coupons` | validate + admin CRUD |
| Offers | `/api/offers` | active offers + admin CRUD |
| Wishlist | `/api/wishlist` | add/remove/list |
| Delivery | `/api/delivery` | available orders, accept, delivered, earnings |
| Admin | `/api/admin` | stats, users, restaurants, orders, reports |
| Analytics | `/api/analytics` | admin and owner dashboard data |
| Notifications | `/api/notifications` | list, mark read |

---

## Architecture Notes

- **Code splitting**: All page components are lazy-loaded with `React.lazy` for optimal bundle size
- **Shared navigation configs**: Centralized in `config/navigation.js` for consistency across 4 dashboard roles
- **Design system**: Reusable component classes (`.btn-primary`, `.card`, `.input-field`, `.skeleton`) ensure visual consistency
- **Skeleton loaders**: Shimmer-animated placeholders for all loading states
- **Gateway-ready payments**: `paymentService.js` abstraction ready for Stripe/Razorpay adapter drop-in
- **Single-restaurant carts**: Realistic constraint matching real-world food delivery behavior
- **Mobile-first responsive**: Tested across 360px to 1440px viewports with proper bottom navigation for dashboards
- **Accessibility**: Semantic HTML, labeled form inputs, keyboard navigation, focus-visible states, `prefers-reduced-motion` support

---

## License

MIT
