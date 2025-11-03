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

// Halloween styles
const halloweenStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px #ff8c00, 0 0 10px #ff8c00; }
    50% { box-shadow: 0 0 20px #ff8c00, 0 0 30px #ff8c00; }
  }
  
  @keyframes clickPumpkin {
    0% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.5) rotate(180deg); opacity: 0.7; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }
  
  .halloween-form-container {
    background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f2e 100%);
    min-height: 100vh;
    padding: 2rem 0;
    position: relative;
    overflow: hidden;
  }
  
  .halloween-form-title {
    font-family: 'Creepster', cursive !important;
    color: #ff8c00;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.3), 0 0 25px rgba(255,140,0,0.5);
    animation: float 3s ease-in-out infinite;
  }
  
  .halloween-form-paper {
    background: rgba(45, 27, 78, 0.95) !important;
    border: 3px solid #ff8c00 !important;
    box-shadow: 0 0 30px rgba(255, 140, 0, 0.5) !important;
  }

  
  .click-pumpkin {
    position: fixed;
    font-size: 2rem;
    animation: clickPumpkin 1s ease-out forwards;
    pointer-events: none;
    z-index: 9999;
  }
`;

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
  const [pumpkins, setPumpkins] = useState([]);

  // Click effect
  const handleClickEffect = (e) => {
    const pumpkin = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      emoji: ['🎃', '👻', '🦇', '🕷️', '🕸️'][Math.floor(Math.random() * 5)]
    };
    
    setPumpkins(prev => [...prev, pumpkin]);
    
    setTimeout(() => {
      setPumpkins(prev => prev.filter(p => p.id !== pumpkin.id));
    }, 1000);
  };

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
      <Box className="halloween-form-container">
        <style>{halloweenStyles}</style>
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#ff8c00' }} size={60} />
          <Typography sx={{ 
            mt: 2, 
            fontFamily: 'Creepster, cursive', 
            fontSize: '1.5rem',
            color: '#ffa500'
          }}>
            Summoning promotion data... 🔮
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <style>{halloweenStyles}</style>
      <Box className="halloween-form-container" onClick={handleClickEffect}>
        {/* Click pumpkins */}
        {pumpkins.map(pumpkin => (
          <div 
            key={pumpkin.id} 
            className="click-pumpkin"
            style={{ left: pumpkin.x, top: pumpkin.y }}
          >
            {pumpkin.emoji}
          </div>
        ))}

        <Container maxWidth="md" sx={{ py: 4, mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ fontSize: { xs: '3rem', sm: '4rem' }, mb: 2 }}>
              🎃✨🦇
            </Box>
            <Typography 
              variant="h3" 
              component="h1" 
              className="halloween-form-title"
              sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
            >
              {isEditMode ? '✏️ EDIT SPOOKY DEAL' : '🧙‍♂️ CONJURE NEW PROMOTION'}
            </Typography>
          </Box>

          <Paper elevation={3} className="halloween-form-paper" sx={{ p: 4, position: 'relative', overflow: 'visible' }}>

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

            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2,
                  background: 'rgba(46, 125, 50, 0.1)',
                  border: '2px solid #2e7d32',
                  color: '#39ff14',
                  fontFamily: 'Creepster, cursive',
                  fontSize: '1.1rem'
                }}
              >
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="🎃 Promotion Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(26, 15, 46, 0.8)',
                        color: '#ffa500',
                        fontSize: '1.2rem',
                        '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#ffa500' },
                        '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                      },
                      '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.2rem' }
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
                        fontSize: '1.1rem',
                        '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#ffa500' },
                        '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                      },
                      '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="💰 Discount Percentage"
                    name="discountPercentage"
                    type="number"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0, max: 100 }}
                    helperText="Enter discount percentage (0-100%)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(26, 15, 46, 0.8)',
                        color: '#39ff14',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#ffa500' },
                        '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                      },
                      '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.2rem' },
                      '& .MuiFormHelperText-root': { color: '#b19cd9', fontSize: '1rem' }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="🕐 Start Date & Time"
                      value={formData.startDate}
                      onChange={(value) => handleDateChange('startDate', value)}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          required: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(26, 15, 46, 0.8)',
                              color: '#ffa500',
                              fontSize: '1.1rem',
                              '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                              '&:hover fieldset': { borderColor: '#ffa500' },
                              '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                            },
                            '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' }
                          }
                        },
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
                              marginTop: '8px',
                              background: 'rgba(26, 15, 46, 0.98)',
                              border: '2px solid #ff8c00'
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
                      label="⏰ End Date & Time"
                      value={formData.endDate}
                      onChange={(value) => handleDateChange('endDate', value)}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          required: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(26, 15, 46, 0.8)',
                              color: '#ffa500',
                              fontSize: '1.1rem',
                              '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                              '&:hover fieldset': { borderColor: '#ffa500' },
                              '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                            },
                            '& .MuiInputLabel-root': { color: '#ffa500', fontSize: '1.1rem' }
                          }
                        },
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
                              marginTop: '8px',
                              background: 'rgba(26, 15, 46, 0.98)',
                              border: '2px solid #ff8c00'
                            }
                          }
                        }
                      }}
                      ampm={true}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <Alert 
                    severity="info" 
                    icon={false} 
                    sx={{ 
                      mt: 1,
                      background: 'rgba(2, 136, 209, 0.1)',
                      border: '2px solid #0288d1',
                      color: '#b19cd9'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ 
                        fontFamily: 'Creepster, cursive',
                        fontSize: '1.2rem',
                        color: '#ffa500'
                      }}
                    >
                      ℹ️ Status tự động:
                    </Typography>
                    <Typography 
                      variant="caption"
                      sx={{ fontSize: '1rem', color: '#b19cd9' }}
                    >
                      • <strong>💤 Inactive:</strong> Nếu chưa tới Start Date<br/>
                      • <strong>🎃 Active:</strong> Trong khoảng Start Date → End Date<br/>
                      • <strong>⚰️ Expired:</strong> Sau End Date
                    </Typography>
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#ffa500', fontSize: '1.1rem' }}>
                      🛍️ Applicable Products
                    </InputLabel>
                    <Select
                      multiple
                      name="applicableProducts"
                      value={formData.applicableProducts}
                      onChange={handleChange}
                      input={<OutlinedInput label="🛍️ Applicable Products" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const product = products.find(p => p._id === value);
                            return (
                              <Chip 
                                key={value} 
                                label={product?.name || value} 
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                                  color: '#1a0f2e',
                                  fontWeight: 700
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      sx={{
                        background: 'rgba(26, 15, 46, 0.8)',
                        color: '#ffa500',
                        '& fieldset': { borderColor: '#ff8c00', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#ffa500' },
                        '&.Mui-focused fieldset': { borderColor: '#ffa500', boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            background: 'rgba(26, 15, 46, 0.98)',
                            border: '2px solid #ff8c00',
                            '& .MuiMenuItem-root': {
                              color: '#b19cd9',
                              fontSize: '1.1rem',
                              '&:hover': {
                                background: 'rgba(255, 140, 0, 0.2)'
                              },
                              '&.Mui-selected': {
                                background: 'rgba(255, 140, 0, 0.3)',
                                color: '#ffa500',
                                fontWeight: 700
                              }
                            }
                          }
                        }
                      }}
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
                      sx={{
                        background: 'rgba(139, 0, 0, 0.8)',
                        color: '#ffa500',
                        borderColor: '#dc143c',
                        borderWidth: '2px',
                        fontFamily: 'Creepster, cursive',
                        fontSize: '1.2rem',
                        px: 3,
                        '&:hover': {
                          background: 'rgba(139, 0, 0, 1)',
                          borderWidth: '2px',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      ❌ Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        color: '#1a0f2e',
                        fontFamily: 'Creepster, cursive',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        border: '2px solid #ffa500',
                        px: 4,
                        animation: 'glow 2s ease-in-out infinite',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 0 30px #ff8c00'
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: '#1a0f2e' }} /> : 
                       isEditMode ? '✏️ Update Spell' : '🧙‍♂️ Cast Promotion'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default PromotionForm;
