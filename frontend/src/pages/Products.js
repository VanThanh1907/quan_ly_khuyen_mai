import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Halloween animations and styles
const halloweenStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes wiggle {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px #ff8c00, 0 0 10px #ff8c00; }
    50% { box-shadow: 0 0 20px #ff8c00, 0 0 30px #ff8c00; }
  }
  
  .halloween-products-title {
    font-family: 'Creepster', cursive !important;
    color: #ff8c00;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.3), 0 0 25px rgba(255,140,0,0.5);
    animation: float 3s ease-in-out infinite;
  }
  
  .halloween-products-container {
    background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f2e 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }
  
  .halloween-products-table {
    background: rgba(45, 27, 78, 0.95) !important;
    border: 3px solid #ff8c00;
    box-shadow: 0 0 20px rgba(255, 140, 0, 0.3);
  }
  
  .halloween-products-dialog {
    background: rgba(26, 15, 46, 0.98) !important;
    border: 3px solid #ff8c00 !important;
    box-shadow: 0 0 30px rgba(255, 140, 0, 0.5) !important;
  }
`;

const Products = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    imageUrl: '',
    brand: '',
    ratings: 0
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
  }, [page, rowsPerPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/products', { params });
      setProducts(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndBrands = async () => {
    try {
      const response = await api.get('/products', { params: { limit: 1000 } });
      const allProducts = response.data.data;
      
      // Extract unique categories
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories.sort());
      
      // Extract unique brands
      const uniqueBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
      setBrands(uniqueBrands.sort());
    } catch (err) {
      console.error('Failed to fetch categories and brands:', err);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description || '',
        stock: product.stock || 0,
        imageUrl: product.imageUrl || '',
        brand: product.brand || '',
        ratings: product.ratings || 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: '',
        description: '',
        stock: '',
        imageUrl: '',
        brand: '',
        ratings: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setSelectedImage(null);
    setImagePreview(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      stock: '',
      imageUrl: '',
      brand: '',
      ratings: 0
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload image immediately
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      setUploadingImage(true);
      setError('');

      const response = await api.post('/upload/product', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update formData with uploaded image URL
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.data.imageUrl
      }));

      console.log('Image uploaded:', response.data.data.imageUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <style>{halloweenStyles}</style>
      <Box className="halloween-products-container">
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ mb: 4, textAlign: 'center', py: 3 }}>
            <Box sx={{ fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, mb: 2 }}>
              🕸️🦇🕷️
            </Box>
            <Typography 
              variant="h2" 
              component="h1" 
              className="halloween-products-title"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                mb: 1
              }}
            >
              MYSTERIOUS PRODUCT LAIR
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Creepster, cursive',
                color: '#b19cd9',
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Conjure & Manage Your Spooky Inventory! 🎃
            </Typography>
          </Box>
        
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                background: 'rgba(211, 47, 47, 0.1)',
                border: '2px solid #d32f2f',
                color: '#ff6b6b',
                fontFamily: 'Creepster, cursive',
                fontSize: '1.1rem'
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="🔍 Search potions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(45, 27, 78, 0.8)',
                    color: '#ffa500',
                    fontFamily: 'Creepster, cursive',
                    fontSize: '1.1rem',
                    '& fieldset': {
                      borderColor: '#ff8c00',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#ffa500'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffa500',
                      boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#ffa500',
                    fontFamily: 'Creepster, cursive',
                    fontSize: '1.1rem'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchProducts}
                sx={{
                  background: 'rgba(45, 27, 78, 0.8)',
                  color: '#ff8c00',
                  borderColor: '#ff8c00',
                  fontFamily: 'Creepster, cursive',
                  fontSize: '1.2rem',
                  borderWidth: '2px',
                  '&:hover': {
                    background: 'rgba(45, 27, 78, 1)',
                    borderColor: '#ffa500',
                    borderWidth: '2px',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                🔄 Refresh
              </Button>
              {isAdmin() && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    fontFamily: 'Creepster, cursive',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    border: '2px solid #ffa500',
                    animation: 'glow 2s ease-in-out infinite',
                    '&:hover': {
                      transform: 'scale(1.05) rotate(2deg)',
                      boxShadow: '0 0 30px #ff8c00'
                    }
                  }}
                >
                  ➕ Summon Product
                </Button>
              )}
            </Grid>
          </Grid>

          <Paper className="halloween-products-table">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(255, 140, 0, 0.2)' }}>
                    <TableCell sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      🧪 Name
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      📦 Category
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      💰 Price
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      📊 Stock
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      📜 Description
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      ⚙️ Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell 
                        colSpan={6} 
                        align="center"
                        sx={{ color: '#ffa500', py: 4 }}
                      >
                        <CircularProgress sx={{ color: '#ff8c00' }} />
                        <Typography sx={{ 
                          mt: 2, 
                          fontFamily: 'Creepster, cursive', 
                          fontSize: '1.3rem',
                          color: '#ffa500'
                        }}>
                          Brewing products... 🧙‍♂️
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={6} 
                        align="center"
                        sx={{ 
                          fontFamily: 'Creepster, cursive', 
                          fontSize: '1.5rem',
                          color: '#b19cd9',
                          py: 4
                        }}
                      >
                        🕸️ The shelves are empty... no potions found! 🦇
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow 
                        key={product._id} 
                        hover
                        sx={{
                          '&:hover': {
                            background: 'rgba(255, 140, 0, 0.1) !important',
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease'
                          },
                          borderBottom: '1px solid rgba(255, 140, 0, 0.2)',
                          height: '80px'
                        }}
                      >
                        <TableCell sx={{ 
                          color: '#ffa500', 
                          fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                          fontWeight: 700,
                          py: 3
                        }}>
                          {product.name}
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#b19cd9', 
                          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                          py: 3
                        }}>
                          {product.category}
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          color: '#39ff14', 
                          fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.6rem' },
                          fontWeight: 900,
                          fontFamily: 'Creepster, cursive',
                          py: 3,
                          textShadow: '0 0 10px rgba(57, 255, 20, 0.5)'
                        }}>
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          color: product.stock < 10 ? '#ff0000' : '#39ff14', 
                          fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' },
                          fontWeight: 700,
                          py: 3
                        }}>
                          {product.stock}
                          {product.stock < 10 && ' ⚠️'}
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#b19cd9', 
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                          py: 3
                        }}>
                          {product.description
                            ? product.description.substring(0, 50) + '...'
                            : '💀 No description'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 3 }}>
                          <IconButton
                            sx={{
                              color: '#00bfff',
                              fontSize: '2rem',
                              '&:hover': {
                                color: '#1e90ff',
                                transform: 'scale(1.3)',
                                transition: 'all 0.3s ease'
                              }
                            }}
                            size="large"
                            onClick={() => navigate(`/products/${product._id}`)}
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="large" />
                          </IconButton>
                          {isAdmin() && (
                            <>
                              <IconButton
                                sx={{
                                  color: '#39ff14',
                                  fontSize: '2rem',
                                  '&:hover': {
                                    color: '#32cd32',
                                    transform: 'scale(1.3) rotate(15deg)',
                                    transition: 'all 0.3s ease'
                                  }
                                }}
                                size="large"
                                onClick={() => handleOpenDialog(product)}
                                title="Edit"
                              >
                                <EditIcon fontSize="large" />
                              </IconButton>
                              <IconButton
                                sx={{
                                  color: '#dc143c',
                                  fontSize: '2rem',
                                  '&:hover': {
                                    color: '#ff0000',
                                    transform: 'scale(1.3) rotate(-15deg)',
                                    transition: 'all 0.3s ease'
                                  }
                                }}
                                size="large"
                                onClick={() => handleDelete(product._id)}
                                title="Delete"
                              >
                                <DeleteIcon fontSize="large" />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                color: '#ffa500',
                fontFamily: 'Creepster, cursive',
                fontSize: '1.1rem',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontFamily: 'Creepster, cursive',
                  fontSize: '1.1rem',
                  color: '#ffa500'
                },
                '& .MuiSelect-icon': {
                  color: '#ffa500'
                },
                '& .MuiIconButton-root': {
                  color: '#ffa500'
                }
              }}
            />
          </Paper>

          {/* Product Form Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={handleCloseDialog} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              className: 'halloween-products-dialog',
              sx: {
                background: 'rgba(26, 15, 46, 0.98)',
                border: '3px solid #ff8c00',
                boxShadow: '0 0 30px rgba(255, 140, 0, 0.5)'
              }
            }}
          >
            <form onSubmit={handleSubmit}>
              <DialogTitle sx={{
                fontFamily: 'Creepster, cursive',
                fontSize: '2rem',
                color: '#ff8c00',
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                borderBottom: '2px solid #ff8c00',
                pb: 2
              }}>
                {editingProduct ? '✏️ Edit Potion' : '🧪 Conjure New Product'}
              </DialogTitle>
              <DialogContent sx={{ background: 'rgba(45, 27, 78, 0.5)' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="🧪 Product Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 15, 46, 0.8)',
                          color: '#ffa500',
                          '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#ffa500' },
                          '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                        },
                        '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="💰 Price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 15, 46, 0.8)',
                          color: '#39ff14',
                          '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#ffa500' },
                          '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                        },
                        '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="📊 Stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 15, 46, 0.8)',
                          color: '#ffa500',
                          '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#ffa500' },
                          '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                        },
                        '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      freeSolo
                      options={categories}
                      value={formData.category}
                      onChange={(event, newValue) => {
                        setFormData(prev => ({
                          ...prev,
                          category: newValue || ''
                        }));
                      }}
                      onInputChange={(event, newInputValue) => {
                        setFormData(prev => ({
                          ...prev,
                          category: newInputValue
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="📦 Category"
                          name="category"
                          required
                          helperText="Select from list or type new category"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(26, 15, 46, 0.8)',
                              color: '#ffa500',
                              '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                              '&:hover fieldset': { borderColor: '#ffa500' },
                              '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                            },
                            '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' },
                            '& .MuiFormHelperText-root': { color: '#b19cd9' }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      freeSolo
                      options={brands}
                      value={formData.brand}
                      onChange={(event, newValue) => {
                        setFormData(prev => ({
                          ...prev,
                          brand: newValue || ''
                        }));
                      }}
                      onInputChange={(event, newInputValue) => {
                        setFormData(prev => ({
                          ...prev,
                          brand: newInputValue
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="🏷️ Brand"
                          name="brand"
                          placeholder="e.g., Nike, Apple, Samsung"
                          helperText="Select from list or type new brand"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(26, 15, 46, 0.8)',
                              color: '#ffa500',
                              '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                              '&:hover fieldset': { borderColor: '#ffa500' },
                              '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                            },
                            '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' },
                            '& .MuiFormHelperText-root': { color: '#b19cd9' }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="product-image-upload"
                        type="file"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="product-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth
                          sx={{ 
                            mb: 2, 
                            py: 1.5,
                            background: 'rgba(45, 27, 78, 0.8)',
                            color: '#ff8c00',
                            borderColor: '#ff8c00',
                            borderWidth: '2px',
                            fontFamily: 'Creepster, cursive',
                            fontSize: '1.1rem',
                            '&:hover': {
                              background: 'rgba(45, 27, 78, 1)',
                              borderColor: '#ffa500',
                              borderWidth: '2px',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          📷 Choose Potion Image
                        </Button>
                      </label>
                      
                      {imagePreview && (
                        <Box sx={{ position: 'relative', mb: 2 }}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              border: '3px solid #ff8c00',
                              borderRadius: '8px',
                              padding: '8px',
                              background: 'rgba(26, 15, 46, 0.5)'
                            }}
                          />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: '#dc143c',
                              color: 'white',
                              '&:hover': { background: '#ff0000', transform: 'scale(1.1)' }
                            }}
                            onClick={handleRemoveImage}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                      
                      {uploadingImage && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, justifyContent: 'center' }}>
                          <CircularProgress size={20} sx={{ color: '#ff8c00' }} />
                          <Typography sx={{ 
                            fontFamily: 'Creepster, cursive',
                            fontSize: '1.1rem',
                            color: '#ffa500'
                          }}>
                            Enchanting image... 🔮
                          </Typography>
                        </Box>
                      )}
                      
                      {formData.imageUrl && !imagePreview && (
                        <Typography sx={{ 
                          fontFamily: 'Creepster, cursive',
                          fontSize: '1rem',
                          color: '#39ff14'
                        }} display="block" mb={2}>
                          ✓ Image uploaded: {formData.imageUrl}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="⭐ Ratings"
                      name="ratings"
                      type="number"
                      value={formData.ratings}
                      onChange={handleChange}
                      inputProps={{ min: 0, max: 5, step: 0.5 }}
                      helperText="Rating 0-5 stars"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 15, 46, 0.8)',
                          color: '#ffa500',
                          '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#ffa500' },
                          '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                        },
                        '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' },
                        '& .MuiFormHelperText-root': { color: '#b19cd9' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="📜 Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(26, 15, 46, 0.8)',
                          color: '#b19cd9',
                          '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#ffa500' },
                          '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                        },
                        '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' }
                      }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ 
                background: 'rgba(45, 27, 78, 0.5)', 
                borderTop: '2px solid #ff8c00',
                p: 2,
                gap: 2
              }}>
                <Button 
                  onClick={handleCloseDialog}
                  sx={{
                    background: 'rgba(139, 0, 0, 0.8)',
                    color: '#ffa500',
                    borderColor: '#dc143c',
                    borderWidth: '2px',
                    fontFamily: 'Creepster, cursive',
                    fontSize: '1.1rem',
                    px: 3,
                    '&:hover': {
                      background: 'rgba(139, 0, 0, 1)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  ❌ Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    fontFamily: 'Creepster, cursive',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    border: '2px solid #ffa500',
                    px: 3,
                    animation: 'glow 2s ease-in-out infinite',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 30px #ff8c00'
                    }
                  }}
                >
                  {editingProduct ? '✏️ Update Potion' : '🧪 Create Potion'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Container>
      </Box>
    </>
  );
};

export default Products;
