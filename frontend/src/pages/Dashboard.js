import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Halloween animations
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
  
  .halloween-title {
    font-family: 'Creepster', cursive !important;
    color: #ff8c00;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.3), 0 0 25px rgba(255,140,0,0.5);
    animation: float 3s ease-in-out infinite;
  }
  
  .halloween-container {
    background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1a0f2e 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }
  
  .halloween-table {
    background: rgba(45, 27, 78, 0.95) !important;
    border: 3px solid #ff8c00;
    box-shadow: 0 0 20px rgba(255, 140, 0, 0.3);
  }
  
  .halloween-search {
    background: rgba(45, 27, 78, 0.8) !important;
    border: 2px solid #ff8c00 !important;
    border-radius: 8px !important;
  }
  
  .halloween-search input,
  .halloween-search label {
    color: #ffa500 !important;
    font-family: 'Creepster', cursive !important;
    font-size: 1.1rem !important;
  }
  
  .halloween-btn {
    font-family: 'Creepster', cursive !important;
    font-size: 1.2rem !important;
    background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%) !important;
    color: #1a0f2e !important;
    border: 2px solid #ffa500 !important;
    font-weight: 700 !important;
    animation: glow 2s ease-in-out infinite;
  }
  
  .halloween-btn:hover {
    transform: scale(1.05) rotate(2deg);
    box-shadow: 0 0 30px #ff8c00;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  useEffect(() => {
    fetchPromotions();
  }, [page, rowsPerPage, filters]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      const response = await api.get('/promotions', { params });
      setPromotions(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) {
      return;
    }

    try {
      await api.delete(`/promotions/${id}`);
      fetchPromotions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete promotion');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <style>{halloweenStyles}</style>
      <Box className="halloween-container">
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ mb: 4, textAlign: 'center', py: 3 }}>
            <Box sx={{ fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }, mb: 2 }}>
              🎃👻🦇
            </Box>
            <Typography 
              variant="h2" 
              component="h1" 
              className="halloween-title"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                mb: 1
              }}
            >
              SPOOKY PROMOTIONS VAULT
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Creepster, cursive',
                color: '#b19cd9',
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Manage Your Frightfully Good Deals! 🕷️
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
                label="🔍 Search by name"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="halloween-search"
                sx={{
                  '& .MuiOutlinedInput-root': {
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
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="👁️ Status Filter"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="halloween-search"
                sx={{
                  '& .MuiOutlinedInput-root': {
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
                  }
                }}
              >
                <MenuItem value="">All Spells</MenuItem>
                <MenuItem value="active">🎃 Active</MenuItem>
                <MenuItem value="inactive">💤 Inactive</MenuItem>
                <MenuItem value="expired">⚰️ Expired</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={12} md={5} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchPromotions}
                className="halloween-btn"
                sx={{
                  background: 'rgba(45, 27, 78, 0.8) !important',
                  color: '#ff8c00 !important',
                  borderColor: '#ff8c00 !important',
                  '&:hover': {
                    background: 'rgba(45, 27, 78, 1) !important',
                    borderColor: '#ffa500 !important'
                  }
                }}
              >
                🔄 Refresh
              </Button>
              {isAdmin() && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/promotions/new')}
                  className="halloween-btn"
                >
                  ➕ Conjure New Promotion
                </Button>
              )}
            </Grid>
          </Grid>

          <Paper className="halloween-table">
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
                      👻 Name
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
                      💰 Discount
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      🕐 Start
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      ⏰ End
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      ⚡ Status
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      🛍️ Products
                    </TableCell>
                    {isAdmin() && <TableCell align="center" sx={{ 
                      fontFamily: 'Creepster, cursive', 
                      fontSize: '1.3rem', 
                      color: '#ffa500',
                      fontWeight: 700
                    }}>
                      ⚙️ Actions
                    </TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell 
                        colSpan={isAdmin() ? 8 : 7} 
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
                          Summoning Promotions... 🔮
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : promotions.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={isAdmin() ? 8 : 7} 
                        align="center"
                        sx={{ 
                          fontFamily: 'Creepster, cursive', 
                          fontSize: '1.5rem',
                          color: '#b19cd9',
                          py: 4
                        }}
                      >
                        👻 No promotions found in the crypt... 🕸️
                      </TableCell>
                    </TableRow>
                  ) : (
                    promotions.map((promotion) => (
                      <TableRow 
                        key={promotion._id} 
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
                          {promotion.name}
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#b19cd9', 
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                          py: 3
                        }}>
                          {promotion.description
                            ? promotion.description.substring(0, 50) + '...'
                            : '💀 No description'}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 3 }}>
                          <Chip 
                            label={`${promotion.discountPercentage}%`} 
                            sx={{
                              background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                              color: '#1a0f2e',
                              fontFamily: 'Creepster, cursive',
                              fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.6rem' },
                              fontWeight: 900,
                              animation: 'wiggle 2s ease-in-out infinite',
                              boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)',
                              height: '45px',
                              px: 2
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#b19cd9', 
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                          py: 3
                        }}>
                          {formatDateTime(promotion.startDate)}
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#b19cd9', 
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                          py: 3
                        }}>
                          {formatDateTime(promotion.endDate)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 3 }}>
                          <Chip
                            label={promotion.status === 'active' ? '🎃 Active' : 
                                   promotion.status === 'inactive' ? '💤 Inactive' : 
                                   '⚰️ Expired'}
                            sx={{
                              background: promotion.status === 'active' ? 
                                'linear-gradient(135deg, #39ff14 0%, #32cd32 100%)' :
                                promotion.status === 'inactive' ?
                                'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)' :
                                'linear-gradient(135deg, #8b0000 0%, #dc143c 100%)',
                              color: '#fff',
                              fontFamily: 'Creepster, cursive',
                              fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.4rem' },
                              fontWeight: 700,
                              boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)',
                              height: '45px',
                              px: 2
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 3 }}>
                          <Chip
                            label={promotion.applicableProducts?.length || 0}
                            sx={{
                              background: 'rgba(177, 156, 217, 0.3)',
                              color: '#b19cd9',
                              fontFamily: 'Creepster, cursive',
                              fontSize: { xs: '1.3rem', sm: '1.4rem', md: '1.5rem' },
                              fontWeight: 700,
                              border: '2px solid #b19cd9',
                              height: '45px',
                              minWidth: '50px'
                            }}
                          />
                        </TableCell>
                        {isAdmin() && (
                          <TableCell align="center" sx={{ py: 3 }}>
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
                              onClick={() => navigate(`/promotions/edit/${promotion._id}`)}
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
                              onClick={() => handleDelete(promotion._id)}
                            >
                              <DeleteIcon fontSize="large" />
                            </IconButton>
                          </TableCell>
                        )}
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
        </Container>
      </Box>
    </>
  );
};

export default Dashboard;
