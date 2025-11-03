import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Logout as LogoutIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" className="gradient-animated">
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 0, 
              mr: 4, 
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.4rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}
            onClick={() => navigate('/dashboard')}
            className="animate-float"
          >
            🎉 Promotion Manager
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              className="smooth-transition"
              sx={{
                backgroundColor: location.pathname === '/dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Promotions
            </Button>
            <Button
              color="inherit"
              startIcon={<InventoryIcon />}
              onClick={() => navigate('/products')}
              className="smooth-transition"
              sx={{
                backgroundColor: location.pathname === '/products' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Products
            </Button>
            <Button
              color="inherit"
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate('/catalog')}
              className="smooth-transition"
              sx={{
                backgroundColor: location.pathname === '/catalog' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: 2,
                px: 2,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              🛍️ Catalog
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user?.username} {isAdmin() && '(Admin)'}
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#f8fafc' }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            © 2025 Promotion Management System. All rights reserved. 💼
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
            Built with ❤️ using React & Node.js
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
