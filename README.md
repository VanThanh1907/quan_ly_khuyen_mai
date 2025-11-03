# Promotion Management System

A full-stack web application for managing promotion information using MongoDB, Node.js/Express, and React.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication with role-based access control (Admin/User)
- **Promotion Management**: Full CRUD operations for promotions with filtering and pagination
- **Product Management**: Manage products that can be associated with promotions
- **Admin Dashboard**: Comprehensive dashboard for managing promotions and products
- **Responsive UI**: Modern Material-UI design that works on all devices
- **Real-time Validation**: Client and server-side validation for data integrity

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher) - Running locally or use MongoDB Atlas
- **npm** or **yarn** package manager

## 🏗️ Project Structure

```
quan_ly_khuyen_mai/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── promotionController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Promotion.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── promotionRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Products.js
│   │   │   ├── PromotionForm.js
│   │   │   └── Register.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
├── .gitignore
└── README.md
```

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd "C:\Users\Thanh\Desktop\HUIT\HOC KY 7\NoSQL\quan_ly_khuyen_mai"
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is running on `mongodb://localhost:27017`
- The database will be automatically created as `promotion_management`

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in backend `.env` file

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (or use the existing one):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/promotion_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## 🎯 Usage

### First Time Setup

1. **Start the application** (both backend and frontend)
2. **Register a new account** at `http://localhost:3000/register`
   - Choose "Admin" role to have full access
   - Choose "User" role for read-only access
3. **Login** with your credentials
4. **Add some products** first (Products menu)
5. **Create promotions** and associate them with products

### User Roles

- **Admin**: Can create, edit, and delete promotions and products
- **User**: Can view promotions and products (read-only)

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Promotions
- `GET /api/promotions` - Get all promotions (with filters)
- `GET /api/promotions/:id` - Get single promotion
- `POST /api/promotions` - Create promotion (Admin only)
- `PUT /api/promotions/:id` - Update promotion (Admin only)
- `DELETE /api/promotions/:id` - Delete promotion (Admin only)
- `GET /api/promotions/active/list` - Get active promotions
- `PATCH /api/promotions/:id/status` - Update promotion status (Admin only)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/categories/list` - Get all categories

## 🐳 Docker Setup (Optional)

### Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- MongoDB container on port 27017
- Backend API on port 5000
- Frontend on port 3000

### Stop Docker Containers

```bash
docker-compose down
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The optimized production build will be in the `frontend/build` folder.

## 🛠️ Technologies Used

### Backend
- Node.js & Express.js
- MongoDB & Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Joi for validation
- CORS for cross-origin requests

### Frontend
- React.js
- React Router for navigation
- Material-UI (MUI) for UI components
- Axios for API calls
- Context API for state management
- date-fns for date formatting

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/promotion_management
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (Optional)
Create `.env` in frontend folder:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with middleware
- Role-based access control
- Input validation on both client and server
- CORS configuration

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check MongoDB service
- Verify connection string in `.env` file
- For MongoDB Atlas, check network access settings

### Port Already in Use
- Backend: Change PORT in `.env` file
- Frontend: React will prompt to use different port

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📄 License

This project is licensed under the ISC License.

## 👥 Author

Created for HUIT NoSQL Course - Semester 7

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements.

## 📞 Support

For issues and questions, please create an issue in the repository.
