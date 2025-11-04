import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Box,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  InputAdornment,
  Fade,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LocalOffer as OfferIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  AutoAwesome as MagicIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import api from '../utils/api';

const ProductCatalogGothic = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', { params: { limit: 100 } });
      const productsData = response.data.data;
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      const uniqueCategories = [...new Set(productsData.map(p => p.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch products from the abyss');
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (productId, e) => {
    // Prevent navigation to product detail
    e.stopPropagation();
    
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    setError('');
    setSuccess('');
    
    try {
      await api.post('/cart/add', {
        productId: productId,
        quantity: 1,
      });
      
      setSuccess('✅ Đã thêm vào giỏ hàng!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getImageUrl = (product) => {
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('/')) {
        return product.imageUrl;
      }
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
    }
    return 'https://via.placeholder.com/400x300?text=Artifact+of+Darkness';
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z' fill='%23ff8c00' opacity='0.05'/%3E%3C/svg%3E")`,
            animation: 'twinkle 3s infinite'
          }
        }}
      >
        <Box textAlign="center">
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <CircularProgress 
              size={80} 
              sx={{ 
                color: '#ff8c00',
                filter: 'drop-shadow(0 0 15px #ff8c00)'
              }} 
            />
            <Typography 
              sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '2rem'
              }}
            >
              🎃
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3, 
              color: '#ff8c00',
              fontFamily: '"Creepster", cursive',
              textShadow: '0 0 20px rgba(255, 140, 0, 0.8)',
              fontSize: '1.5rem'
            }}
          >
            Brewing the Collection... 🧙‍♀️
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          icon={<span style={{ fontSize: '1.5rem' }}>👻</span>}
          sx={{
            background: 'rgba(255, 140, 0, 0.15)',
            color: '#ff8c00',
            border: '2px solid #ff8c00',
            fontFamily: '"Creepster", cursive',
            fontSize: '1.1rem'
          }}
        >
          Oops! A ghost scared away the products! {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d1b4e 0%, #ff8c00 5%, #2d1b4e 10%, #000 50%, #1a0f2e 100%)',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z' fill='%23ff8c00' opacity='0.03'/%3E%3Ccircle cx='20' cy='20' r='15' fill='%2339ff14' opacity='0.05'/%3E%3Cpath d='M80 80 Q85 70 90 80 T100 80' stroke='%23000' stroke-width='2' fill='none' opacity='0.1'/%3E%3C/svg%3E")
          `,
          opacity: 0.4,
          pointerEvents: 'none',
          animation: 'floatPattern 20s ease-in-out infinite'
        },
        '@keyframes floatPattern': {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' }
        }
      }}
    >
      <Container maxWidth={false} sx={{ py: 8, px: { xs: 2, sm: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
        {/* Success/Error Messages */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Halloween Header */}
        <Fade in timeout={1000}>
          <Box textAlign="center" mb={8} sx={{ position: 'relative' }}>
            {/* Floating Halloween Icons - BIGGER */}
            <Box sx={{ position: 'absolute', top: -30, left: '10%', fontSize: '3.5rem', animation: 'float 3s ease-in-out infinite' }}>🦇</Box>
            <Box sx={{ position: 'absolute', top: -20, right: '15%', fontSize: '3.5rem', animation: 'float 4s ease-in-out infinite 0.5s' }}>👻</Box>
            <Box sx={{ position: 'absolute', top: 15, left: '20%', fontSize: '2.5rem', animation: 'float 3.5s ease-in-out infinite 1s' }}>🕷️</Box>
            <Box sx={{ position: 'absolute', top: 10, right: '25%', fontSize: '2.5rem', animation: 'float 4.5s ease-in-out infinite 1.5s' }}>🕸️</Box>
            
            {/* Spiderweb border top */}
            <Box
              sx={{
                width: '100%',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #ff8c00, transparent)',
                mb: 3,
                boxShadow: '0 0 15px rgba(255, 140, 0, 0.6)',
                position: 'relative',
                '&::before, &::after': {
                  content: '"🕸️"',
                  position: 'absolute',
                  fontSize: '1.5rem',
                  top: '-12px'
                },
                '&::before': { left: '20px' },
                '&::after': { right: '20px' }
              }}
            />
            
            {/* Cute witch stirring cauldron - BIGGER */}
            <Box sx={{ mb: 3, fontSize: '6rem', animation: 'bounce 2s ease-in-out infinite' }}>
              🧙‍♀️
            </Box>
            
            <Typography 
              variant="h1" 
              gutterBottom 
              sx={{ 
                fontFamily: '"Creepster", cursive',
                fontWeight: 700,
                color: '#ff8c00',
                textShadow: `
                  0 0 15px rgba(255, 140, 0, 0.9),
                  0 0 30px rgba(255, 140, 0, 0.7),
                  4px 4px 0px #000,
                  -2px -2px 0px #000,
                  2px -2px 0px #000,
                  -2px 2px 0px #000
                `,
                letterSpacing: '0.08em',
                mb: 3,
                position: 'relative',
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                '&::before, &::after': {
                  content: '"🎃"',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.6em',
                  animation: 'pulse 2s ease-in-out infinite'
                },
                '&::before': { left: { xs: '-40px', md: '-80px' } },
                '&::after': { right: { xs: '-40px', md: '-80px' } }
              }}
            >
              SPIRITS & SPOOKS
            </Typography>
            
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: '"Creepster", cursive',
                color: '#b19cd9',
                fontStyle: 'italic',
                mb: 3,
                textShadow: '0 0 15px rgba(177, 156, 217, 0.7)',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem', lg: '3.2rem' }
              }}
            >
              ✨ THE HALLOWEEN HAUL ✨
            </Typography>

            <Box display="flex" justifyContent="center" gap={3} mb={4} flexWrap="wrap">
              <Chip 
                icon={<span style={{ fontSize: '1.8rem' }}>🐈‍⬛</span>}
                label="Limited Haunted Edition" 
                sx={{ 
                  background: 'linear-gradient(135deg, #2d1b4e 0%, #ff8c00 100%)',
                  color: '#fff',
                  fontFamily: '"Creepster", cursive',
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                  fontWeight: 'bold',
                  border: '3px solid #ff8c00',
                  boxShadow: '0 0 25px rgba(255, 140, 0, 0.6)',
                  animation: 'wiggle 3s ease-in-out infinite',
                  py: 2.5,
                  px: 2
                }}
              />
              <Chip 
                icon={<span style={{ fontSize: '1.8rem' }}>💀</span>}
                label="Spooktacular Deals" 
                sx={{ 
                  background: 'linear-gradient(135deg, #39ff14 0%, #2d1b4e 100%)',
                  color: '#fff',
                  fontFamily: '"Creepster", cursive',
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                  fontWeight: 'bold',
                  border: '3px solid #39ff14',
                  boxShadow: '0 0 25px rgba(57, 255, 20, 0.6)',
                  py: 2.5,
                  px: 2
                }}
              />
            </Box>

            {/* Haunted graveyard silhouette - BIGGER */}
            <Box
              sx={{
                width: '100%',
                height: '80px',
                background: 'linear-gradient(to top, #000 0%, transparent 100%)',
                position: 'relative',
                mt: 4,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                pb: 1
              }}
            >
              <span>🪦</span>
              <span>🎃</span>
              <span>🪦</span>
              <span>🌙</span>
              <span>🪦</span>
            </Box>

            {/* Spiderweb border bottom */}
            <Box
              sx={{
                width: '100%',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #ff8c00, transparent)',
                mt: 2,
                boxShadow: '0 0 15px rgba(255, 140, 0, 0.6)'
              }}
            />
          </Box>
        </Fade>

        {/* Search & Filter Section */}
        <Fade in timeout={1200}>
          <Paper 
            elevation={24}
            sx={{ 
              mb: 8, 
              p: { xs: 3, sm: 4, md: 5 },
              background: `
                linear-gradient(135deg, rgba(45, 27, 78, 0.95) 0%, rgba(26, 15, 46, 0.95) 100%),
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 140, 0, 0.02) 2px, rgba(255, 140, 0, 0.02) 4px)
              `,
              border: '3px solid #ff8c00',
              borderRadius: '12px',
              boxShadow: `
                0 0 30px rgba(255, 140, 0, 0.5),
                inset 0 0 50px rgba(0, 0, 0, 0.3)
              `,
              backdropFilter: 'blur(10px)',
              position: 'relative',
              '&::before': {
                content: '"🕸️"',
                position: 'absolute',
                top: -15,
                left: -15,
                fontSize: '2rem',
                opacity: 0.6
              },
              '&::after': {
                content: '"🕸️"',
                position: 'absolute',
                bottom: -15,
                right: -15,
                fontSize: '2rem',
                opacity: 0.6,
                transform: 'scaleX(-1)'
              }
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  placeholder="Search the collection..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Tooltip title="Search for spooky treasures!">
                          <span style={{ fontSize: '2rem' }}>🔍</span>
                        </Tooltip>
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setSearchTerm('')} size="small">
                          <CloseIcon sx={{ color: '#666' }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      fontFamily: '"Creepster", cursive',
                      color: '#fff',
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      py: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ff8c00',
                        borderWidth: '3px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ffa500',
                        boxShadow: '0 0 20px rgba(255, 140, 0, 0.7)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ffa500',
                        boxShadow: '0 0 30px rgba(255, 140, 0, 0.9)'
                      }
                    }
                  }}
                  sx={{
                    '& input': {
                      color: '#fff',
                      fontSize: { xs: '1.1rem', md: '1.3rem' }
                    },
                    '& input::placeholder': {
                      color: '#999',
                      opacity: 1,
                      fontFamily: '"Creepster", cursive',
                      fontSize: { xs: '1rem', md: '1.2rem' }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span style={{ fontSize: '1.8rem' }}>📦</span>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      fontFamily: '"Creepster", cursive',
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      py: 1,
                      '& fieldset': {
                        borderColor: '#ff8c00',
                        borderWidth: '3px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#ffa500',
                        boxShadow: '0 0 20px rgba(255, 140, 0, 0.7)'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ffa500',
                        boxShadow: '0 0 30px rgba(255, 140, 0, 0.9)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#ff8c00',
                      fontFamily: '"Creepster", cursive',
                      fontSize: { xs: '1.2rem', md: '1.4rem' }
                    },
                    '& .MuiSelect-icon': {
                      color: '#ff8c00',
                      fontSize: '2.5rem'
                    }
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          background: 'rgba(45, 27, 78, 0.98)',
                          border: '2px solid #ff8c00',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 0 30px rgba(255, 140, 0, 0.5)',
                          '& .MuiMenuItem-root': {
                            color: '#fff',
                            fontFamily: '"Creepster", cursive',
                            fontSize: { xs: '1.1rem', md: '1.3rem' },
                            py: 1.5,
                            '&:hover': {
                              background: 'rgba(255, 140, 0, 0.3)'
                            },
                            '&.Mui-selected': {
                              background: 'rgba(255, 140, 0, 0.5)',
                              '&:hover': {
                                background: 'rgba(255, 140, 0, 0.6)'
                              }
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="all">All Realms</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={1}>
                <Box textAlign="center">
                  <Typography 
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3rem' },
                      mb: 1
                    }}
                  >
                    🎃
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{
                      color: '#ff8c00',
                      fontFamily: '"Creepster", cursive',
                      fontSize: { xs: '1.5rem', md: '1.8rem' },
                      fontWeight: 'bold',
                      textShadow: '0 0 15px rgba(255, 140, 0, 0.9)'
                    }}
                  >
                    {filteredProducts.length}
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: '#b19cd9',
                      fontFamily: '"Creepster", cursive',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      display: 'block',
                      mt: 0.5
                    }}
                  >
                    Spooky Items
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Fade in timeout={1400}>
            <Box textAlign="center" py={15}>
              <Box sx={{ fontSize: { xs: '6rem', md: '8rem' }, mb: 4, animation: 'float 3s ease-in-out infinite' }}>
                👻
              </Box>
              <Typography 
                variant="h2" 
                gutterBottom
                sx={{
                  fontFamily: '"Creepster", cursive',
                  color: '#ff8c00',
                  textShadow: '0 0 20px rgba(255, 140, 0, 0.8)',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 3
                }}
              >
                Boo! Nothing Here!
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#b19cd9',
                  fontFamily: '"Creepster", cursive',
                  fontStyle: 'italic',
                  fontSize: { xs: '1.3rem', md: '1.6rem' }
                }}
              >
                The ghosts must have hidden these items... Try another search! 🕸️
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Grid container spacing={5}>
            {filteredProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} xl={3} key={product._id}>
                <Fade in timeout={500 + index * 100}>
                  <Card
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      background: `
                        linear-gradient(135deg, rgba(45, 27, 78, 0.95) 0%, rgba(26, 15, 46, 0.98) 100%),
                        repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255, 140, 0, 0.02) 10px, rgba(255, 140, 0, 0.02) 20px)
                      `,
                      border: '3px solid #ff8c00',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: `
                        0 10px 30px rgba(0, 0, 0, 0.8),
                        inset 0 0 40px rgba(255, 140, 0, 0.1),
                        0 0 0 1px rgba(255, 140, 0, 0.3)
                      `,
                      '&::before': {
                        content: '"🕸️"',
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        fontSize: '1.5rem',
                        zIndex: 1,
                        opacity: 0.6,
                        transition: 'all 0.3s'
                      },
                      '&::after': {
                        content: '"🕸️"',
                        position: 'absolute',
                        bottom: -8,
                        right: -8,
                        fontSize: '1.5rem',
                        zIndex: 1,
                        opacity: 0.6,
                        transform: 'scaleX(-1)',
                        transition: 'all 0.3s'
                      },
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03) rotate(-1deg)',
                        border: '3px solid #ffa500',
                        boxShadow: `
                          0 20px 50px rgba(255, 140, 0, 0.6),
                          0 0 60px rgba(255, 140, 0, 0.5),
                          inset 0 0 60px rgba(255, 140, 0, 0.2)
                        `,
                        '&::before, &::after': {
                          opacity: 1,
                          fontSize: '2rem',
                          filter: 'drop-shadow(0 0 10px #ff8c00)'
                        }
                      },
                    }}
                  >
                    {/* Promotion Badge - Halloween Style BIGGER */}
                    {product.pricing?.promotion && (
                      <Chip
                        icon={<span style={{ fontSize: '1.5rem' }}>🎃</span>}
                        label={`-${product.pricing.discountPercentage}%`}
                        sx={{
                          position: 'absolute',
                          top: 15,
                          right: 15,
                          zIndex: 2,
                          fontWeight: 'bold',
                          fontFamily: '"Creepster", cursive',
                          fontSize: { xs: '1.1rem', md: '1.3rem' },
                          background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                          color: '#000',
                          border: '3px solid #ffa500',
                          boxShadow: '0 0 30px rgba(255, 140, 0, 1)',
                          animation: 'pulse 2s infinite, glow 2s infinite',
                          py: 2.5,
                          px: 1
                        }}
                      />
                    )}

                    {/* Stock Badge - Halloween Style BIGGER */}
                    {product.stock < 20 && product.stock > 0 && (
                      <Chip
                        icon={<span style={{ fontSize: '1.2rem' }}>⚠️</span>}
                        label="Almost Gone!"
                        size="medium"
                        sx={{
                          position: 'absolute',
                          top: 15,
                          left: 15,
                          zIndex: 2,
                          fontFamily: '"Creepster", cursive',
                          fontSize: { xs: '0.85rem', md: '0.95rem' },
                          background: 'rgba(255, 140, 0, 0.95)',
                          color: '#000',
                          fontWeight: 'bold',
                          border: '2px solid #000',
                          animation: 'wiggle 2s infinite',
                          py: 2
                        }}
                      />
                    )}

                    {product.stock === 0 && (
                      <Chip
                        icon={<span style={{ fontSize: '1.2rem' }}>👻</span>}
                        label="Vanished!"
                        size="medium"
                        sx={{
                          position: 'absolute',
                          top: 15,
                          left: 15,
                          zIndex: 2,
                          fontFamily: '"Creepster", cursive',
                          fontSize: { xs: '0.85rem', md: '0.95rem' },
                          background: 'rgba(50, 50, 50, 0.95)',
                          color: '#fff',
                          fontWeight: 'bold',
                          border: '2px solid #666',
                          py: 2
                        }}
                      />
                    )}

                    {/* Product Image with Halloween Frame */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: { xs: 280, md: 350 },
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #000 0%, #2d1b4e 50%, #000 100%)',
                        '&::before': {
                          content: '"👻"',
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          fontSize: '2rem',
                          zIndex: 2,
                          opacity: hoveredProduct === product._id ? 1 : 0,
                          transition: 'opacity 0.3s',
                          animation: 'float 2s ease-in-out infinite',
                          textShadow: '0 0 10px #39ff14',
                          pointerEvents: 'none'
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            radial-gradient(ellipse at center, transparent 40%, rgba(255, 140, 0, 0.2)),
                            linear-gradient(to bottom, transparent 70%, rgba(255, 140, 0, 0.3))
                          `,
                          pointerEvents: 'none'
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={getImageUrl(product)}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300/2d1b4e/ff8c00?text=🎃+Spooky+Item';
                        }}
                        sx={{
                          height: { xs: 280, md: 350 },
                          objectFit: 'cover',
                          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          filter: hoveredProduct === product._id 
                            ? 'brightness(1.3) contrast(1.2) saturate(1.3) hue-rotate(10deg)' 
                            : 'brightness(0.9) contrast(1.1)',
                          transform: hoveredProduct === product._id ? 'scale(1.15) rotate(2deg)' : 'scale(1)',
                        }}
                      />
                      
                      {/* Orange/Purple glow overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '60%',
                          background: 'linear-gradient(to top, rgba(255, 140, 0, 0.5), rgba(45, 27, 78, 0.3), transparent)',
                          opacity: hoveredProduct === product._id ? 1 : 0.6,
                          transition: 'opacity 0.5s',
                          pointerEvents: 'none',
                          mixBlendMode: 'overlay'
                        }}
                      />
                    </Box>

                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        pb: 2,
                        background: 'rgba(26, 15, 46, 0.6)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '10%',
                          right: '10%',
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent, #ff8c00, transparent)',
                          boxShadow: '0 0 15px rgba(255, 140, 0, 0.8)'
                        }
                      }}
                    >
                      {/* Brand with Halloween Icon - BIGGER */}
                      {product.brand && (
                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                          <span style={{ fontSize: '1.3rem' }}>🦇</span>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#ff8c00',
                              fontWeight: 'bold',
                              fontFamily: '"Creepster", cursive',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              textShadow: '0 0 10px rgba(255, 140, 0, 0.9)',
                              fontSize: { xs: '1.2rem', md: '1.4rem', lg: '1.5rem' }
                            }}
                          >
                            {product.brand}
                          </Typography>
                        </Box>
                      )}

                      {/* Product Name - BIGGER */}
                      <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 700,
                          fontFamily: '"Creepster", cursive',
                          color: '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '3.5em',
                          textShadow: '0 0 15px rgba(255, 140, 0, 0.7), 3px 3px 6px rgba(0, 0, 0, 0.9)',
                          lineHeight: 1.3,
                          fontSize: { xs: '1.4rem', md: '1.7rem', lg: '1.9rem' }
                        }}
                      >
                        {product.name}
                      </Typography>

                      {/* Rating with Stars */}
                      <Box display="flex" alignItems="center" mb={2.5}>
                        <Rating 
                          value={product.ratings || 0} 
                          precision={0.5} 
                          size="large" 
                          readOnly 
                          sx={{
                            fontSize: { xs: '1.6rem', md: '1.8rem', lg: '2rem' },
                            '& .MuiRating-iconFilled': {
                              color: '#ff8c00',
                              filter: 'drop-shadow(0 0 10px #ff8c00)'
                            },
                            '& .MuiRating-iconEmpty': {
                              color: '#444'
                            }
                          }}
                        />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#b19cd9', 
                            ml: 2,
                            fontFamily: '"Creepster", cursive',
                            fontSize: { xs: '1.1rem', md: '1.2rem', lg: '1.3rem' },
                            fontWeight: 600
                          }}
                        >
                          ({product.ratings || 0})
                        </Typography>
                      </Box>

                      {/* Category with Icon */}
                      <Chip 
                        icon={<span style={{ fontSize: '1.5rem' }}>🏷️</span>}
                        label={product.category} 
                        size="medium" 
                        sx={{ 
                          mb: 2.5,
                          background: 'rgba(255, 140, 0, 0.25)',
                          color: '#ff8c00',
                          border: '2px solid #ff8c00',
                          fontFamily: '"Creepster", cursive',
                          fontSize: { xs: '1rem', md: '1.1rem', lg: '1.2rem' },
                          fontWeight: 'bold',
                          py: 2.5,
                          px: 1
                        }}
                      />

                      {/* Description */}
                      <Typography 
                        variant="h6" 
                        sx={{
                          color: '#b19cd9',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '3.5em',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontStyle: 'italic',
                          fontSize: { xs: '1.05rem', md: '1.15rem', lg: '1.25rem' },
                          lineHeight: 1.5,
                          opacity: 0.9,
                          fontWeight: 400
                        }}
                      >
                        {product.description || '🎃 A mysterious item from the haunted collection, perfect for spooky season...'}
                      </Typography>

                      {/* Price Section - Halloween Style EXTRA LARGE */}
                      <Box mt={3}>
                        {product.pricing?.promotion ? (
                          <Box>
                            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                              <span style={{ fontSize: '1.5rem' }}>💀</span>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  textDecoration: 'line-through', 
                                  color: '#888',
                                  fontFamily: '"Creepster", cursive',
                                  fontSize: { xs: '1.2rem', md: '1.4rem', lg: '1.5rem' },
                                  fontWeight: 600
                                }}
                              >
                                ${product.pricing.originalPrice.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                              <span style={{ fontSize: '2.5rem' }}>🎃</span>
                              <Typography 
                                variant="h3" 
                                sx={{ 
                                  color: '#ff8c00',
                                  fontWeight: 900,
                                  fontFamily: '"Creepster", cursive',
                                  textShadow: '0 0 25px rgba(255, 140, 0, 1), 0 0 40px rgba(255, 140, 0, 0.5)',
                                  fontSize: { xs: '2rem', md: '2.4rem', lg: '2.8rem' },
                                  letterSpacing: '0.02em'
                                }}
                              >
                                ${product.pricing.discountedPrice.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <span style={{ fontSize: '1.5rem' }}>✨</span>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  color: '#39ff14',
                                  fontWeight: 'bold',
                                  fontFamily: '"Creepster", cursive',
                                  textShadow: '0 0 15px rgba(57, 255, 20, 0.9), 0 0 25px rgba(57, 255, 20, 0.5)',
                                  fontSize: { xs: '1.2rem', md: '1.4rem', lg: '1.6rem' }
                                }}
                              >
                                Save ${product.pricing.saveAmount.toFixed(2)}!
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <span style={{ fontSize: '2.5rem' }}>💰</span>
                            <Typography 
                              variant="h3" 
                              sx={{ 
                                color: '#fff',
                                fontWeight: 900,
                                fontFamily: '"Creepster", cursive',
                                textShadow: '0 0 20px rgba(255, 140, 0, 0.8)',
                                fontSize: { xs: '1.8rem', md: '2.2rem', lg: '2.5rem' },
                                letterSpacing: '0.02em'
                              }}
                            >
                              ${product.price.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                        
                        {product.stock > 0 && (
                          <Box 
                            display="flex" 
                            alignItems="center" 
                            gap={1.5} 
                            mt={2}
                            sx={{
                              background: product.stock < 20 
                                ? 'linear-gradient(135deg, rgba(255, 140, 0, 0.2) 0%, rgba(255, 69, 0, 0.2) 100%)'
                                : 'linear-gradient(135deg, rgba(57, 255, 20, 0.15) 0%, rgba(0, 255, 0, 0.15) 100%)',
                              border: product.stock < 20 
                                ? '2px solid #ff8c00' 
                                : '2px solid #39ff14',
                              borderRadius: '10px',
                              p: 1.5,
                              boxShadow: product.stock < 20
                                ? '0 0 15px rgba(255, 140, 0, 0.4)'
                                : '0 0 15px rgba(57, 255, 20, 0.3)'
                            }}
                          >
                            <span style={{ fontSize: '1.8rem' }}>📦</span>
                            <Box>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: product.stock < 20 ? '#ff8c00' : '#39ff14',
                                  display: 'block',
                                  fontFamily: '"Creepster", cursive',
                                  fontSize: { xs: '1.3rem', md: '1.4rem', lg: '1.5rem' },
                                  fontWeight: 700,
                                  lineHeight: 1.2
                                }}
                              >
                                {product.stock} {product.stock === 1 ? 'item' : 'items'}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#aaa',
                                  display: 'block',
                                  fontFamily: '"Creepster", cursive',
                                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                                  fontWeight: 400
                                }}
                              >
                                {product.stock < 20 ? '⚠️ Limited stock!' : 'In the haunted vault'}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </CardContent>

                    {/* Action Buttons - Halloween Style BIGGER */}
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Grid container spacing={1.5}>
                        {/* Add to Cart Button */}
                        <Grid item xs={12} sm={6}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={addingToCart[product._id] ? null : <ShoppingCartIcon sx={{ fontSize: '1.3rem' }} />}
                            onClick={(e) => handleAddToCart(product._id, e)}
                            disabled={product.stock === 0 || addingToCart[product._id]}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontFamily: '"Creepster", cursive',
                              fontSize: { xs: '0.95rem', md: '1.1rem' },
                              py: 1.5,
                              background: product.stock === 0 
                                ? 'linear-gradient(135deg, #666 0%, #444 100%)'
                                : 'linear-gradient(135deg, #39ff14 0%, #00ff00 100%)',
                              border: product.stock === 0 ? '2px solid #444' : '2px solid #39ff14',
                              color: '#000',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.3s',
                              boxShadow: product.stock === 0 
                                ? '0 3px 10px rgba(0, 0, 0, 0.3)'
                                : '0 3px 15px rgba(57, 255, 20, 0.5)',
                              '&:hover': product.stock > 0 ? {
                                transform: 'translateY(-2px) scale(1.02)',
                                boxShadow: '0 8px 25px rgba(57, 255, 20, 0.7)',
                                border: '2px solid #fff',
                              } : {},
                              '&:disabled': {
                                color: '#999',
                                background: 'linear-gradient(135deg, #444 0%, #222 100%)',
                              }
                            }}
                          >
                            {addingToCart[product._id] ? (
                              <>
                                <CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} />
                                Adding...
                              </>
                            ) : product.stock > 0 ? (
                              '🛒 Add to Cart'
                            ) : (
                              '❌ Out of Stock'
                            )}
                          </Button>
                        </Grid>

                        {/* View Details Button */}
                        <Grid item xs={12} sm={6}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<span style={{ fontSize: '1.3rem' }}>👁️</span>}
                            onClick={() => handleViewDetails(product._id)}
                            sx={{
                              borderRadius: '10px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontFamily: '"Creepster", cursive',
                              fontSize: { xs: '0.95rem', md: '1.1rem' },
                              py: 1.5,
                              background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                              border: '2px solid #ffa500',
                              color: '#000',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.3s',
                              boxShadow: '0 3px 15px rgba(255, 140, 0, 0.5)',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                                transition: 'left 0.5s'
                              },
                              '&:hover': {
                                transform: 'translateY(-2px) scale(1.02)',
                                boxShadow: '0 8px 25px rgba(255, 140, 0, 0.7)',
                                border: '2px solid #fff',
                                background: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)',
                                '&::before': {
                                  left: '100%'
                                }
                              }
                            }}
                          >
                            👁️ View
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Add Halloween Google Fonts & Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Butcherman&family=Nosifer&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 5px #ff8c00); }
          50% { filter: drop-shadow(0 0 20px #ff8c00); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Parchment texture effect */
        .parchment-bg {
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 140, 0, 0.02) 2px, rgba(255, 140, 0, 0.02) 4px);
        }
      `}</style>
    </Box>
  );
};

export default ProductCatalogGothic;
