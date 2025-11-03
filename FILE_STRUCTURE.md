# File Structure Visualization

```
📁 quan_ly_khuyen_mai/
│
├── 📄 .gitignore                      # Git ignore rules
├── 📄 README.md                       # Main documentation (English)
├── 📄 QUICKSTART.md                   # Quick start guide (Vietnamese & English)
├── 📄 API_TESTING.md                  # API testing examples
├── 📄 PROJECT_SUMMARY.md              # Project overview and summary
├── 📄 docker-compose.yml              # Docker multi-container setup
├── 📄 setup.bat                       # Windows setup script
├── 📄 start.bat                       # Windows start script
│
├── 📁 backend/                        # Backend API (Node.js/Express)
│   ├── 📄 .env                        # Environment variables (local)
│   ├── 📄 .env.example                # Environment variables template
│   ├── 📄 package.json                # Backend dependencies
│   ├── 📄 server.js                   # Main server entry point
│   ├── 📄 seed.js                     # Database seeding script
│   ├── 📄 Dockerfile                  # Backend Docker image
│   │
│   ├── 📁 config/                     # Configuration files
│   │   └── 📄 database.js             # MongoDB connection
│   │
│   ├── 📁 models/                     # Mongoose schemas
│   │   ├── 📄 User.js                 # User model with auth
│   │   ├── 📄 Product.js              # Product model
│   │   └── 📄 Promotion.js            # Promotion model
│   │
│   ├── 📁 controllers/                # Business logic
│   │   ├── 📄 authController.js       # Authentication logic
│   │   ├── 📄 productController.js    # Product CRUD logic
│   │   └── 📄 promotionController.js  # Promotion CRUD logic
│   │
│   ├── 📁 routes/                     # API endpoints
│   │   ├── 📄 authRoutes.js           # Auth endpoints
│   │   ├── 📄 productRoutes.js        # Product endpoints
│   │   └── 📄 promotionRoutes.js      # Promotion endpoints
│   │
│   └── 📁 middleware/                 # Custom middleware
│       ├── 📄 auth.js                 # JWT verification
│       └── 📄 errorHandler.js         # Error handling
│
└── 📁 frontend/                       # Frontend UI (React.js)
    ├── 📄 package.json                # Frontend dependencies
    ├── 📄 Dockerfile                  # Frontend Docker image
    │
    ├── 📁 public/                     # Static files
    │   └── 📄 index.html              # HTML template
    │
    └── 📁 src/                        # Source code
        ├── 📄 index.js                # React entry point
        ├── 📄 index.css               # Global styles
        ├── 📄 App.js                  # Main app component
        │
        ├── 📁 context/                # Global state
        │   └── 📄 AuthContext.js      # Authentication context
        │
        ├── 📁 utils/                  # Utility functions
        │   └── 📄 api.js              # Axios HTTP client
        │
        ├── 📁 components/             # Reusable components
        │   ├── 📄 Layout.js           # App layout & navigation
        │   └── 📄 PrivateRoute.js     # Protected route wrapper
        │
        └── 📁 pages/                  # Page components
            ├── 📄 Login.js            # Login page
            ├── 📄 Register.js         # Registration page
            ├── 📄 Dashboard.js        # Promotion dashboard
            ├── 📄 PromotionForm.js    # Create/Edit promotion
            └── 📄 Products.js         # Product management

```

## File Count Summary

### Root Level: 9 files
- 5 Documentation files (.md)
- 2 Script files (.bat)
- 1 Docker compose file
- 1 Git ignore file

### Backend: 18 files
- 3 Models (User, Product, Promotion)
- 3 Controllers (Auth, Product, Promotion)
- 3 Routes (Auth, Product, Promotion)
- 2 Middleware (Auth, Error Handler)
- 1 Config (Database)
- 6 Setup files (package.json, server.js, seed.js, .env, .env.example, Dockerfile)

### Frontend: 14 files
- 5 Pages (Login, Register, Dashboard, PromotionForm, Products)
- 2 Components (Layout, PrivateRoute)
- 1 Context (AuthContext)
- 1 Utility (API client)
- 5 Setup files (package.json, index.js, App.js, index.css, index.html, Dockerfile)

**Total Files: 41 files**

## Technology Breakdown

### Backend Stack
```
Node.js + Express.js
    ↓
MongoDB + Mongoose
    ↓
JWT + bcryptjs
    ↓
RESTful API
```

### Frontend Stack
```
React.js
    ↓
Material-UI Components
    ↓
React Router (Navigation)
    ↓
Context API (State)
    ↓
Axios (HTTP)
```

### Data Flow
```
User Interface (React)
    ↕ (HTTP/JSON)
API Layer (Express)
    ↕ (Mongoose)
Database (MongoDB)
```

## API Route Structure

```
/api
├── /auth
│   ├── POST /register      (Public)
│   ├── POST /login         (Public)
│   └── GET  /me            (Protected)
│
├── /products
│   ├── GET    /                    (Public)
│   ├── GET    /:id                 (Public)
│   ├── POST   /                    (Admin)
│   ├── PUT    /:id                 (Admin)
│   ├── DELETE /:id                 (Admin)
│   └── GET    /categories/list     (Public)
│
└── /promotions
    ├── GET    /                    (Public)
    ├── GET    /:id                 (Public)
    ├── POST   /                    (Admin)
    ├── PUT    /:id                 (Admin)
    ├── DELETE /:id                 (Admin)
    ├── PATCH  /:id/status          (Admin)
    └── GET    /active/list         (Public)
```

## Component Hierarchy

```
App
├── AuthProvider (Context)
    ├── Router
        ├── Public Routes
        │   ├── Login
        │   └── Register
        │
        └── Private Routes (with Layout)
            ├── Dashboard (Promotion List)
            ├── PromotionForm (Create/Edit)
            └── Products (Product Management)
```

## Database Collections

```
MongoDB: promotion_management
├── users
│   └── Documents: {_id, username, password, role, createdAt}
│
├── products
│   └── Documents: {_id, name, price, category, description, stock}
│
└── promotions
    └── Documents: {_id, name, description, discountPercentage, 
                    startDate, endDate, applicableProducts[], status}
```

## Port Configuration

```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000
MongoDB:   mongodb://localhost:27017
```

## Authentication Flow

```
1. User submits login credentials
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in all API requests
6. Backend verifies token in protected routes
7. Backend checks user role for admin routes
```

## Development Workflow

```
1. Run MongoDB
   ↓
2. Setup backend (npm install + seed)
   ↓
3. Start backend server (npm run dev)
   ↓
4. Setup frontend (npm install)
   ↓
5. Start frontend server (npm start)
   ↓
6. Access http://localhost:3000
```

This visualization helps understand the complete project structure at a glance!
