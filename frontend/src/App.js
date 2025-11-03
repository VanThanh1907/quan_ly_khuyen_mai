import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PromotionForm from './pages/PromotionForm';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductCatalogGothic from './pages/ProductCatalogGothic';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Private routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/products/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <ProductDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/catalog"
              element={
                <PrivateRoute>
                  <Layout>
                    <ProductCatalogGothic />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Redirect old gothic route to new catalog */}
            <Route path="/catalog-gothic" element={<Navigate to="/catalog" replace />} />
            
            <Route
              path="/promotions/new"
              element={
                <PrivateRoute adminOnly>
                  <Layout>
                    <PromotionForm />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/promotions/edit/:id"
              element={
                <PrivateRoute adminOnly>
                  <Layout>
                    <PromotionForm />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
