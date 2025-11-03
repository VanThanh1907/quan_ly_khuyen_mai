# Quick Start Guide - Hướng dẫn Nhanh

## Tiếng Việt

### Yêu cầu hệ thống
- Node.js (phiên bản 14 trở lên)
- MongoDB (chạy local hoặc dùng MongoDB Atlas)
- npm hoặc yarn

### Cài đặt nhanh

#### Cách 1: Sử dụng script tự động (Khuyến nghị)

1. **Đảm bảo MongoDB đang chạy**
   - Mở MongoDB Compass hoặc
   - Chạy lệnh: `mongod`

2. **Chạy script setup**
   ```bash
   setup.bat
   ```
   Script này sẽ:
   - Cài đặt tất cả dependencies cho backend và frontend
   - Tạo database và thêm dữ liệu mẫu
   
3. **Khởi động ứng dụng**
   ```bash
   start.bat
   ```
   Hoặc thủ công:
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

#### Cách 2: Cài đặt thủ công

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run seed    # Tạo dữ liệu mẫu
   npm run dev     # Chạy server
   ```

2. **Frontend** (Terminal mới)
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

### Tài khoản test

Sau khi chạy seed script, sử dụng các tài khoản sau:

**Admin (Toàn quyền)**
- Username: `admin`
- Password: `admin123`

**User (Chỉ xem)**
- Username: `user`
- Password: `user123`

### Chức năng chính

✅ **Quản lý khuyến mãi**
- Xem danh sách khuyến mãi
- Tạo, sửa, xóa khuyến mãi (Admin)
- Lọc và tìm kiếm khuyến mãi
- Phân trang dữ liệu

✅ **Quản lý sản phẩm**
- Xem danh sách sản phẩm
- Thêm, sửa, xóa sản phẩm (Admin)
- Gán sản phẩm vào khuyến mãi

✅ **Xác thực người dùng**
- Đăng nhân/Đăng ký
- Phân quyền Admin/User
- Bảo mật với JWT

### Khắc phục sự cố

**Lỗi kết nối MongoDB:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
➡️ Giải pháp: Đảm bảo MongoDB đang chạy
```bash
mongod
```

**Port đã được sử dụng:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
➡️ Giải pháp: Thay đổi PORT trong file `.env`

**Module not found:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Cấu trúc thư mục

```
quan_ly_khuyen_mai/
├── backend/              # Node.js/Express API
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & error handling
│   └── config/          # Database config
├── frontend/            # React.js UI
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   └── utils/       # Helper functions
├── README.md            # Tài liệu đầy đủ
├── API_TESTING.md       # Hướng dẫn test API
├── setup.bat            # Script cài đặt
└── start.bat            # Script khởi động
```

---

## English

### System Requirements
- Node.js (version 14+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Quick Installation

#### Method 1: Using automated scripts (Recommended)

1. **Make sure MongoDB is running**
   - Open MongoDB Compass or
   - Run command: `mongod`

2. **Run setup script**
   ```bash
   setup.bat
   ```
   This script will:
   - Install all dependencies for backend and frontend
   - Create database and seed sample data
   
3. **Start the application**
   ```bash
   start.bat
   ```
   Or manually:
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

#### Method 2: Manual Installation

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run seed    # Create sample data
   npm run dev     # Start server
   ```

2. **Frontend** (New terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

### Test Accounts

After running the seed script, use these accounts:

**Admin (Full access)**
- Username: `admin`
- Password: `admin123`

**User (Read-only)**
- Username: `user`
- Password: `user123`

### Main Features

✅ **Promotion Management**
- View promotion list
- Create, edit, delete promotions (Admin)
- Filter and search promotions
- Data pagination

✅ **Product Management**
- View product list
- Add, edit, delete products (Admin)
- Assign products to promotions

✅ **User Authentication**
- Login/Register
- Admin/User roles
- JWT security

### Troubleshooting

**MongoDB connection error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
➡️ Solution: Make sure MongoDB is running
```bash
mongod
```

**Port already in use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
➡️ Solution: Change PORT in `.env` file

**Module not found:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Folder Structure

```
quan_ly_khuyen_mai/
├── backend/              # Node.js/Express API
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & error handling
│   └── config/          # Database config
├── frontend/            # React.js UI
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   └── utils/       # Helper functions
├── README.md            # Full documentation
├── API_TESTING.md       # API testing guide
├── setup.bat            # Setup script
└── start.bat            # Start script
```

### Docker Deployment (Optional)

```bash
docker-compose up -d
```

This will start all services (MongoDB, Backend, Frontend) in containers.

---

## Technology Stack

### Backend
- **Node.js** & **Express.js** - Web framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Validation

### Frontend
- **React.js** - UI library
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management

---

## Support

For detailed documentation, see [README.md](./README.md)

For API testing examples, see [API_TESTING.md](./API_TESTING.md)

For issues, please create an issue in the repository.
