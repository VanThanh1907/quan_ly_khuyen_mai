# API Testing Guide

This document provides examples for testing all API endpoints using tools like Postman, Thunder Client, or curl.

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### 2. Login User
**POST** `/auth/login`

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "role": "admin",
    "createdAt": "2025-10-30T10:00:00.000Z"
  }
}
```

## Product Endpoints

### 1. Get All Products
**GET** `/products?page=1&limit=10&search=laptop&category=Electronics`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by product name
- `category` (optional): Filter by category
- `sortBy` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order - asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Laptop Dell XPS 15",
      "price": 1299.99,
      "category": "Electronics",
      "description": "High-performance laptop",
      "stock": 50,
      "createdAt": "2025-10-30T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "limit": 10
  }
}
```

### 2. Get Single Product
**GET** `/products/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop Dell XPS 15",
    "price": 1299.99,
    "category": "Electronics",
    "description": "High-performance laptop",
    "stock": 50
  }
}
```

### 3. Create Product (Admin Only)
**POST** `/products`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "name": "New Product",
  "price": 99.99,
  "category": "Electronics",
  "description": "Product description",
  "stock": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "New Product",
    "price": 99.99,
    "category": "Electronics",
    "description": "Product description",
    "stock": 100
  }
}
```

### 4. Update Product (Admin Only)
**PUT** `/products/:id`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "name": "Updated Product Name",
  "price": 89.99,
  "stock": 150
}
```

### 5. Delete Product (Admin Only)
**DELETE** `/products/:id`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {}
}
```

### 6. Get All Categories
**GET** `/products/categories/list`

**Response:**
```json
{
  "success": true,
  "data": ["Electronics", "Fashion", "Home & Kitchen"]
}
```

## Promotion Endpoints

### 1. Get All Promotions
**GET** `/promotions?page=1&limit=10&status=active&search=black`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by promotion name
- `status` (optional): Filter by status (active/inactive/expired)
- `sortBy` (optional): Sort field
- `order` (optional): Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Black Friday Sale",
      "description": "Massive discounts",
      "discountPercentage": 25,
      "startDate": "2025-11-01T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.000Z",
      "applicableProducts": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Laptop Dell XPS 15",
          "price": 1299.99,
          "category": "Electronics"
        }
      ],
      "status": "active",
      "isValid": true
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

### 2. Get Single Promotion
**GET** `/promotions/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Black Friday Sale",
    "description": "Massive discounts",
    "discountPercentage": 25,
    "startDate": "2025-11-01T00:00:00.000Z",
    "endDate": "2025-11-30T23:59:59.000Z",
    "applicableProducts": [...],
    "status": "active"
  }
}
```

### 3. Create Promotion (Admin Only)
**POST** `/promotions`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "name": "Summer Sale",
  "description": "Hot summer deals",
  "discountPercentage": 30,
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "applicableProducts": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Promotion created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Summer Sale",
    "discountPercentage": 30,
    "status": "inactive",
    ...
  }
}
```

### 4. Update Promotion (Admin Only)
**PUT** `/promotions/:id`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "name": "Updated Summer Sale",
  "discountPercentage": 35,
  "status": "active"
}
```

### 5. Update Promotion Status (Admin Only)
**PATCH** `/promotions/:id/status`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "status": "active"
}
```

### 6. Delete Promotion (Admin Only)
**DELETE** `/promotions/:id`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Promotion deleted successfully",
  "data": {}
}
```

### 7. Get Active Promotions
**GET** `/promotions/active/list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Black Friday Sale",
      "discountPercentage": 25,
      "status": "active",
      "applicableProducts": [...]
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'user' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"admin"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### Create Product (with token)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Product","price":99.99,"category":"Test","stock":10}'
```

## Postman Collection

You can import this into Postman as a collection:

1. Create a new collection called "Promotion Management API"
2. Add environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (will be set after login)
3. Add all the endpoints above
4. Use `{{base_url}}` and `{{token}}` in your requests

After login, save the token from the response and use it in Authorization header for protected routes.
