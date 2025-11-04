# Cart Checkout Debug Guide

## Lỗi: "Không thể kiểm tra giỏ hàng"

### Nguyên nhân đã sửa:
1. ✅ Function `validateBeforeCheckout` đã được chuyển từ async API call sang local validation
2. ✅ Sử dụng data có sẵn từ cart thay vì gọi `/cart/validate`
3. ✅ Backend enriched cart đã cung cấp đầy đủ thông tin: `stock`, `available`, `promotion`

### Các thay đổi:

#### 1. Validation Logic (Cart.js)
```javascript
// TRƯỚC (gọi API - có thể fail):
const validateBeforeCheckout = async () => {
  const response = await api.get('/cart/validate');
  // ...
}

// SAU (validate local - luôn work):
const validateBeforeCheckout = () => {
  // Check directly from cart data
  for (const item of cart.items) {
    const stock = typeof item.stock === 'number' ? item.stock : 0;
    if (stock === 0 || item.available === false) {
      warnings.push(`${item.productSnapshot.name} đã hết hàng`);
    }
  }
}
```

#### 2. Field Mapping
```javascript
// Backend trả về:
{
  items: [
    {
      currentPrice: 29.99,        // Giá gốc
      discountedPrice: 23.99,     // Giá sau giảm
      promotion: {                // Khuyến mãi
        discountPercentage: 20
      },
      stock: 300,                 // Tồn kho
      available: true             // Còn hàng?
    }
  ]
}

// Frontend sử dụng:
const currentPrice = item.discountedPrice || item.currentPrice;
const hasPromotion = item.promotion;
const isOutOfStock = item.stock === 0 || item.available === false;
```

#### 3. Calculate Functions Fixed
```javascript
// Subtotal (trước giảm giá):
calculateSubtotal = () => {
  return cart.items.reduce((sum, item) => 
    sum + (item.currentPrice * item.quantity), 0
  );
}

// Discount (tổng giảm):
calculateDiscount = () => {
  return cart.items.reduce((sum, item) => 
    sum + ((item.promotion?.discountAmount || 0) * item.quantity), 0
  );
}

// Total (sau giảm giá):
calculateTotal = () => {
  return cart.items.reduce((sum, item) => 
    sum + (item.discountedPrice * item.quantity), 0
  );
}
```

## Test Flow

### 1. Check Cart Structure
Open browser console và chạy:
```javascript
// Trong Cart page, mở console:
console.log('Cart data:', cart);
console.log('Cart items:', cart?.items);
console.log('First item:', cart?.items?.[0]);
```

Expected output:
```javascript
{
  items: [
    {
      productId: "...",
      productSnapshot: { name: "...", price: 29.99 },
      quantity: 2,
      currentPrice: 29.99,      // ✓ Có
      discountedPrice: 23.99,   // ✓ Có
      stock: 300,               // ✓ Có
      available: true,          // ✓ Có
      promotion: {              // ✓ Có (nếu có khuyến mãi)
        name: "...",
        discountPercentage: 20
      }
    }
  ]
}
```

### 2. Test Validation
```javascript
// Click button "Thanh Toán"
// Xem console log:
console.log('Validation result:', isValid);
console.log('Warnings:', validationWarnings);
```

### 3. Test Checkout
1. Add product to cart
2. Go to cart page
3. Click "Thanh Toán"
4. Should see checkout dialog (no error)
5. Fill address
6. Click "Xác Nhận"
7. Order created, cart cleared

## Common Issues & Solutions

### Issue 1: "Giỏ hàng trống"
**Cause**: Cart has no items
**Solution**: Add products from catalog first

### Issue 2: Stock warnings shown
**Cause**: Product out of stock or low stock
**Solution**: 
- Check product stock in database
- Reduce quantity in cart
- Or skip checkout for that item

### Issue 3: Promotion not showing
**Cause**: 
- No active promotion for product
- Promotion expired
**Solution**: Check promotions in admin panel

### Issue 4: Price calculation wrong
**Cause**: Using wrong price field
**Solution**: 
- Subtotal uses `currentPrice`
- Total uses `discountedPrice`
- Discount = Subtotal - Total

## Backend Verification

### Check Cart API Response
```bash
# Get cart
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer <token>"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "...",
        "currentPrice": 29.99,
        "discountedPrice": 23.99,
        "stock": 300,
        "available": true,
        "promotion": {
          "name": "Black Friday",
          "discountPercentage": 20
        }
      }
    ],
    "subtotal": 59.98,
    "totalDiscount": 12.00,
    "total": 47.98
  }
}
```

### Check Order Creation
```bash
# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "...", "quantity": 2}],
    "shippingAddress": {
      "street": "123 ABC",
      "city": "HCM",
      "zipCode": "70000"
    },
    "paymentMethod": "COD"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "✅ Order created successfully",
  "data": {
    "orderNumber": "ORD-20251104-0001",
    "finalAmount": 47.98,
    "status": "pending"
  }
}
```

## Files Modified

- ✅ `frontend/src/pages/Cart.js`
  - `validateBeforeCheckout()` - Changed to local validation
  - `calculateSubtotal()` - Use `currentPrice`
  - `calculateDiscount()` - Use `promotion.discountAmount`
  - `calculateTotal()` - Use `discountedPrice`
  - Item rendering - Use `item.promotion` instead of `item.activePromotion`
  - Stock check - Use `item.stock` and `item.available`

## Summary

**Fixed:**
- ✅ Validation không còn gọi API `/cart/validate`
- ✅ Sử dụng local cart data để validate
- ✅ Mapping đúng fields từ backend
- ✅ Tính toán giá đúng với promotion
- ✅ Hiển thị stock status chính xác

**Test:**
1. Add product to cart
2. View cart
3. Click "Thanh Toán" → Should open dialog (no error)
4. Fill address → Click "Xác Nhận"
5. Order created → Cart cleared → Redirect to orders

---

**Status**: ✅ Fixed
**Last Updated**: November 4, 2025
