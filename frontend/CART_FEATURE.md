# 🛒 Shopping Cart Feature Documentation

## Overview
Complete shopping cart system with stock validation, real-time pricing, and promotion application.

## Features Implemented

### 1. **Backend API** (`backend/`)

#### Cart Model (`models/Cart.js`)
- **Schema Fields**:
  - `userId` - Reference to User
  - `items` - Array of cart items with:
    - `productId` - Reference to Product
    - `productSnapshot` - Denormalized product data (name, price, imageUrl, category, brand)
    - `quantity` - Number of items
  - `expiresAt` - Auto-expire date (30 days TTL)
  - `createdAt`, `updatedAt` - Timestamps

- **Methods**:
  - `validateStock()` - Checks if all items are in stock
  - `getCartWithCurrentData()` - Enriches cart with current prices and promotions
  - `calculateTotal()` - Computes total with current pricing

- **Indexes**:
  - TTL index on `expiresAt` for automatic cleanup
  - Compound index on `userId` for fast lookups

#### Cart Controller (`controllers/cartController.js`)
7 endpoints with full business logic:

1. **GET /api/cart** - Get user's cart
   - Returns enriched cart with current prices and active promotions
   - Handles non-existent cart gracefully

2. **POST /api/cart/add** - Add item to cart
   - Validates product existence and stock availability
   - Creates cart if doesn't exist
   - Updates quantity if item already in cart
   - Stores product snapshot for historical data

3. **PUT /api/cart/update** - Update item quantity
   - Validates new quantity against stock
   - Removes item if quantity is 0
   - Returns updated cart

4. **DELETE /api/cart/remove/:productId** - Remove item
   - Removes specific item from cart
   - Returns updated cart

5. **DELETE /api/cart/clear** - Clear entire cart
   - Removes all items from cart
   - Keeps cart document for reuse

6. **GET /api/cart/validate** - Validate cart before checkout
   - Checks stock for all items
   - Returns warnings for out-of-stock or low-stock items
   - Returns `valid: true/false`

7. **POST /api/cart/checkout** - Create order from cart
   - Validates stock availability
   - Applies active promotions to eligible products
   - Creates Order document
   - Decreases product stock
   - Clears cart after successful order
   - Returns order details

#### Cart Routes (`routes/cartRoutes.js`)
- All routes protected with `authenticate` middleware
- RESTful API design
- Proper HTTP methods and status codes

#### Server Configuration (`server.js`)
- Cart routes registered at `/api/cart`
- Integration with existing Express middleware

#### Database Seeding (`seed.js`)
- Clears carts on database reset
- Maintains data consistency

### 2. **Frontend UI** (`frontend/src/`)

#### Cart Page (`pages/Cart.js`)
Full-featured shopping cart interface:

**Features**:
- **Cart Items Table**:
  - Product image, name, and info
  - Current price with promotion badges
  - Quantity controls (+/- buttons)
  - Line total calculation
  - Remove item button
  - Stock warnings (out of stock, low stock)
  
- **Order Summary Card**:
  - Subtotal calculation
  - Discount amount (if promotions applied)
  - Total amount
  - Checkout button
  
- **Empty Cart State**:
  - Friendly message with icon
  - Link to continue shopping

- **Checkout Dialog**:
  - Shipping address form (street, city, state, zip code, country)
  - Form validation
  - Submit order with loading state
  - Navigate to orders page after success

- **Stock Validation**:
  - Pre-checkout validation
  - Warning alerts for insufficient stock
  - Real-time stock status display

- **UI/UX**:
  - Halloween theme (Creepster font, orange/purple colors)
  - Responsive design (desktop & mobile)
  - Loading states and error handling
  - Success/error notifications with auto-dismiss
  - Smooth animations and transitions

#### Product Detail Page (`pages/ProductDetail.js`)
**Added**:
- `handleAddToCart()` function - Adds product to cart via API
- "Add to Cart" button with:
  - Disabled state for out-of-stock items
  - Loading state while adding
  - Success notification
  - Error handling
- State management:
  - `addingToCart` - Loading state
  - `success` - Success message
  - `error` - Error message

#### Product Catalog Page (`pages/ProductCatalogGothic.js`)
**Added**:
- `handleAddToCart(productId, e)` function - Adds product from catalog
- "Add to Cart" button for each product card:
  - Green gradient button (Halloween theme)
  - Shopping cart icon
  - Disabled for out-of-stock items
  - Individual loading states per product
  - Event propagation prevention (doesn't navigate to detail)
- Two-button layout:
  - "Add to Cart" (left) - Quick add
  - "View" (right) - Navigate to detail
- Global success/error alerts

#### Navigation Layout (`components/Layout.js`)
**Added**:
- Cart icon in navbar with Badge
- Badge displays cart item count
- Real-time cart count fetching
- Auto-refresh on route change
- Pulse animation on badge when items > 0
- Active state when on cart page
- Click to navigate to `/cart`

#### App Routes (`App.js`)
**Added**:
- `/cart` route - PrivateRoute with Layout wrapper
- Cart component import

## Data Flow

### Add to Cart Flow
```
User clicks "Add to Cart" 
  → Frontend: POST /api/cart/add { productId, quantity: 1 }
  → Backend: Validate product & stock
  → Backend: Create/update cart in MongoDB
  → Backend: Return updated cart
  → Frontend: Show success message
  → Frontend: Update cart badge count
```

### Checkout Flow
```
User clicks "Thanh Toán"
  → Frontend: GET /api/cart/validate
  → Backend: Check stock for all items
  → If valid: Show checkout dialog
  → User fills shipping address
  → User clicks "Xác Nhận"
  → Frontend: POST /api/cart/checkout { shippingAddress }
  → Backend: Validate stock again
  → Backend: Apply promotions to eligible products
  → Backend: Create Order with denormalized data
  → Backend: Decrease product stock
  → Backend: Clear cart
  → Backend: Return order
  → Frontend: Show success message
  → Frontend: Navigate to /orders after 2 seconds
```

## NoSQL Design Patterns Used

### 1. **Data Denormalization**
- Cart items store product snapshots (name, price, imageUrl)
- Preserves historical data even if product is deleted
- Reduces joins and improves query performance

### 2. **Enrichment at Query Time**
- `getCartWithCurrentData()` method enriches cart items with:
  - Current product prices
  - Active promotions
  - Current stock levels
- Shows users latest data while preserving history

### 3. **TTL (Time-To-Live)**
- Carts automatically expire after 30 days of inactivity
- MongoDB handles cleanup automatically
- Prevents database bloat from abandoned carts

### 4. **Embedded Documents**
- Cart items embedded in Cart document
- Reduces number of database queries
- Items are frequently accessed together with cart

### 5. **Reference Pattern**
- `productId` references Product collection
- Allows fetching current product data
- Enables stock validation at checkout

## Stock Validation

### Two-Phase Validation
1. **Pre-checkout** (`/api/cart/validate`)
   - Warns user of stock issues before checkout
   - Non-blocking - just shows warnings

2. **At checkout** (`/api/cart/checkout`)
   - Enforces stock validation
   - Blocks order creation if insufficient stock
   - Ensures data consistency

### Validation Logic
```javascript
for each item in cart:
  if product.stock === 0:
    return error "Product out of stock"
  if product.stock < item.quantity:
    return error "Insufficient stock"
```

## Security Features
- All cart routes require authentication
- User can only access their own cart
- Stock validation prevents overselling
- Product prices from database (not from client)
- Promotion application server-side

## Performance Optimizations
- Cart badge fetches only count (not full cart)
- Cart enrichment only on cart page view
- Indexes on userId for fast cart lookups
- TTL index for automatic cleanup
- Debounced quantity updates

## Error Handling
- Graceful handling of non-existent carts
- Clear error messages for stock issues
- Auto-dismiss notifications
- Loading states prevent duplicate requests
- Rollback on checkout failure

## Testing Scenarios

### Happy Path
1. Browse catalog → Click "Add to Cart" → Item added to cart
2. Open cart → Adjust quantities → Update successful
3. Fill shipping address → Click checkout → Order created
4. View orders → Order appears with correct details

### Edge Cases
1. Add out-of-stock item → Error message shown
2. Increase quantity beyond stock → Update prevented
3. Checkout with insufficient stock → Validation error
4. Cart expires after 30 days → Automatically deleted
5. Product deleted while in cart → Snapshot preserved

## API Response Examples

### Get Cart Response
```json
{
  "success": true,
  "data": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "productId": "product_id",
        "productSnapshot": {
          "name": "Product Name",
          "price": 29.99,
          "imageUrl": "/images/product.jpg",
          "category": "Fashion",
          "brand": "Brand"
        },
        "quantity": 2,
        "currentPrice": 23.99,
        "stock": 100,
        "activePromotion": {
          "name": "Halloween Sale",
          "discountPercentage": 20
        }
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Checkout Response
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-1234567890",
    "userId": "user_id",
    "items": [...],
    "totalAmount": 47.98,
    "status": "pending",
    "shippingAddress": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Future Enhancements
- [ ] Saved for later feature
- [ ] Cart sharing between devices (real-time sync)
- [ ] Apply coupon codes
- [ ] Bulk actions (select multiple items)
- [ ] Wishlist integration
- [ ] Recently viewed items
- [ ] Cart abandonment emails
- [ ] Guest cart (before login)
- [ ] Cart analytics (most added items, abandonment rate)

## Files Modified/Created

### Backend
- ✅ `models/Cart.js` - Created
- ✅ `controllers/cartController.js` - Created
- ✅ `routes/cartRoutes.js` - Created
- ✅ `server.js` - Modified (added cart routes)
- ✅ `seed.js` - Modified (added cart cleanup)

### Frontend
- ✅ `pages/Cart.js` - Created
- ✅ `pages/ProductDetail.js` - Modified (added Add to Cart)
- ✅ `pages/ProductCatalogGothic.js` - Modified (added Add to Cart)
- ✅ `components/Layout.js` - Modified (added cart badge)
- ✅ `App.js` - Modified (added /cart route)

### Documentation
- ✅ `CART_FEATURE.md` - Created (this file)

## Development Notes
- Halloween theme maintained throughout
- Responsive design for all screen sizes
- Smooth animations and transitions
- Consistent error handling patterns
- NoSQL best practices followed
- RESTful API conventions
- Clean code with comments

---

**Status**: ✅ Complete and functional
**Last Updated**: November 4, 2025
**Developer**: GitHub Copilot
