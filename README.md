# Inventory Visibility System - Backend

A lightweight inventory visibility system backend for Indian material businesses (tiles, laminates, lighting, hardware). Built with Express.js and MongoDB.

## Problem Statement

Small-mid size material businesses in India face:
- No real-time inventory visibility leading to overstocking/stockouts
- Dead inventory (slow-moving SKUs) blocking capital
- Manual stock updates causing errors and mismatches
- No demand insights for procurement decisions
- Lack of timely alerts for replenishment

## Solution

This backend provides:
- Real-time stock tracking across multiple warehouses
- Low-stock and dead-stock alerts
- SKU performance analytics
- Role-based access control (Owner, Manager, Staff)

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Express.js |
| Database | MongoDB    |
| Auth     | JWT        |

## Assumptions

- Small-mid size material business (tiles, laminates, lighting, hardware)
- 1-3 warehouses
- SKU-based inventory
- No existing ERP
- Internet connectivity available
- Users: Owner, Store Manager, Warehouse Staff

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb://localhost:27017/insyd
JWT_SECRET=your-super-secret-jwt-key
PORT=8080
```

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Health Check
```
GET /api/health
```

### Authentication

#### Register User
```
POST /api/users/register
Body: { name, email, password, role, warehouse }
Roles: owner, manager, staff
```

#### Login
```
POST /api/users/login
Body: { email, password }
Returns: { user, token }
```

### SKU Management

| Method | Endpoint      | Description    | Auth Required |
|--------|---------------|----------------|---------------|
| POST   | /api/sku      | Create SKU     | Owner/Manager |
| GET    | /api/sku      | Get all SKUs   | All           |
| GET    | /api/sku/:id  | Get SKU by ID  | All           |
| PUT    | /api/sku/:id  | Update SKU     | Owner/Manager |
| DELETE | /api/sku/:id  | Delete SKU     | Owner         |

### Inventory Management

| Method | Endpoint               | Description              | Auth Required |
|--------|------------------------|--------------------------|---------------|
| GET    | /api/inventory         | Get all inventory        | All           |
| GET    | /api/inventory/summary | Get inventory summary    | All           |
| GET    | /api/inventory/sku/:id | Get inventory by SKU     | All           |
| POST   | /api/inventory/update  | Add/Remove stock         | All           |
| POST   | /api/inventory/set     | Set stock quantity       | Owner/Manager |

### Transactions

| Method | Endpoint                    | Description              | Auth Required |
|--------|-----------------------------|--------------------------|---------------|
| GET    | /api/transactions           | Get all transactions     | All           |
| GET    | /api/transactions/:id       | Get transaction by ID    | All           |
| GET    | /api/transactions/sku/:id   | Get transactions by SKU  | All           |

### Alerts

| Method | Endpoint              | Description          | Auth Required |
|--------|-----------------------|----------------------|---------------|
| GET    | /api/alerts           | Get all alerts       | All           |
| GET    | /api/alerts/low-stock | Get low stock alerts | All           |
| GET    | /api/alerts/dead-stock| Get dead stock alerts| All           |

### Analytics

| Method | Endpoint                       | Description           | Auth Required |
|--------|--------------------------------|-----------------------|---------------|
| GET    | /api/analytics/dashboard       | Dashboard stats       | All           |
| GET    | /api/analytics/sku-performance | SKU performance       | Owner/Manager |
| GET    | /api/analytics/inventory-value | Inventory value       | Owner/Manager |
| GET    | /api/analytics/stock-aging     | Stock aging report    | Owner/Manager |

### Warehouse Management

| Method | Endpoint             | Description         | Auth Required |
|--------|----------------------|---------------------|---------------|
| POST   | /api/warehouses      | Create warehouse    | Owner         |
| GET    | /api/warehouses      | Get all warehouses  | All           |
| GET    | /api/warehouses/:id  | Get warehouse by ID | All           |
| PUT    | /api/warehouses/:id  | Update warehouse    | Owner         |
| DELETE | /api/warehouses/:id  | Delete warehouse    | Owner         |

## Data Models

### User
- name, email, password, role (owner/manager/staff), warehouse, isActive

### SKU
- name, skuCode, category (tiles/laminates/lighting/hardware/other), description, reorderLevel, unitPrice, unit

### Inventory
- skuId, warehouse, quantity, lastUpdated, lastMovementDate

### Transaction
- skuId, warehouse, type (IN/OUT), quantity, reason, performedBy, date

### Warehouse
- name, location, address, contactPerson, contactPhone, isActive

## Role-Based Access

| Role    | Access                           |
|---------|----------------------------------|
| Owner   | Full access to all features      |
| Manager | Inventory + Reports + SKU mgmt   |
| Staff   | Update stock only                |

## Demo Credentials

```
Owner:
  email: owner@example.com
  password: owner123

Manager:
  email: manager@example.com
  password: manager123

Staff:
  email: staff@example.com
  password: staff123
```

## Deployment

- Backend: Render / Railway / AWS
- Database: MongoDB Atlas

## Project Structure

```
insyd-backend/
├── app.js
├── package.json
├── .env
├── controllers/
│   ├── user.controller.js
│   ├── sku.controller.js
│   ├── inventory.controller.js
│   ├── transaction.controller.js
│   ├── alerts.controller.js
│   ├── analytics.controller.js
│   └── warehouse.controller.js
├── models/
│   ├── user.js
│   ├── sku.js
│   ├── inventory.js
│   ├── transaction.js
│   └── warehouse.js
├── routers/
│   ├── router.js
│   ├── user.routes.js
│   ├── sku.routes.js
│   ├── inventory.routes.js
│   ├── transaction.routes.js
│   ├── alerts.routes.js
│   ├── analytics.routes.js
│   └── warehouse.routes.js
└── middleware/
    └── auth.js
```

## License

ISC
# inventory-management-backend
