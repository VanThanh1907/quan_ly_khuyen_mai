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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Management
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search by name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchProducts}
            >
              Refresh
            </Button>
            {isAdmin() && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Product
              </Button>
            )}
          </Grid>
        </Grid>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product._id} hover>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{product.stock}</TableCell>
                      <TableCell>
                        {product.description
                          ? product.description.substring(0, 50) + '...'
                          : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => navigate(`/products/${product._id}`)}
                          title="View Details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {isAdmin() && (
                          <>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDialog(product)}
                              title="Edit"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(product._id)}
                              title="Delete"
                            >
                              <DeleteIcon />
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
          />
        </Paper>
      </Box>

      {/* Product Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
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
                      label="Category"
                      name="category"
                      required
                      helperText="Select from list or type new category"
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
                      label="Brand"
                      name="brand"
                      placeholder="e.g., Nike, Apple, Samsung"
                      helperText="Select from list or type new brand"
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
                      sx={{ mb: 2, py: 1.5 }}
                    >
                      📷 Choose Product Image
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
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          padding: '8px'
                        }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'white',
                          '&:hover': { background: '#f5f5f5' }
                        }}
                        onClick={handleRemoveImage}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                  
                  {uploadingImage && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Uploading image...</Typography>
                    </Box>
                  )}
                  
                  {formData.imageUrl && !imagePreview && (
                    <Typography variant="caption" color="success.main" display="block" mb={2}>
                      ✓ Image uploaded: {formData.imageUrl}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ratings"
                  name="ratings"
                  type="number"
                  value={formData.ratings}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 5, step: 0.5 }}
                  helperText="Rating 0-5 stars"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Products;
