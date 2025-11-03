import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Fade,
  Zoom,
  Paper,
} from '@mui/material';
import {
  ShoppingCart,
  LocalOffer,
  Inventory,
  ArrowBack,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import api from '../utils/api';

// Halloween theme styles - Haunted Mansion Edition
const halloweenStyles = {
  pageBackground: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0015 0%, #1a0f2e 50%, #2d1b4e 100%)',
    paddingTop: '2rem',
    paddingBottom: '4rem',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse at center, transparent 0%, rgba(255, 140, 0, 0.03) 50%, transparent 100%)',
      animation: 'pulse 4s ease-in-out infinite',
      pointerEvents: 'none',
      '@keyframes pulse': {
        '0%, 100%': { opacity: 0.3 },
        '50%': { opacity: 0.6 },
      },
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '200px',
      background: 'linear-gradient(0deg, rgba(57, 255, 20, 0.05) 0%, transparent 100%)',
      pointerEvents: 'none',
    },
  },
  featuredTitle: {
    fontFamily: '"Creepster", cursive',
    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
    color: '#ff8c00',
    textAlign: 'center',
    textShadow: '0 0 20px rgba(255, 140, 0, 0.8), 0 0 40px rgba(255, 140, 0, 0.5), 0 0 80px rgba(255, 140, 0, 0.3)',
    marginBottom: '1rem',
    animation: 'spookyGlow 3s ease-in-out infinite',
    position: 'relative',
    '&::before': {
      content: '"👻"',
      position: 'absolute',
      left: { xs: '5%', md: '10%' },
      animation: 'float 3s ease-in-out infinite',
    },
    '&::after': {
      content: '"🎃"',
      position: 'absolute',
      right: { xs: '5%', md: '10%' },
      animation: 'float 3s ease-in-out infinite 1.5s',
    },
    '@keyframes spookyGlow': {
      '0%, 100%': { 
        textShadow: '0 0 20px rgba(255, 140, 0, 0.8), 0 0 40px rgba(255, 140, 0, 0.5), 0 0 80px rgba(255, 140, 0, 0.3)',
        transform: 'scale(1)',
      },
      '50%': { 
        textShadow: '0 0 30px rgba(255, 140, 0, 1), 0 0 60px rgba(255, 140, 0, 0.7), 0 0 100px rgba(255, 140, 0, 0.5)',
        transform: 'scale(1.05)',
      },
    },
  },
  parchmentPaper: {
    background: 'linear-gradient(135deg, rgba(26, 15, 46, 0.95) 0%, rgba(45, 27, 78, 0.98) 100%)',
    border: '4px solid',
    borderImage: 'linear-gradient(45deg, #ff8c00, #39ff14, #ff8c00) 1',
    borderRadius: '20px',
    padding: { xs: '2.5rem', md: '3.5rem' },
    boxShadow: '0 12px 48px rgba(255, 140, 0, 0.4), inset 0 0 50px rgba(255, 140, 0, 0.1)',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    '&::before': {
      content: '"🕸️"',
      position: 'absolute',
      top: '-15px',
      left: '-15px',
      fontSize: '2.5rem',
      animation: 'wiggle 2s ease-in-out infinite',
    },
    '&::after': {
      content: '"🕸️"',
      position: 'absolute',
      top: '-15px',
      right: '-15px',
      fontSize: '2.5rem',
      animation: 'wiggle 2s ease-in-out infinite 1s',
    },
    '@keyframes wiggle': {
      '0%, 100%': { transform: 'rotate(-5deg)' },
      '50%': { transform: 'rotate(5deg)' },
    },
  },
  imageCard: {
    background: 'radial-gradient(circle at center, rgba(45, 27, 78, 0.9) 0%, rgba(26, 15, 46, 0.95) 100%)',
    border: '5px solid',
    borderImage: 'linear-gradient(135deg, #ff8c00 0%, #39ff14 50%, #ff8c00 100%) 1',
    borderRadius: '30px',
    padding: '2rem',
    boxShadow: '0 20px 60px rgba(255, 140, 0, 0.5), 0 0 100px rgba(57, 255, 20, 0.2), inset 0 0 30px rgba(255, 140, 0, 0.15)',
    position: 'relative',
    overflow: 'visible',
    animation: 'cardPulse 4s ease-in-out infinite',
    '&::before': {
      content: '"🦇"',
      position: 'absolute',
      top: '-25px',
      left: { xs: '10px', md: '30px' },
      fontSize: { xs: '2.5rem', md: '3rem' },
      animation: 'batFly 3s ease-in-out infinite',
    },
    '&::after': {
      content: '"🦇"',
      position: 'absolute',
      top: '-25px',
      right: { xs: '10px', md: '30px' },
      fontSize: { xs: '2.5rem', md: '3rem' },
      animation: 'batFly 3s ease-in-out infinite 1.5s',
    },
    '@keyframes batFly': {
      '0%, 100%': { transform: 'rotate(-10deg) translateY(0px)' },
      '50%': { transform: 'rotate(10deg) translateY(-15px)' },
    },
    '@keyframes cardPulse': {
      '0%, 100%': { 
        boxShadow: '0 20px 60px rgba(255, 140, 0, 0.5), 0 0 100px rgba(57, 255, 20, 0.2), inset 0 0 30px rgba(255, 140, 0, 0.15)',
      },
      '50%': { 
        boxShadow: '0 25px 70px rgba(255, 140, 0, 0.7), 0 0 120px rgba(57, 255, 20, 0.3), inset 0 0 40px rgba(255, 140, 0, 0.25)',
      },
    },
  },
  backButton: {
    fontFamily: '"Creepster", cursive',
    fontSize: '1.3rem',
    background: 'linear-gradient(45deg, #ff8c00 30%, #ffa500 90%)',
    color: '#1a0f2e',
    padding: '12px 32px',
    borderRadius: '12px',
    border: '2px solid #39ff14',
    boxShadow: '0 4px 20px rgba(255, 140, 0, 0.5)',
    '&:hover': {
      background: 'linear-gradient(45deg, #ffa500 30%, #ff8c00 90%)',
      transform: 'translateY(-3px) scale(1.05)',
      boxShadow: '0 8px 30px rgba(255, 140, 0, 0.7)',
    },
    transition: 'all 0.3s ease',
  },
  priceCard: {
    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 50%, #ff6600 100%)',
    border: '4px solid #39ff14',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 15px 50px rgba(255, 140, 0, 0.6), 0 0 80px rgba(57, 255, 20, 0.4)',
    color: '#1a0f2e',
    position: 'relative',
    overflow: 'hidden',
    animation: 'priceShine 3s ease-in-out infinite',
    '&::before': {
      content: '"💰"',
      position: 'absolute',
      top: '10px',
      right: '10px',
      fontSize: '2.5rem',
      animation: 'coinSpin 4s linear infinite',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
      animation: 'shine 3s ease-in-out infinite',
    },
    '@keyframes priceShine': {
      '0%, 100%': { 
        boxShadow: '0 15px 50px rgba(255, 140, 0, 0.6), 0 0 80px rgba(57, 255, 20, 0.4)',
      },
      '50%': { 
        boxShadow: '0 20px 60px rgba(255, 140, 0, 0.8), 0 0 100px rgba(57, 255, 20, 0.6)',
      },
    },
    '@keyframes coinSpin': {
      '0%': { transform: 'rotateY(0deg)' },
      '100%': { transform: 'rotateY(360deg)' },
    },
    '@keyframes shine': {
      '0%': { left: '-100%' },
      '50%, 100%': { left: '100%' },
    },
  },
  addToCartButton: {
    fontFamily: '"Creepster", cursive',
    fontSize: { xs: '1.3rem', md: '1.5rem' },
    background: 'linear-gradient(45deg, #39ff14 30%, #00ff00 90%)',
    color: '#1a0f2e',
    padding: { xs: '14px', md: '18px' },
    borderRadius: '12px',
    border: '3px solid #ff8c00',
    boxShadow: '0 6px 25px rgba(57, 255, 20, 0.5)',
    '&:hover:not(:disabled)': {
      background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
      transform: 'translateY(-3px) scale(1.05)',
      boxShadow: '0 10px 35px rgba(57, 255, 20, 0.7)',
    },
    '&:disabled': {
      background: '#666',
      border: '3px solid #444',
      color: '#999',
    },
    transition: 'all 0.3s ease',
  },
  infoCard: {
    background: 'linear-gradient(135deg, rgba(45, 27, 78, 0.85) 0%, rgba(26, 15, 46, 0.9) 50%, rgba(45, 27, 78, 0.85) 100%)',
    border: '4px solid',
    borderImage: 'linear-gradient(135deg, #ff8c00, #39ff14) 1',
    borderRadius: '20px',
    padding: { xs: '2rem', md: '2.5rem' },
    textAlign: 'center',
    color: '#b19cd9',
    boxShadow: '0 10px 40px rgba(255, 140, 0, 0.4), inset 0 0 20px rgba(255, 140, 0, 0.1)',
    transition: 'all 0.4s ease',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(255, 140, 0, 0.1) 0%, transparent 70%)',
      animation: 'rotate 8s linear infinite',
    },
    '&:hover': {
      transform: 'translateY(-12px) scale(1.05) rotate(2deg)',
      boxShadow: '0 20px 60px rgba(255, 140, 0, 0.7), 0 0 100px rgba(57, 255, 20, 0.5), inset 0 0 30px rgba(255, 140, 0, 0.2)',
      borderImage: 'linear-gradient(135deg, #39ff14, #ff8c00) 1',
    },
    '@keyframes rotate': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
  promotionAlert: {
    background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%)',
    border: '2px solid #ff8c00',
    borderRadius: '12px',
    color: '#b19cd9',
    '& .MuiAlert-icon': {
      color: '#ff8c00',
    },
  },
  sectionTitle: {
    fontFamily: '"Creepster", cursive',
    fontSize: { xs: '1.8rem', md: '2.2rem' },
    color: '#ff8c00',
    textShadow: '0 0 15px rgba(255, 140, 0, 0.6)',
    marginBottom: '1rem',
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activePromotions, setActivePromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductDetail();
    fetchActivePromotions();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load product details');
      setLoading(false);
    }
  };

  const fetchActivePromotions = async () => {
    try {
      const response = await api.get('/promotions/active/list');
      setActivePromotions(response.data.data || []);
    } catch (err) {
      console.error('Failed to load promotions:', err);
    }
  };

  const getProductPromotion = () => {
    if (!product || !activePromotions.length) return null;
    
    return activePromotions.find(promo =>
      promo.applicableProducts?.some(p => p._id === product._id)
    );
  };

  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    const promotion = getProductPromotion();
    if (!promotion) return product.price;
    
    const discount = (product.price * promotion.discountPercentage) / 100;
    return product.price - discount;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Click effect handler
  const handleClick = (e) => {
    const effects = ['🎃', '👻', '🦇', '🕷️', '✨'];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    
    const span = document.createElement('span');
    span.textContent = effect;
    span.style.position = 'fixed';
    span.style.left = e.clientX + 'px';
    span.style.top = e.clientY + 'px';
    span.style.fontSize = '2rem';
    span.style.pointerEvents = 'none';
    span.style.zIndex = 9999;
    span.style.animation = 'click-effect 1s ease-out forwards';
    
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1000);
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    
    // Add click animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes click-effect {
        0% {
          transform: translate(-50%, -50%) scale(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -150%) scale(1.5) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={halloweenStyles.pageBackground}
      >
        <Typography sx={halloweenStyles.featuredTitle} gutterBottom>
          🎃 Loading... 👻
        </Typography>
        <CircularProgress size={80} sx={{ color: '#ff8c00' }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={halloweenStyles.pageBackground} minHeight="80vh">
        <Container maxWidth={false} sx={{ mt: 4 }}>
          <Alert 
            severity="error" 
            sx={{
              ...halloweenStyles.promotionAlert,
              fontSize: '1.2rem',
            }}
          >
            {error || 'Product not found'}
          </Alert>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/catalog')} 
            sx={{ ...halloweenStyles.backButton, mt: 2 }}
          >
            Back to Catalog
          </Button>
        </Container>
      </Box>
    );
  }

  const promotion = getProductPromotion();
  const discountedPrice = calculateDiscountedPrice();
  const savings = product.price - discountedPrice;

  return (
    <Box sx={halloweenStyles.pageBackground}>
      {/* Add Google Font for Creepster */}
      <link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet" />
      
      <Fade in timeout={800}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 4 }}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/catalog')}
            sx={halloweenStyles.backButton}
          >
            🎃 Back to Catalog
          </Button>

          {/* Featured Title */}
          <Typography sx={{ ...halloweenStyles.featuredTitle, mt: 4, mb: 2 }}>
            👻 Featured Fright: 🦇
          </Typography>

          {/* Product Name Subtitle with Spooky Effect */}
          <Typography
            sx={{
              fontFamily: '"Creepster", cursive',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              color: '#39ff14',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(57, 255, 20, 0.8), 0 0 40px rgba(57, 255, 20, 0.5), 0 0 60px rgba(57, 255, 20, 0.3)',
              marginBottom: '3rem',
              animation: 'ghostlyText 4s ease-in-out infinite',
              position: 'relative',
              '@keyframes ghostlyText': {
                '0%, 100%': { 
                  opacity: 0.9,
                  textShadow: '0 0 20px rgba(57, 255, 20, 0.8), 0 0 40px rgba(57, 255, 20, 0.5)',
                },
                '50%': { 
                  opacity: 1,
                  textShadow: '0 0 30px rgba(57, 255, 20, 1), 0 0 60px rgba(57, 255, 20, 0.7), 0 0 80px rgba(57, 255, 20, 0.5)',
                },
              },
            }}
          >
            ✨ {product.name} ✨
          </Typography>

          <Grid container spacing={{ xs: 3, md: 5 }}>
            {/* Product Image - Decorative Wreath Frame */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={600}>
                <Box sx={halloweenStyles.imageCard}>
                  {/* Decorative Corner Elements with Animation */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      zIndex: 2,
                      animation: 'spiderCrawl 4s ease-in-out infinite',
                      '@keyframes spiderCrawl': {
                        '0%, 100%': { transform: 'translateX(-50%) scale(1)' },
                        '50%': { transform: 'translateX(-50%) scale(1.2)' },
                      },
                    }}
                  >
                    🕷️🕸️🕷️
                  </Box>
                  
                  {promotion && (
                    <Chip
                      label={`-${promotion.discountPercentage}% OFF!`}
                      sx={{
                        position: 'absolute',
                        top: 30,
                        right: 30,
                        fontSize: { xs: '1.3rem', md: '1.5rem' },
                        fontFamily: '"Creepster", cursive',
                        fontWeight: 'bold',
                        padding: '24px 16px',
                        zIndex: 3,
                        background: 'linear-gradient(45deg, #ff6600 30%, #ff8c00 90%)',
                        color: '#1a0f2e',
                        border: '3px solid #39ff14',
                        boxShadow: '0 4px 20px rgba(255, 140, 0, 0.6)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { transform: 'scale(1) rotate(-5deg)' },
                          '50%': { transform: 'scale(1.1) rotate(5deg)' },
                        },
                      }}
                    />
                  )}
                  
                  <CardMedia
                    component="img"
                    image={product.imageUrl || product.image || 'https://via.placeholder.com/600x600?text=No+Image'}
                    alt={product.name}
                    onError={(e) => {
                      console.error('Image failed to load:', product.imageUrl);
                      e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                    }}
                    sx={{
                      width: '100%',
                      height: { xs: '400px', md: '600px' },
                      objectFit: 'cover',
                      borderRadius: '16px',
                      border: '4px solid #8b4513',
                      boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  
                  {/* Decorative Bottom Elements with Bounce */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      zIndex: 2,
                      animation: 'pumpkinBounce 2s ease-in-out infinite',
                      '@keyframes pumpkinBounce': {
                        '0%, 100%': { transform: 'translateX(-50%) translateY(0px)' },
                        '50%': { transform: 'translateX(-50%) translateY(-10px)' },
                      },
                    }}
                  >
                    🎃👻🎃
                  </Box>
                </Box>
              </Zoom>
            </Grid>

            {/* Product Info - Aged Parchment */}
            <Grid item xs={12} md={6}>
              <Paper elevation={12} sx={halloweenStyles.parchmentPaper}>
                {/* Category Badge with Glow */}
                <Chip
                  icon={<LocalOffer sx={{ color: '#ff8c00', fontSize: '1.8rem' }} />}
                  label={`🏷️ ${product.category}`}
                  sx={{
                    mb: 3,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontFamily: '"Creepster", cursive',
                    background: 'linear-gradient(45deg, rgba(255, 140, 0, 0.2) 30%, rgba(57, 255, 20, 0.2) 90%)',
                    color: '#ff8c00',
                    border: '3px solid #ff8c00',
                    padding: '26px 18px',
                    boxShadow: '0 4px 20px rgba(255, 140, 0, 0.5)',
                    animation: 'badgePulse 2s ease-in-out infinite',
                    '& .MuiChip-icon': {
                      fontSize: '1.8rem',
                    },
                    '@keyframes badgePulse': {
                      '0%, 100%': { 
                        boxShadow: '0 4px 20px rgba(255, 140, 0, 0.5)',
                      },
                      '50%': { 
                        boxShadow: '0 6px 30px rgba(255, 140, 0, 0.8)',
                      },
                    },
                  }}
                />

                {/* Product Name - Glowing Style */}
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontFamily: '"Creepster", cursive',
                    fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.8rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #ff8c00 30%, #39ff14 50%, #ff8c00 70%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradientShift 3s ease infinite',
                    textShadow: 'none',
                    mb: 3,
                    position: 'relative',
                    filter: 'drop-shadow(0 0 10px rgba(255, 140, 0, 0.8))',
                    '@keyframes gradientShift': {
                      '0%, 100%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                    },
                  }}
                >
                  {product.name}
                </Typography>

                {/* Rating - Large and Clear */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Rating 
                    value={product.rating || 4.5} 
                    precision={0.5} 
                    readOnly 
                    sx={{
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      '& .MuiRating-iconFilled': {
                        color: '#ff8c00',
                      },
                      '& .MuiRating-iconEmpty': {
                        color: 'rgba(139, 69, 19, 0.3)',
                      },
                    }}
                  />
                  <Typography 
                    variant="h6" 
                    sx={{
                      color: '#8b4513',
                      fontSize: { xs: '1.2rem', md: '1.4rem' },
                      fontWeight: 'bold',
                    }}
                  >
                    ({product.reviews || 0} reviews)
                  </Typography>
                </Stack>

                {/* Price Section - Halloween Style */}
                <Card elevation={8} sx={halloweenStyles.priceCard}>
                  {product.pricing?.promotion ? (
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <LocalOffer sx={{ fontSize: '2rem' }} />
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontFamily: '"Creepster", cursive',
                            fontSize: { xs: '1.5rem', md: '1.8rem' },
                          }}
                        >
                          🎃 Special Promotion Active! 🎃
                        </Typography>
                      </Stack>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          mb: 2,
                          fontSize: { xs: '1.2rem', md: '1.4rem' },
                        }}
                      >
                        {product.pricing.promotion.name}
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{
                          fontFamily: '"Creepster", cursive',
                          fontWeight: 'bold',
                          fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                          mb: 2,
                          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        ${product.pricing.discountedPrice.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          textDecoration: 'line-through',
                          opacity: 0.7,
                          mb: 2,
                          fontSize: { xs: '1.5rem', md: '1.8rem' },
                        }}
                      >
                        ${product.pricing.originalPrice.toFixed(2)}
                      </Typography>
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: '1.5rem' }} />}
                        label={`💰 Save $${product.pricing.saveAmount.toFixed(2)} (-${product.pricing.discountPercentage}%)`}
                        sx={{
                          background: 'rgba(57, 255, 20, 0.3)',
                          border: '2px solid #39ff14',
                          color: '#1a0f2e',
                          fontWeight: 'bold',
                          fontSize: { xs: '1.1rem', md: '1.3rem' },
                          padding: '24px 16px',
                          mb: 2,
                          '& .MuiChip-icon': {
                            color: '#1a0f2e',
                          },
                        }}
                      />
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '1rem', md: '1.2rem' },
                        }}
                      >
                        ⏰ Ends: {formatDateTime(product.pricing.promotion.endDate)}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontFamily: '"Creepster", cursive',
                          fontWeight: 'bold',
                          fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                          textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          mt: 1,
                          fontSize: { xs: '1.2rem', md: '1.4rem' },
                        }}
                      >
                        Regular Price
                      </Typography>
                    </Box>
                  )}
                </Card>

                {/* Promotion Details */}
                {promotion && (
                  <Alert
                    severity="info"
                    icon={<Schedule sx={{ fontSize: '2rem', color: '#ff8c00' }} />}
                    sx={{
                      ...halloweenStyles.promotionAlert,
                      mb: 3,
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      '& .MuiAlert-message': { width: '100%' },
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{
                        fontFamily: '"Creepster", cursive',
                        fontSize: { xs: '1.4rem', md: '1.6rem' },
                        color: '#ff8c00',
                      }}
                    >
                      👻 {promotion.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      gutterBottom
                      sx={{
                        fontSize: { xs: '1.1rem', md: '1.3rem' },
                        color: '#b19cd9',
                      }}
                    >
                      {promotion.description}
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 140, 0, 0.3)' }} />
                    <Stack spacing={1}>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#b19cd9' }}
                      >
                        <strong>🎃 Start:</strong> {formatDateTime(promotion.startDate)}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#b19cd9' }}
                      >
                        <strong>⚰️ End:</strong> {formatDateTime(promotion.endDate)}
                      </Typography>
                    </Stack>
                  </Alert>
                )}

                {/* Stock Info - Clear Display */}
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  spacing={2} 
                  sx={{ 
                    mb: 4,
                    p: 2,
                    background: product.stock > 0 
                      ? 'linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(0, 255, 0, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 0, 0, 0.2) 0%, rgba(139, 0, 0, 0.2) 100%)',
                    border: product.stock > 0 ? '2px solid #39ff14' : '2px solid #ff0000',
                    borderRadius: '12px',
                  }}
                >
                  <Inventory 
                    sx={{ 
                      fontSize: '2.5rem',
                      color: product.stock > 0 ? '#39ff14' : '#ff0000' 
                    }} 
                  />
                  <Typography 
                    variant="h5"
                    sx={{
                      fontFamily: '"Creepster", cursive',
                      fontSize: { xs: '1.4rem', md: '1.8rem' },
                      fontWeight: 'bold',
                      color: product.stock > 0 ? '#39ff14' : '#ff0000',
                      textShadow: product.stock > 0 
                        ? '0 0 10px rgba(57, 255, 20, 0.6)'
                        : '0 0 10px rgba(255, 0, 0, 0.6)',
                    }}
                  >
                    {product.stock > 0 ? (
                      `✅ In Stock (${product.stock} available)`
                    ) : (
                      '❌ Out of Stock'
                    )}
                  </Typography>
                </Stack>

                {/* Description */}
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={halloweenStyles.sectionTitle}
                  >
                    📜 Product Description
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      color: '#8b4513',
                      lineHeight: 1.8,
                      textAlign: 'justify',
                    }}
                    paragraph
                  >
                    {product.description || 'No description available for this mysterious item...'}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart sx={{ fontSize: '2rem' }} />}
                    disabled={product.stock === 0}
                    fullWidth
                    sx={halloweenStyles.addToCartButton}
                  >
                    {product.stock > 0 ? '🛒 Add to Cart' : '❌ Out of Stock'}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Halloween-Themed Product Details Grid */}
          <Typography 
            sx={{ 
              ...halloweenStyles.featuredTitle, 
              fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
              mt: 6, 
              mb: 4 
            }}
          >
            🕷️ Product Details 🕷️
          </Typography>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={4}>
              <Card elevation={8} sx={halloweenStyles.infoCard}>
                <LocalOffer sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2, color: '#ff8c00' }} />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontFamily: '"Creepster", cursive',
                    fontSize: { xs: '1.4rem', md: '1.6rem' },
                    color: '#ff8c00',
                  }}
                >
                  Category
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{
                    fontFamily: '"Creepster", cursive',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    color: '#b19cd9',
                  }}
                >
                  {product.category}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={8} sx={halloweenStyles.infoCard}>
                <Inventory sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2, color: '#ff8c00' }} />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontFamily: '"Creepster", cursive',
                    fontSize: { xs: '1.4rem', md: '1.6rem' },
                    color: '#ff8c00',
                  }}
                >
                  Available Stock
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{
                    fontFamily: '"Creepster", cursive',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    color: product.stock > 0 ? '#39ff14' : '#ff0000',
                  }}
                >
                  {product.stock} units
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={8} sx={halloweenStyles.infoCard}>
                <Rating 
                  value={product.rating || 4.5} 
                  readOnly 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3rem' }, 
                    mb: 2,
                    '& .MuiRating-iconFilled': {
                      color: '#ff8c00',
                    },
                  }} 
                />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontFamily: '"Creepster", cursive',
                    fontSize: { xs: '1.4rem', md: '1.6rem' },
                    color: '#ff8c00',
                  }}
                >
                  Customer Rating
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{
                    fontFamily: '"Creepster", cursive',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    color: '#b19cd9',
                  }}
                >
                  {product.rating || 4.5}/5.0 ⭐
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Decorative Bottom Section with Moving Elements */}
          <Box
            sx={{
              mt: 8,
              mb: 4,
              textAlign: 'center',
              position: 'relative',
              height: { xs: '60px', md: '80px' },
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                display: 'inline-flex',
                gap: { xs: 2, md: 4 },
                animation: 'floatEmoji 20s linear infinite',
                '@keyframes floatEmoji': {
                  '0%': { transform: 'translateX(100%)' },
                  '100%': { transform: 'translateX(-100%)' },
                },
              }}
            >
              <span style={{ animation: 'bounce1 2s ease-in-out infinite' }}>🎃</span>
              <span style={{ animation: 'bounce2 2s ease-in-out infinite 0.2s' }}>👻</span>
              <span style={{ animation: 'bounce1 2s ease-in-out infinite 0.4s' }}>🦇</span>
              <span style={{ animation: 'bounce2 2s ease-in-out infinite 0.6s' }}>🕷️</span>
              <span style={{ animation: 'bounce1 2s ease-in-out infinite 0.8s' }}>🌙</span>
              <span style={{ animation: 'bounce2 2s ease-in-out infinite 1s' }}>🕸️</span>
              <span style={{ animation: 'bounce1 2s ease-in-out infinite 1.2s' }}>💀</span>
              <span style={{ animation: 'bounce2 2s ease-in-out infinite 1.4s' }}>⚰️</span>
              <span style={{ animation: 'bounce1 2s ease-in-out infinite 1.6s' }}>🎃</span>
            </Box>
            <style>{`
              @keyframes bounce1 {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
              }
              @keyframes bounce2 {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
            `}</style>
          </Box>
        </Container>
      </Fade>
    </Box>
  );
};

export default ProductDetail;
