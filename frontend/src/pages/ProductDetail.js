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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Container>
    );
  }

  const promotion = getProductPromotion();
  const discountedPrice = calculateDiscountedPrice();
  const savings = product.price - discountedPrice;

  return (
    <Fade in timeout={800}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{
            mb: 3,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Back to Products
        </Button>

        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <Zoom in timeout={600}>
              <Card
                elevation={8}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.3s ease',
                  },
                }}
              >
                {promotion && (
                  <Chip
                    label={`-${promotion.discountPercentage}%`}
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      padding: '20px 10px',
                      zIndex: 1,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                      },
                    }}
                  />
                )}
                <CardMedia
                  component="img"
                  height="500"
                  image={product.image || 'https://via.placeholder.com/500x500?text=No+Image'}
                  alt={product.name}
                  sx={{
                    objectFit: 'cover',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
              </Card>
            </Zoom>
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <Box>
              {/* Category Badge */}
              <Chip
                icon={<LocalOffer />}
                label={product.category}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />

              {/* Product Name */}
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                {product.name}
              </Typography>

              {/* Rating */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Rating value={product.rating || 4.5} precision={0.5} readOnly size="large" />
                <Typography variant="body1" color="text.secondary">
                  ({product.reviews || 0} reviews)
                </Typography>
              </Stack>

              {/* ⭐ Price Section - Sử dụng pricing từ API */}
              <Card
                elevation={4}
                sx={{
                  p: 3,
                  mb: 3,
                  background: product.pricing?.promotion
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: 3,
                  color: 'white',
                }}
              >
                {product.pricing?.promotion ? (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <LocalOffer />
                      <Typography variant="h6">Special Promotion Active!</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>
                      {product.pricing.promotion.name}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                      }}
                    >
                      ${product.pricing.discountedPrice.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration: 'line-through',
                        opacity: 0.7,
                        mb: 1,
                      }}
                    >
                      ${product.pricing.originalPrice.toFixed(2)}
                    </Typography>
                    <Chip
                      icon={<CheckCircle />}
                      label={`Save $${product.pricing.saveAmount.toFixed(2)} (-${product.pricing.discountPercentage}%)`}
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 1,
                      }}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                      Promotion ends: {formatDateTime(product.pricing.promotion.endDate)}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      Regular Price
                    </Typography>
                  </Box>
                )}
              </Card>

              {/* Promotion Details */}
              {promotion && (
                <Alert
                  severity="info"
                  icon={<Schedule />}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': { width: '100%' },
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {promotion.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {promotion.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.5}>
                    <Typography variant="caption">
                      <strong>Start:</strong> {formatDateTime(promotion.startDate)}
                    </Typography>
                    <Typography variant="caption">
                      <strong>End:</strong> {formatDateTime(promotion.endDate)}
                    </Typography>
                  </Stack>
                </Alert>
              )}

              {/* Stock Info */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Inventory color={product.stock > 0 ? 'success' : 'error'} />
                <Typography variant="h6">
                  {product.stock > 0 ? (
                    <span style={{ color: '#4caf50' }}>In Stock ({product.stock} available)</span>
                  ) : (
                    <span style={{ color: '#f44336' }}>Out of Stock</span>
                  )}
                </Typography>
              </Stack>

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {product.description || 'No description available.'}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  disabled={product.stock === 0}
                  fullWidth
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FE5B7B 30%, #FF7E43 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(255, 105, 135, .4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Add to Cart
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Product Details Grid */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card
              elevation={4}
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <LocalOffer sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Category
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {product.category}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={4}
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Inventory sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Available Stock
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {product.stock} units
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={4}
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Rating value={product.rating || 4.5} readOnly sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Customer Rating
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {product.rating || 4.5}/5.0
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default ProductDetail;
