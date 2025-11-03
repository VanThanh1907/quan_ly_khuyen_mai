import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
  Box,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Vietnam',
  });

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/cart');
      setCart(response.data.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response?.status === 404) {
        // Cart doesn't exist yet, create empty cart state
        setCart({ items: [], userId: null });
      } else {
        setError(err.response?.data?.message || 'Không thể tải giỏ hàng');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await api.put('/cart/update', {
        productId,
        quantity: newQuantity,
      });
      setCart(response.data.data);
      setSuccess('Đã cập nhật số lượng');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật số lượng');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      setCart(response.data.data);
      setSuccess('Đã xóa sản phẩm khỏi giỏ hàng');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;

    try {
      await api.delete('/cart/clear');
      setCart({ items: [], userId: cart.userId });
      setSuccess('Đã xóa toàn bộ giỏ hàng');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.message || 'Không thể xóa giỏ hàng');
      setTimeout(() => setError(''), 3000);
    }
  };

  const validateBeforeCheckout = async () => {
    try {
      const response = await api.get('/cart/validate');
      const { valid, warnings } = response.data.data;
      
      if (!valid) {
        setValidationWarnings(warnings);
        return false;
      }
      
      setValidationWarnings([]);
      return true;
    } catch (err) {
      console.error('Error validating cart:', err);
      setError(err.response?.data?.message || 'Không thể kiểm tra giỏ hàng');
      return false;
    }
  };

  const handleCheckoutClick = async () => {
    const isValid = await validateBeforeCheckout();
    if (isValid) {
      setCheckoutOpen(true);
    }
  };

  const handleCheckout = async () => {
    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      setError('Vui lòng điền đầy đủ địa chỉ giao hàng');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await api.post('/cart/checkout', { shippingAddress });
      setSuccess(`Đặt hàng thành công! Mã đơn hàng: ${response.data.data.orderNumber}`);
      setCheckoutOpen(false);
      
      // Refresh cart (should be empty now)
      await fetchCart();
      
      // Navigate to orders page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      console.error('Error during checkout:', err);
      setError(err.response?.data?.message || 'Không thể hoàn tất đơn hàng');
      
      // If stock validation failed, refresh cart to show updated data
      if (err.response?.status === 400) {
        await fetchCart();
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.currentPrice || item.productSnapshot.price;
      return sum + (price * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    return subtotal - total;
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.currentPrice || item.productSnapshot.price;
      return sum + (price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#ff8c00' }} />
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(45, 27, 78, 0.95) 0%, rgba(13, 13, 13, 0.95) 100%)',
            border: '2px solid #ff8c00',
            boxShadow: '0 0 30px rgba(255, 140, 0, 0.3)',
          }}
        >
          <CartIcon sx={{ fontSize: 80, color: '#ff8c00', mb: 2 }} />
          <Typography variant="h4" sx={{ fontFamily: 'Creepster', color: '#ff8c00', mb: 2 }}>
            Giỏ Hàng Trống
          </Typography>
          <Typography sx={{ color: '#ddd', mb: 3 }}>
            Chưa có sản phẩm nào trong giỏ hàng của bạn
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/catalog')}
            sx={{
              background: 'linear-gradient(135deg, #ff8c00 0%, #ff6600 100%)',
              color: '#fff',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #ff6600 0%, #ff4400 100%)',
                transform: 'scale(1.05)',
              },
            }}
          >
            Tiếp Tục Mua Sắm
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <style>
        {`
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 140, 0, 0.5); }
            50% { box-shadow: 0 0 30px rgba(255, 140, 0, 0.8); }
          }
        `}
      </style>

      <Typography
        variant="h3"
        gutterBottom
        sx={{
          fontFamily: 'Creepster',
          color: '#ff8c00',
          textAlign: 'center',
          mb: 4,
          textShadow: '0 0 20px rgba(255, 140, 0, 0.5)',
        }}
      >
        🛒 Giỏ Hàng
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {validationWarnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setValidationWarnings([])}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Cảnh báo:
          </Typography>
          {validationWarnings.map((warning, index) => (
            <Typography key={index} variant="body2">
              • {warning}
            </Typography>
          ))}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <TableContainer
            component={Paper}
            sx={{
              background: 'linear-gradient(135deg, rgba(45, 27, 78, 0.95) 0%, rgba(13, 13, 13, 0.95) 100%)',
              border: '2px solid #ff8c00',
              animation: 'glow 3s infinite',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#ff8c00', fontWeight: 'bold' }}>Sản Phẩm</TableCell>
                  <TableCell sx={{ color: '#ff8c00', fontWeight: 'bold' }}>Giá</TableCell>
                  <TableCell sx={{ color: '#ff8c00', fontWeight: 'bold' }}>Số Lượng</TableCell>
                  <TableCell sx={{ color: '#ff8c00', fontWeight: 'bold' }}>Tổng</TableCell>
                  <TableCell sx={{ color: '#ff8c00', fontWeight: 'bold' }}>Thao Tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.items.map((item) => {
                  const currentPrice = item.currentPrice || item.productSnapshot.price;
                  const hasPromotion = item.activePromotion;
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock > 0 && item.stock < item.quantity;

                  return (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img
                            src={item.productSnapshot.imageUrl || '/images/products/placeholder.png'}
                            alt={item.productSnapshot.name}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '2px solid #ff8c00',
                            }}
                          />
                          <Box>
                            <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
                              {item.productSnapshot.name}
                            </Typography>
                            {hasPromotion && (
                              <Chip
                                label={`-${item.activePromotion.discountPercentage}%`}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #dc143c 0%, #ff0000 100%)',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                  mt: 0.5,
                                }}
                              />
                            )}
                            {isOutOfStock && (
                              <Chip
                                icon={<WarningIcon />}
                                label="Hết hàng"
                                size="small"
                                color="error"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                            {isLowStock && (
                              <Chip
                                icon={<WarningIcon />}
                                label={`Chỉ còn ${item.stock}`}
                                size="small"
                                color="warning"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {hasPromotion && (
                            <Typography
                              sx={{
                                color: '#999',
                                textDecoration: 'line-through',
                                fontSize: '0.85rem',
                              }}
                            >
                              ${item.productSnapshot.price.toLocaleString()}
                            </Typography>
                          )}
                          <Typography sx={{ color: '#ff8c00', fontWeight: 'bold' }}>
                            ${currentPrice.toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={updating[item.productId] || item.quantity <= 1}
                            sx={{
                              color: '#ff8c00',
                              border: '1px solid #ff8c00',
                              '&:hover': { background: 'rgba(255, 140, 0, 0.1)' },
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            value={item.quantity}
                            size="small"
                            disabled
                            sx={{
                              width: 60,
                              '& input': { textAlign: 'center', color: '#fff' },
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={updating[item.productId] || item.quantity >= item.stock}
                            sx={{
                              color: '#ff8c00',
                              border: '1px solid #ff8c00',
                              '&:hover': { background: 'rgba(255, 140, 0, 0.1)' },
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
                          ${(currentPrice * item.quantity).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => removeItem(item.productId)}
                          disabled={updating[item.productId]}
                          sx={{
                            color: '#dc143c',
                            '&:hover': { background: 'rgba(220, 20, 60, 0.1)' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/catalog')}
              sx={{
                color: '#ff8c00',
                borderColor: '#ff8c00',
                '&:hover': {
                  borderColor: '#ff6600',
                  background: 'rgba(255, 140, 0, 0.1)',
                },
              }}
            >
              Tiếp Tục Mua Sắm
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={clearCart}
            >
              Xóa Toàn Bộ
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(45, 27, 78, 0.95) 0%, rgba(13, 13, 13, 0.95) 100%)',
              border: '2px solid #ff8c00',
              boxShadow: '0 0 30px rgba(255, 140, 0, 0.3)',
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontFamily: 'Creepster',
                  color: '#ff8c00',
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                Tổng Đơn Hàng
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ddd' }}>Tạm tính:</Typography>
                  <Typography sx={{ color: '#fff' }}>
                    ${calculateSubtotal().toLocaleString()}
                  </Typography>
                </Box>

                {calculateDiscount() > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ color: '#ddd' }}>Giảm giá:</Typography>
                    <Typography sx={{ color: '#dc143c', fontWeight: 'bold' }}>
                      -${calculateDiscount().toLocaleString()}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2, borderColor: '#ff8c00' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#ff8c00', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    Tổng cộng:
                  </Typography>
                  <Typography sx={{ color: '#ff8c00', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    ${calculateTotal().toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CheckIcon />}
                onClick={handleCheckoutClick}
                sx={{
                  mt: 2,
                  background: 'linear-gradient(135deg, #ff8c00 0%, #ff6600 100%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff6600 0%, #ff4400 100%)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                Thanh Toán
              </Button>

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: '#999',
                  mt: 2,
                }}
              >
                Đơn hàng sẽ được xử lý sau khi xác nhận
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Checkout Dialog */}
      <Dialog
        open={checkoutOpen}
        onClose={() => !checkoutLoading && setCheckoutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(45, 27, 78, 0.98) 0%, rgba(13, 13, 13, 0.98) 100%)',
            border: '2px solid #ff8c00',
            boxShadow: '0 0 30px rgba(255, 140, 0, 0.5)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: 'Creepster',
            color: '#ff8c00',
            textAlign: 'center',
            fontSize: '1.8rem',
          }}
        >
          Thông Tin Giao Hàng
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Địa chỉ"
              value={shippingAddress.street}
              onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: '#ff8c00' },
                  '&:hover fieldset': { borderColor: '#ff6600' },
                },
                '& .MuiInputLabel-root': { color: '#ff8c00' },
              }}
            />
            <TextField
              fullWidth
              label="Thành phố"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: '#ff8c00' },
                  '&:hover fieldset': { borderColor: '#ff6600' },
                },
                '& .MuiInputLabel-root': { color: '#ff8c00' },
              }}
            />
            <TextField
              fullWidth
              label="Tỉnh/Thành"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: '#ff8c00' },
                  '&:hover fieldset': { borderColor: '#ff6600' },
                },
                '& .MuiInputLabel-root': { color: '#ff8c00' },
              }}
            />
            <TextField
              fullWidth
              label="Mã bưu điện"
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: '#ff8c00' },
                  '&:hover fieldset': { borderColor: '#ff6600' },
                },
                '& .MuiInputLabel-root': { color: '#ff8c00' },
              }}
            />
            <TextField
              fullWidth
              label="Quốc gia"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: '#ff8c00' },
                  '&:hover fieldset': { borderColor: '#ff6600' },
                },
                '& .MuiInputLabel-root': { color: '#ff8c00' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setCheckoutOpen(false)}
            disabled={checkoutLoading}
            sx={{ color: '#999' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ff8c00 0%, #ff6600 100%)',
              color: '#fff',
              fontWeight: 'bold',
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #ff6600 0%, #ff4400 100%)',
              },
            }}
          >
            {checkoutLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Xác Nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;
