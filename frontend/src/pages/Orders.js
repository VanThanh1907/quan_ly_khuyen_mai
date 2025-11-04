import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const halloweenStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 140, 0, 0.5); }
    50% { box-shadow: 0 0 40px rgba(255, 140, 0, 0.8); }
  }
  
  .halloween-card {
    background: linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%) !important;
    border: 3px solid #ff8c00 !important;
    box-shadow: 0 0 30px rgba(255, 140, 0, 0.4) !important;
  }
  
  .halloween-table-header {
    background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%) !important;
    color: #1a0f2e !important;
    font-family: 'Creepster', cursive !important;
    font-size: 1.2rem !important;
  }
  
  .halloween-table-row {
    background: rgba(45, 27, 78, 0.4) !important;
    border-bottom: 1px solid rgba(255, 140, 0, 0.3) !important;
    transition: all 0.3s ease !important;
  }
  
  .halloween-table-row:hover {
    background: rgba(255, 140, 0, 0.2) !important;
    transform: scale(1.01);
  }
`;

const Orders = () => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchOrders();
    if (!isAdmin()) {
      fetchStats();
    }
  }, [tabValue]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (isAdmin()) {
        // Admin: Get all orders
        response = await api.get('/orders/admin/all');
      } else {
        // User: Get my orders
        const statusFilter = tabValue === 0 ? '' : getStatusByTab(tabValue);
        response = await api.get(`/orders/my-orders${statusFilter ? `?status=${statusFilter}` : ''}`);
      }
      
      setOrders(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/my-stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getStatusByTab = (tab) => {
    const statusMap = {
      0: '',
      1: 'pending',
      2: 'processing',
      3: 'delivered',
      4: 'cancelled'
    };
    return statusMap[tab];
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setSelectedOrder(response.data.data);
      setOpenDialog(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setOpenDialog(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      confirmed: '#00bfff',
      processing: '#9370db',
      shipped: '#4169e1',
      delivered: '#32cd32',
      cancelled: '#dc143c'
    };
    return colors[status] || '#808080';
  };

  const getStatusIcon = (status) => {
    const icons = {
      delivered: '✅',
      cancelled: '❌',
      processing: '⚙️',
      shipped: '🚚',
      pending: '⏳'
    };
    return icons[status] || '📦';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#ff8c00' }} size={60} />
      </Box>
    );
  }

  return (
    <>
      <style>{halloweenStyles}</style>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Creepster, cursive',
                color: '#ff8c00',
                textShadow: '0 0 20px rgba(255, 140, 0, 0.5)',
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              📦 {isAdmin() ? 'ALL ORDERS' : 'MY ORDERS'}
            </Typography>
          </Box>
          <IconButton
            onClick={fetchOrders}
            sx={{
              background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
              color: '#1a0f2e',
              '&:hover': {
                background: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)',
                transform: 'rotate(180deg)',
                transition: 'all 0.5s ease'
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards (User only) */}
        {!isAdmin() && stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card className="halloween-card">
                <CardContent>
                  <Typography sx={{ fontFamily: 'Creepster, cursive', color: '#ffa500', fontSize: '1.2rem' }}>
                    💰 Total Spent
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#39ff14', fontWeight: 'bold' }}>
                    {formatCurrency(stats.totalSpent?.total || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="halloween-card">
                <CardContent>
                  <Typography sx={{ fontFamily: 'Creepster, cursive', color: '#ffa500', fontSize: '1.2rem' }}>
                    📦 Total Orders
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#00bfff', fontWeight: 'bold' }}>
                    {stats.totalSpent?.orders || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="halloween-card">
                <CardContent>
                  <Typography sx={{ fontFamily: 'Creepster, cursive', color: '#ffa500', fontSize: '1.2rem' }}>
                    ✅ Delivered
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#32cd32', fontWeight: 'bold' }}>
                    {stats.byStatus?.find(s => s._id === 'delivered')?.count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        {!isAdmin() && (
          <Paper sx={{ mb: 3, background: 'rgba(45, 27, 78, 0.6)', border: '2px solid #ff8c00' }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  fontFamily: 'Creepster, cursive',
                  color: '#ffa500',
                  fontSize: '1.1rem'
                },
                '& .Mui-selected': {
                  color: '#ff8c00 !important'
                }
              }}
            >
              <Tab label="📦 All" />
              <Tab label="⏳ Pending" />
              <Tab label="⚙️ Processing" />
              <Tab label="✅ Delivered" />
              <Tab label="❌ Cancelled" />
            </Tabs>
          </Paper>
        )}

        {/* Orders Table */}
        <TableContainer component={Paper} className="halloween-card">
          <Table>
            <TableHead>
              <TableRow sx={{ height: '70px' }}>
                <TableCell className="halloween-table-header" sx={{ fontSize: '1.2rem', py: 3 }}>Order #</TableCell>
                <TableCell className="halloween-table-header" sx={{ fontSize: '1.2rem', py: 3 }}>Date</TableCell>
                <TableCell className="halloween-table-header" sx={{ fontSize: '1.2rem', py: 3 }}>Items</TableCell>
                <TableCell className="halloween-table-header" sx={{ fontSize: '1.2rem', py: 3 }}>Total</TableCell>
                <TableCell className="halloween-table-header" sx={{ fontSize: '1.2rem', py: 3 }}>Status</TableCell>
                <TableCell className="halloween-table-header" sx={{ fontSize: '1.2rem', py: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: '#ffa500', py: 4 }}>
                    <Typography sx={{ fontFamily: 'Creepster, cursive', fontSize: '1.5rem' }}>
                      👻 No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow 
                    key={order._id} 
                    className="halloween-table-row"
                    sx={{ 
                      height: '80px',
                      '& td': { 
                        py: 3,
                        fontSize: '1.1rem'
                      }
                    }}
                  >
                    <TableCell sx={{ color: '#ff8c00', fontWeight: 'bold', fontSize: '1.15rem' }}>
                      {order.orderNumber}
                    </TableCell>
                    <TableCell sx={{ color: '#b19cd9', fontSize: '1.05rem' }}>
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell sx={{ color: '#ffa500', fontSize: '1.05rem' }}>
                      {order.items.length} item(s)
                    </TableCell>
                    <TableCell sx={{ color: '#39ff14', fontWeight: 'bold', fontSize: '1.15rem' }}>
                      {formatCurrency(order.finalAmount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${getStatusIcon(order.status)} ${order.status.toUpperCase()}`}
                        sx={{
                          background: getStatusColor(order.status),
                          color: '#fff',
                          fontFamily: 'Creepster, cursive',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          py: 2.5,
                          px: 1.5
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleViewOrder(order._id)}
                          size="large"
                          sx={{
                            color: '#00bfff',
                            '&:hover': { background: 'rgba(0, 191, 255, 0.2)' }
                          }}
                        >
                          <ViewIcon fontSize="medium" />
                        </IconButton>
                        {order.status === 'pending' && !isAdmin() && (
                          <IconButton
                            onClick={() => handleCancelOrder(order._id)}
                            size="large"
                            sx={{
                              color: '#dc143c',
                              '&:hover': { background: 'rgba(220, 20, 60, 0.2)' }
                            }}
                          >
                            <CancelIcon fontSize="medium" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Order Detail Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%)',
              border: '3px solid #ff8c00',
              boxShadow: '0 0 40px rgba(255, 140, 0, 0.6)'
            }
          }}
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ fontFamily: 'Creepster, cursive', color: '#ff8c00', fontSize: '2rem' }}>
                📦 Order Details - {selectedOrder.orderNumber}
              </DialogTitle>
              <DialogContent>
                {/* Order Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ color: '#ffa500', mb: 1 }}>
                    <strong>Status:</strong>{' '}
                    <Chip
                      label={`${getStatusIcon(selectedOrder.status)} ${selectedOrder.status.toUpperCase()}`}
                      sx={{
                        background: getStatusColor(selectedOrder.status),
                        color: '#fff',
                        ml: 1
                      }}
                    />
                  </Typography>
                  <Typography sx={{ color: '#ffa500' }}>
                    <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
                  </Typography>
                  <Typography sx={{ color: '#ffa500' }}>
                    <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 140, 0, 0.3)', mb: 3 }} />

                {/* Items */}
                <Typography sx={{ fontFamily: 'Creepster, cursive', color: '#ff8c00', fontSize: '1.5rem', mb: 2 }}>
                  Items:
                </Typography>
                {selectedOrder.items.map((item, index) => (
                  <Card key={index} className="halloween-card" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography sx={{ color: '#39ff14', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {item.productSnapshot.name}
                      </Typography>
                      <Typography sx={{ color: '#b19cd9' }}>
                        Quantity: {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                      </Typography>
                      <Typography sx={{ color: '#ffa500', fontWeight: 'bold' }}>
                        Subtotal: {formatCurrency(item.subtotal)}
                      </Typography>
                      {item.appliedPromotion && (
                        <Chip
                          label={`🎃 ${item.appliedPromotion.name} (-${item.appliedPromotion.discountPercentage}%)`}
                          sx={{ background: '#32cd32', color: '#fff', mt: 1 }}
                          size="small"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Divider sx={{ borderColor: 'rgba(255, 140, 0, 0.3)', my: 3 }} />

                {/* Total */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ color: '#ffa500', fontSize: '1.2rem' }}>
                    Total Amount: {formatCurrency(selectedOrder.totalAmount)}
                  </Typography>
                  {selectedOrder.totalDiscount > 0 && (
                    <Typography sx={{ color: '#32cd32', fontSize: '1.1rem' }}>
                      Discount: -{formatCurrency(selectedOrder.totalDiscount)}
                    </Typography>
                  )}
                  <Typography sx={{ color: '#39ff14', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Final Amount: {formatCurrency(selectedOrder.finalAmount)}
                  </Typography>
                </Box>

                {/* Shipping Address */}
                <Divider sx={{ borderColor: 'rgba(255, 140, 0, 0.3)', my: 3 }} />
                <Typography sx={{ fontFamily: 'Creepster, cursive', color: '#ff8c00', fontSize: '1.5rem', mb: 2 }}>
                  Shipping Address:
                </Typography>
                <Card className="halloween-card">
                  <CardContent>
                    <Typography sx={{ color: '#ffa500' }}>
                      <strong>{selectedOrder.shippingAddress.fullName}</strong>
                    </Typography>
                    <Typography sx={{ color: '#b19cd9' }}>
                      📞 {selectedOrder.shippingAddress.phone}
                    </Typography>
                    <Typography sx={{ color: '#b19cd9' }}>
                      📍 {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}
                    </Typography>
                    <Typography sx={{ color: '#b19cd9' }}>
                      {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}
                    </Typography>
                  </CardContent>
                </Card>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setOpenDialog(false)}
                  sx={{
                    background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                    color: '#1a0f2e',
                    fontFamily: 'Creepster, cursive',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)'
                    }
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </>
  );
};

export default Orders;
