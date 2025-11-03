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
  MenuItem,
  Badge
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Logout as LogoutIcon,
  ShoppingCart as ShoppingCartIcon,
  AutoStories as GothicIcon,
  Receipt as OrderIcon,
  ShoppingBasket as CartIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Halloween styles
const halloweenLayoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');
  
  @keyframes float-nav {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes wiggle-nav {
    0%, 100% { transform: rotate(-2deg); }
    50% { transform: rotate(2deg); }
  }
  
  @keyframes glow-nav {
    0%, 100% { text-shadow: 0 0 10px #ff8c00, 0 0 20px #ff8c00; }
    50% { text-shadow: 0 0 20px #ff8c00, 0 0 40px #ff8c00, 0 0 60px #ffa500; }
  }
  
  @keyframes click-effect {
    0% { 
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    50% { 
      transform: scale(1.5) rotate(180deg);
      opacity: 0.7;
    }
    100% { 
      transform: scale(0) rotate(360deg);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(220, 20, 60, 0.7);
    }
    50% { 
      transform: scale(1.05);
      box-shadow: 0 0 0 5px rgba(220, 20, 60, 0);
    }
  }
  
  .halloween-navbar {
    background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f2e 100%) !important;
    border-bottom: 3px solid #ff8c00;
    box-shadow: 0 4px 20px rgba(255, 140, 0, 0.3);
  }
  
  .halloween-footer {
    background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f2e 100%) !important;
    border-top: 3px solid #ff8c00;
    box-shadow: 0 -4px 20px rgba(255, 140, 0, 0.3);
  }
`;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [clickEffects, setClickEffects] = React.useState([]);
  const [cartItemCount, setCartItemCount] = React.useState(0);

  // Fetch cart count
  React.useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await api.get('/cart');
        const totalItems = response.data.data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    
    if (user) {
      fetchCartCount();
    }
  }, [user, location.pathname]); // Re-fetch when path changes

  // Click effect handler
  const handlePageClick = (e) => {
    const effect = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      emoji: ['🎃', '👻', '🦇', '🕷️', '✨'][Math.floor(Math.random() * 5)]
    };
    
    setClickEffects(prev => [...prev, effect]);
    
    setTimeout(() => {
      setClickEffects(prev => prev.filter(eff => eff.id !== effect.id));
    }, 1000);
  };

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
    <>
      <style>{halloweenLayoutStyles}</style>
      <Box 
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        onClick={handlePageClick}
      >
        {/* Click effects */}
        {clickEffects.map(effect => (
          <div 
            key={effect.id}
            style={{
              position: 'fixed',
              left: effect.x,
              top: effect.y,
              fontSize: '2rem',
              animation: 'click-effect 1s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 9999
            }}
          >
            {effect.emoji}
          </div>
        ))}

        <AppBar position="static" className="halloween-navbar">
          <Toolbar sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
              <Typography
                sx={{ 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  mr: 1,
                  animation: 'wiggle-nav 2s ease-in-out infinite'
                }}
              >
                🎃
              </Typography>
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  flexGrow: 0,
                  cursor: 'pointer',
                  fontFamily: 'Creepster, cursive',
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' },
                  color: '#ff8c00',
                  animation: 'glow-nav 2s ease-in-out infinite',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.3s ease'
                  }
                }}
                onClick={() => navigate('/dashboard')}
              >
                SPOOKY MANAGER
              </Typography>
              <Typography
                sx={{ 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  ml: 1,
                  animation: 'float-nav 3s ease-in-out infinite'
                }}
              >
                👻
              </Typography>
            </Box>

            
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{
                  background: location.pathname === '/dashboard' 
                    ? 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)' 
                    : 'rgba(45, 27, 78, 0.6)',
                  color: location.pathname === '/dashboard' ? '#1a0f2e' : '#ffa500',
                  border: '2px solid',
                  borderColor: location.pathname === '/dashboard' ? '#ffa500' : '#ff8c00',
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.8,
                  fontFamily: 'Creepster, cursive',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 700,
                  boxShadow: location.pathname === '/dashboard' 
                    ? '0 0 15px rgba(255, 140, 0, 0.5)' 
                    : 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 0 25px rgba(255, 140, 0, 0.7)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                🎃 Promotions
              </Button>
              <Button
                startIcon={<InventoryIcon />}
                onClick={() => navigate('/products')}
                sx={{
                  background: location.pathname === '/products' 
                    ? 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)' 
                    : 'rgba(45, 27, 78, 0.6)',
                  color: location.pathname === '/products' ? '#1a0f2e' : '#ffa500',
                  border: '2px solid',
                  borderColor: location.pathname === '/products' ? '#ffa500' : '#ff8c00',
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.8,
                  fontFamily: 'Creepster, cursive',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 700,
                  boxShadow: location.pathname === '/products' 
                    ? '0 0 15px rgba(255, 140, 0, 0.5)' 
                    : 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 0 25px rgba(255, 140, 0, 0.7)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                🧪 Products
              </Button>
              <Button
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate('/catalog')}
                sx={{
                  background: location.pathname === '/catalog' 
                    ? 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)' 
                    : 'rgba(45, 27, 78, 0.6)',
                  color: location.pathname === '/catalog' ? '#1a0f2e' : '#ffa500',
                  border: '2px solid',
                  borderColor: location.pathname === '/catalog' ? '#ffa500' : '#ff8c00',
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.8,
                  fontFamily: 'Creepster, cursive',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 700,
                  boxShadow: location.pathname === '/catalog' 
                    ? '0 0 15px rgba(255, 140, 0, 0.5)' 
                    : 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 0 25px rgba(255, 140, 0, 0.7)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                🛍️ Catalog
              </Button>
              <Button
                startIcon={<OrderIcon />}
                onClick={() => navigate('/orders')}
                sx={{
                  background: location.pathname === '/orders' 
                    ? 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)' 
                    : 'rgba(45, 27, 78, 0.6)',
                  color: location.pathname === '/orders' ? '#1a0f2e' : '#ffa500',
                  border: '2px solid',
                  borderColor: location.pathname === '/orders' ? '#ffa500' : '#ff8c00',
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.8,
                  fontFamily: 'Creepster, cursive',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 700,
                  boxShadow: location.pathname === '/orders' 
                    ? '0 0 15px rgba(255, 140, 0, 0.5)' 
                    : 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 0 25px rgba(255, 140, 0, 0.7)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                📦 Orders
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Cart Icon with Badge */}
              <IconButton
                onClick={() => navigate('/cart')}
                sx={{
                  color: location.pathname === '/cart' ? '#1a0f2e' : '#ff8c00',
                  background: location.pathname === '/cart'
                    ? 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)'
                    : 'rgba(45, 27, 78, 0.6)',
                  border: '2px solid #ff8c00',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    transform: 'scale(1.1)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Badge 
                  badgeContent={cartItemCount} 
                  sx={{
                    '& .MuiBadge-badge': {
                      background: 'linear-gradient(135deg, #dc143c 0%, #ff0000 100%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      animation: cartItemCount > 0 ? 'pulse 2s infinite' : 'none'
                    }
                  }}
                >
                  <CartIcon />
                </Badge>
              </IconButton>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                background: 'rgba(45, 27, 78, 0.6)',
                border: '2px solid #ff8c00',
                borderRadius: 2,
                px: 2,
                py: 0.5
              }}>
                <Typography sx={{ 
                  fontFamily: 'Creepster, cursive',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  color: '#ffa500',
                  mr: 1
                }}>
                  👤 {user?.username}
                </Typography>
                {isAdmin() && (
                  <Typography sx={{ 
                    fontFamily: 'Creepster, cursive',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    color: '#39ff14',
                    background: 'rgba(57, 255, 20, 0.1)',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    border: '1px solid #39ff14'
                  }}>
                    👑 Admin
                  </Typography>
                )}
              </Box>
              <IconButton
                size="large"
                onClick={handleMenu}
                sx={{
                  color: '#ff8c00',
                  background: 'rgba(45, 27, 78, 0.6)',
                  border: '2px solid #ff8c00',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    transform: 'rotate(15deg) scale(1.1)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    background: 'rgba(26, 15, 46, 0.98)',
                    border: '2px solid #ff8c00',
                    boxShadow: '0 0 20px rgba(255, 140, 0, 0.5)',
                    mt: 1
                  }
                }}
              >
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    fontFamily: 'Creepster, cursive',
                    fontSize: '1.1rem',
                    color: '#ffa500',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #dc143c 0%, #ff0000 100%)',
                      color: '#fff'
                    }
                  }}
                >
                  <LogoutIcon sx={{ mr: 1, color: '#dc143c' }} fontSize="small" />
                  🚪 Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#1a0f2e' }}>
          {children}
        </Box>

        <Box
          component="footer"
          className="halloween-footer"
          sx={{
            py: 1.5,
            px: 2,
            mt: 'auto'
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Typography sx={{ 
                fontFamily: 'Creepster, cursive',
                fontSize: { xs: '1rem', sm: '1.1rem' },
                color: '#ff8c00',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                🎃 © 2025 Spooky Deals
              </Typography>
              
              <Typography sx={{ 
                fontFamily: 'Creepster, cursive',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                color: '#b19cd9'
              }}>
                Made with dark magic ✨ React & Node.js ⚡
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Layout;
