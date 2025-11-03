import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../utils/api';

const PromotionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercentage: '',
    startDate: new Date(),
    endDate: new Date(),
    applicableProducts: []
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
    if (isEditMode) {
      fetchPromotion();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { limit: 100 } });
      setProducts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchPromotion = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/promotions/${id}`);
      const promotion = response.data.data;
      
      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        discountPercentage: promotion.discountPercentage,
        startDate: new Date(promotion.startDate),
        endDate: new Date(promotion.endDate),
        applicableProducts: promotion.applicableProducts.map(p => p._id)
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleDateChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.discountPercentage || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      setError('Discount percentage must be between 0 and 100');
      setLoading(false);
      return;
    }

    // Convert to timestamps for reliable comparison
    const startTime = new Date(formData.startDate).getTime();
    const endTime = new Date(formData.endDate).getTime();
    
    if (endTime <= startTime) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        await api.put(`/promotions/${id}`, formData);
        setSuccess('Promotion updated successfully');
      } else {
        await api.post('/promotions', formData);
        setSuccess('Promotion created successfully');
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save promotion');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, mb: 8 }} className="animate-fade-in">
      <Paper elevation={3} sx={{ p: 4, position: 'relative', overflow: 'visible' }} className="animate-scale-in">
        <Typography variant="h5" component="h1" gutterBottom className="text-gradient">
          {isEditMode ? 'Edit Promotion' : 'Create New Promotion'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Promotion Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Discount Percentage"
                name="discountPercentage"
                type="number"
                value={formData.discountPercentage}
                onChange={handleChange}
                required
                inputProps={{ min: 0, max: 100 }}
                helperText="Enter discount percentage (0-100%)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={formData.startDate}
                  onChange={(value) => handleDateChange('startDate', value)}
                  slotProps={{ 
                    textField: { fullWidth: true, required: true },
                    popper: {
                      placement: 'auto',
                      modifiers: [
                        {
                          name: 'flip',
                          enabled: true,
                          options: {
                            altBoundary: true,
                            rootBoundary: 'viewport',
                            padding: 8,
                          },
                        },
                        {
                          name: 'preventOverflow',
                          enabled: true,
                          options: {
                            altAxis: true,
                            altBoundary: true,
                            tether: false,
                            rootBoundary: 'viewport',
                            padding: 8,
                          },
                        },
                      ],
                      sx: { 
                        zIndex: 9999,
                        '& .MuiPaper-root': {
                          marginTop: '8px'
                        }
                      }
                    }
                  }}
                  ampm={true}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.endDate}
                  onChange={(value) => handleDateChange('endDate', value)}
                  slotProps={{ 
                    textField: { fullWidth: true, required: true },
                    popper: {
                      placement: 'auto',
                      modifiers: [
                        {
                          name: 'flip',
                          enabled: true,
                          options: {
                            altBoundary: true,
                            rootBoundary: 'viewport',
                            padding: 8,
                          },
                        },
                        {
                          name: 'preventOverflow',
                          enabled: true,
                          options: {
                            altAxis: true,
                            altBoundary: true,
                            tether: false,
                            rootBoundary: 'viewport',
                            padding: 8,
                          },
                        },
                      ],
                      sx: { 
                        zIndex: 9999,
                        '& .MuiPaper-root': {
                          marginTop: '8px'
                        }
                      }
                    }
                  }}
                  ampm={true}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" icon={false} sx={{ mt: 1 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  ℹ️ Status tự động:
                </Typography>
                <Typography variant="caption">
                  • <strong>Inactive:</strong> Nếu chưa tới Start Date<br/>
                  • <strong>Active:</strong> Trong khoảng Start Date → End Date<br/>
                  • <strong>Expired:</strong> Sau End Date
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Applicable Products</InputLabel>
                <Select
                  multiple
                  name="applicableProducts"
                  value={formData.applicableProducts}
                  onChange={handleChange}
                  input={<OutlinedInput label="Applicable Products" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const product = products.find(p => p._id === value);
                        return (
                          <Chip key={value} label={product?.name || value} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name} - ${product.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PromotionForm;
