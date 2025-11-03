# 🎯 NoSQL Feature Demo - Cheat Sheet

## Quick Commands

```bash
# 1. Seed database
npm run seed

# 2. Run NoSQL demo
node testNoSQLFeature.js

# 3. Start server
npm run dev
```

## Test Accounts
- **User:** `user` / `user123`
- **Admin:** `admin` / `admin123`

## Key API Endpoints

### Create Order
```http
POST http://localhost:5000/api/orders
Authorization: Bearer <token>

{
  "items": [
    { "productId": "...", "quantity": 1 }
  ],
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 ABC",
    "city": "TP.HCM"
  },
  "paymentMethod": "cash"
}
```

### Get My Orders
```http
GET http://localhost:5000/api/orders/my-orders
Authorization: Bearer <token>
```

### Get Order Detail
```http
GET http://localhost:5000/api/orders/:id
Authorization: Bearer <token>
```

## NoSQL Demo Steps

1. **Login** → Get token
2. **Get Products** → Copy product ID
3. **Create Order** → Copy order ID
4. **Check Order** → See product exists
5. **Delete Product** (Admin)
6. **Check Order Again** → Product deleted but order still has data! 🎯

## Key Concept

### Data Denormalization

**SQL:**
```sql
OrderItems → productId (reference)
❌ Xóa Product → Mất thông tin!
```

**NoSQL:**
```javascript
Order → productSnapshot (embedded)
✅ Xóa Product → Vẫn có đầy đủ thông tin!
```

## Documentation Files

1. **QUICKSTART.md** - Start here! ⭐
2. **ORDER_README.md** - Complete guide
3. **NOSQL_DEMO.md** - API reference
4. **IMPLEMENTATION_SUMMARY.md** - Technical details
5. **ORDER_COMPLETE.md** - Overview

## Postman Collection

Import: `Order_API.postman_collection.json`

Run: "🎯 NoSQL Demo Scenario" folder

## What to Show

### For Teacher/Presentation

1. **Explain NoSQL Concept**
   - Data denormalization
   - Why it matters
   - Trade-offs

2. **Run Demo Script**
   ```bash
   node testNoSQLFeature.js
   ```
   - Shows order with product
   - Deletes product
   - Order still has product data!

3. **Show API Response**
   - `productSnapshot` - Has all data
   - `productExistence` - Shows product deleted
   - Historical data preserved

4. **Explain Use Case**
   - E-commerce (Amazon, Shopee)
   - Food delivery (GrabFood)
   - Booking (Booking.com)

## Key Points to Mention

✅ **Data Denormalization**
- Lưu duplicate data thay vì reference
- Trade-off: Storage vs Consistency

✅ **Document Embedding**
- Nest data vào document
- No JOIN needed

✅ **Historical Preservation**
- Order không đổi khi product thay đổi
- Đúng với business logic

✅ **Performance**
- Read fast (no JOIN)
- Single query for all data

✅ **Flexibility**
- Schema không cứng nhắc
- Dễ mở rộng

## Common Questions

**Q: Tại sao không dùng reference?**
A: Historical data cần bảo toàn. Giá/thông tin tại thời điểm mua không được thay đổi.

**Q: Vậy data không đồng bộ sao?**
A: Đúng, nhưng đó là trade-off. Order history KHÔNG NÊN đồng bộ với product hiện tại.

**Q: Khi nào dùng denormalization?**
A: Khi cần historical accuracy, read-heavy, hoặc complex relationships.

## Success Metrics

After demo, you showed:
- [x] NoSQL denormalization concept
- [x] Working implementation
- [x] Real-world use case
- [x] Trade-off understanding
- [x] Production-ready code

---

**🎯 Remember: Order survives product deletion! That's NoSQL! ✨**
