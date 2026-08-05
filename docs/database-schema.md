# Foodie — Database Schema

Database: `food_delivery` (MySQL 8). ORM: Sequelize 6.
All tables use `InnoDB`, `utf8mb4`, and include `createdAt` / `updatedAt` timestamps. Table names are the pluralized model names (e.g. model `User` → table `Users`).

---

## Relationship Map

```
Role 1───N User
User 1───1 DeliveryPartner        (role: delivery_partner)
User 1───N Restaurant             (owner)
User 1───N Address
User 1───N Order
User 1───N CartItem
User 1───N Wishlist
User 1───N Review
User 1───N Notification
User 1───N ResetToken

Restaurant 1───N FoodCategory
Restaurant 1───N Food
Restaurant 1───N Order
Restaurant 1───N Review

FoodCategory 1───N Food

Food 1───N CartItem
Food 1───N Wishlist
Food 1───N Review

Order 1───N OrderItem  (CASCADE delete)
Order 1───1 Payment
Order N───1 DeliveryPartner  (deliveryPartnerId, nullable)
Order N───1 Address         (addressId, nullable)
Order N───1 Coupon          (couponId, nullable)
Order 1───N Review

DeliveryPartner 1───N Order
```

---

## Tables

### Role
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| name | STRING(50) UNIQUE | `customer`, `restaurant_owner`, `admin`, `delivery_partner` |
| description | STRING(255) | optional |

### User
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| roleId | INT NOT NULL | FK → Role.id |
| name | STRING(100) NOT NULL | |
| email | STRING(255) UNIQUE NOT NULL | validated as email |
| password | STRING(255) NOT NULL | bcrypt hash; excluded from default scope |
| phone | STRING(20) | |
| profileImage | STRING(500) | |
| isBlocked | BOOLEAN default false | |
| isVerified | BOOLEAN default false | |

### Restaurant
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| ownerId | INT NOT NULL | FK → User.id |
| name | STRING(150) NOT NULL | |
| description | TEXT | |
| cuisine | STRING(100) | |
| image / coverImage | STRING(500) | |
| address | TEXT | |
| city / state | STRING(100) | |
| pincode | STRING(10) | |
| phone | STRING(20) | |
| deliveryFee | DECIMAL(10,2) default 0 | |
| deliveryTime | INT default 30 | minutes |
| minOrderAmount | DECIMAL(10,2) default 0 | |
| rating | DECIMAL(3,2) default 0 | |
| totalRatings | INT default 0 | |
| status | ENUM(`pending`,`approved`,`rejected`) default `pending` | admin approval flow |
| isActive | BOOLEAN default true | |

### FoodCategory
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| restaurantId | INT nullable | null ⇒ **global** category (created by admin) |
| name | STRING(100) NOT NULL | |
| image | STRING(500) | |
| isActive | BOOLEAN default true | |

### Food
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| restaurantId | INT NOT NULL | FK → Restaurant.id |
| categoryId | INT nullable | FK → FoodCategory.id |
| name | STRING(150) NOT NULL | |
| description | TEXT | |
| price | DECIMAL(10,2) NOT NULL | base price |
| discountPrice | DECIMAL(10,2) nullable | price the customer pays if set |
| image | STRING(500) | |
| isVeg | BOOLEAN default true | |
| isAvailable | BOOLEAN default true | "sold out" toggle |
| rating | DECIMAL(3,2) default 0 | |
| totalRatings | INT default 0 | |

### Order
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| orderNumber | STRING(30) UNIQUE NOT NULL | e.g. `FD-20250101-XXXX` |
| userId | INT NOT NULL | FK → User.id |
| restaurantId | INT NOT NULL | FK → Restaurant.id (single-restaurant orders) |
| deliveryPartnerId | INT nullable | FK → DeliveryPartner.id |
| addressId | INT nullable | FK → Address.id |
| couponId | INT nullable | FK → Coupon.id |
| itemsTotal | DECIMAL(10,2) NOT NULL | |
| deliveryFee | DECIMAL(10,2) NOT NULL | also the partner's earnings |
| discount | DECIMAL(10,2) NOT NULL | coupon/offer discount |
| tax | DECIMAL(10,2) NOT NULL | |
| totalAmount | DECIMAL(10,2) NOT NULL | |
| paymentMethod | ENUM(`cash`,`card`,`upi`,`wallet`) default `cash` | |
| paymentStatus | ENUM(`pending`,`paid`,`failed`,`refunded`) default `pending` | |
| orderStatus | ENUM(`pending`,`accepted`,`preparing`,`out_for_delivery`,`delivered`,`rejected`,`cancelled`) default `pending` | lifecycle below |
| deliveryAddress | JSON | snapshot of the delivery address |
| estimatedDelivery | DATE | |
| placedAt / acceptedAt / preparingAt / outForDeliveryAt / deliveredAt / cancelledAt | DATE nullable | status timestamps |

Status lifecycle:
```
pending → accepted → preparing → out_for_delivery → delivered
   └──→ rejected            └──→ cancelled (customer)
```

### OrderItem (snapshot per food in an order)
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| orderId | INT NOT NULL | FK → Order.id, CASCADE delete |
| foodId | INT nullable | kept loose so history survives edits |
| name | STRING(150) NOT NULL | copied at order time |
| price | DECIMAL(10,2) NOT NULL | copied at order time |
| quantity | INT NOT NULL default 1 | |
| image | STRING(500) | |
| isVeg | BOOLEAN default true | |

### Payment
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| orderId | INT NOT NULL | FK → Order.id |
| userId | INT NOT NULL | FK → User.id |
| amount | DECIMAL(10,2) NOT NULL | |
| method | ENUM(`cash`,`card`,`upi`,`wallet`) NOT NULL | |
| status | ENUM(`pending`,`success`,`failed`,`refunded`) default `pending` | |
| gateway | STRING(50) default `internal` | ready for `stripe` / `razorpay` |
| transactionId | STRING(100) | |
| meta | JSON | raw gateway response |
| paidAt | DATE | |

### Address
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| userId | INT NOT NULL | FK → User.id |
| label | STRING(50) default `Home` | |
| fullAddress | TEXT NOT NULL | |
| landmark | STRING(150) | |
| city | STRING(100) NOT NULL | |
| state | STRING(100) | |
| pincode | STRING(10) NOT NULL | |
| isDefault | BOOLEAN default false | |

### Wishlist
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| userId | INT NOT NULL | FK → User.id, CASCADE |
| foodId | INT NOT NULL | FK → Food.id, CASCADE |
| *(unique constraint on user + food)* | | prevents duplicates |

### Review
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| userId | INT NOT NULL | FK → User.id |
| restaurantId | INT nullable | FK → Restaurant.id |
| foodId | INT nullable | FK → Food.id |
| orderId | INT nullable | FK → Order.id |
| rating | INT NOT NULL | 1–5 |
| comment | TEXT | |

### CartItem
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| userId | INT NOT NULL | FK → User.id, CASCADE |
| foodId | INT NOT NULL | FK → Food.id, CASCADE |
| quantity | INT NOT NULL default 1 | |
| *(unique constraint on user + food)* | | one row per item |

### Coupon
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| code | STRING(50) UNIQUE NOT NULL | uppercased on write |
| description | STRING(255) | |
| type | ENUM(`percent`,`fixed`) default `percent` | |
| value | DECIMAL(10,2) NOT NULL | % or flat ₹ |
| minOrderAmount | DECIMAL(10,2) default 0 | |
| maxDiscount | DECIMAL(10,2) nullable | cap |
| validFrom / validTo | DATE NOT NULL | |
| usageLimit | INT nullable | |
| usedCount | INT default 0 | |
| isActive | BOOLEAN default true | |

### Offer
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| title | STRING(150) NOT NULL | |
| description | TEXT | |
| image | STRING(500) | banner |
| discountPercent | INT default 0 | |
| minOrderAmount | DECIMAL(10,2) default 0 | |
| maxDiscount | DECIMAL(10,2) nullable | |
| code | STRING(50) | optional promo code |
| validFrom / validTo | DATE NOT NULL | |
| isActive | BOOLEAN default true | |

### DeliveryPartner
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| userId | INT UNIQUE NOT NULL | FK → User.id |
| vehicleType | ENUM(`bike`,`scooter`,`bicycle`,`car`) default `bike` | |
| vehicleNumber | STRING(20) | |
| availability | ENUM(`available`,`busy`,`offline`) default `available` | |
| currentLatitude | DECIMAL(10,8) | |
| currentLongitude | DECIMAL(11,8) | |
| rating | DECIMAL(3,2) default 0 | |
| totalDeliveries | INT default 0 | |
| earnings | DECIMAL(12,2) default 0 | accumulated delivery fees |

### Notification
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| userId | INT NOT NULL | FK → User.id, CASCADE |
| title | STRING(150) NOT NULL | |
| message | TEXT | |
| type | STRING(50) default `info` | `order`, `restaurant`, `offer`, … |
| isRead | BOOLEAN default false | |

### ResetToken
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK auto | |
| userId | INT NOT NULL | FK → User.id, CASCADE |
| token | STRING(255) NOT NULL | single-use |
| type | ENUM(`reset`,`verify`) default `reset` | |
| expiresAt | DATE NOT NULL | |
| isUsed | BOOLEAN default false | |

---

## Notes
- Passwords are never exposed: the `User` model excludes `password` from its default scope and hashes on create/update via Sequelize hooks.
- `OrderItem` snapshots `name`, `price`, `image` so order history stays correct after a food item is edited or deleted.
- Payments are gateway-agnostic: `gateway` + `meta` columns let a Stripe/Razorpay adapter be wired into `services/paymentService.js` without schema changes.
