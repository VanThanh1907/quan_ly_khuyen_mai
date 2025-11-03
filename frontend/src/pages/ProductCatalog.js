import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
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
  Zoom
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LocalOffer as OfferIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import api from '../utils/api';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

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
      
      console.log('Products fetched:', productsData); // Debug log
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map(p => p.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err); // Debug log
      setError('Failed to fetch products');
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} className="animate-pulse" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} className="animate-fade-in">
      {/* Header */}
      <Fade in timeout={800}>
        <Box textAlign="center" mb={5}>
          <Typography 
            variant="h3" 
            gutterBottom 
            className="text-gradient"
            sx={{ 
              fontWeight: 700,
              mb: 2
            }}
          >
            🛍️ Product Catalog
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Discover amazing products with exclusive deals
          </Typography>
        </Box>
      </Fade>

      {/* Filters */}
      <Fade in timeout={1000}>
        <Card sx={{ mb: 4, p: 3, boxShadow: 3 }} className="animate-scale-in">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search products by name, brand, or description..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                    },
                  },
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
                      <CategoryIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                <strong>{filteredProducts.length}</strong> products found
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Fade in timeout={1200}>
          <Box textAlign="center" py={8}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Grid container spacing={4}>
          {filteredProducts.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Zoom in timeout={300 + index * 50}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
                    },
                  }}
                >
                  {/* Stock Badge */}
                  {product.stock < 20 && (
                    <Chip
                      label={product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      color={product.stock === 0 ? 'error' : 'warning'}
                      size="small"
                      className="animate-pulse"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 1,
                        fontWeight: 'bold',
                      }}
                    />
                  )}

                  {/* Product Image */}
                  <CardMedia
                    component="img"
                    height="240"
                    image={product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />

                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Brand */}
                    {product.brand && (
                      <Typography variant="caption" color="primary" fontWeight="bold">
                        {product.brand}
                      </Typography>
                    )}

                    {/* Product Name */}
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '3em'
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* Rating */}
                    <Box display="flex" alignItems="center" mb={1}>
                      <Rating 
                        value={product.ratings || 0} 
                        precision={0.5} 
                        size="small" 
                        readOnly 
                      />
                      <Typography variant="caption" color="text.secondary" ml={1}>
                        ({product.ratings || 0})
                      </Typography>
                    </Box>

                    {/* Category */}
                    <Chip 
                      label={product.category} 
                      size="small" 
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />

                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.5em'
                      }}
                    >
                      {product.description}
                    </Typography>

                    {/* Price */}
                    <Box mt={2}>
                      <Typography 
                        variant="h5" 
                        color="primary" 
                        fontWeight="bold"
                        className="text-gradient"
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                      {product.stock > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {product.stock} in stock
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(product._id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProductCatalog;
