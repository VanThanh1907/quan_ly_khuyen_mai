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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Promotion Management Dashboard
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
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} md={5} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchPromotions}
            >
              Refresh
            </Button>
            {isAdmin() && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/promotions/new')}
              >
                Add Promotion
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
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Discount (%)</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Products</TableCell>
                  {isAdmin() && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin() ? 8 : 7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : promotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin() ? 8 : 7} align="center">
                      No promotions found
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions.map((promotion) => (
                    <TableRow key={promotion._id} hover>
                      <TableCell>{promotion.name}</TableCell>
                      <TableCell>
                        {promotion.description
                          ? promotion.description.substring(0, 50) + '...'
                          : '-'}
                      </TableCell>
                      <TableCell align="center">{promotion.discountPercentage}%</TableCell>
                      <TableCell>{formatDate(promotion.startDate)}</TableCell>
                      <TableCell>{formatDate(promotion.endDate)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={promotion.status}
                          color={getStatusColor(promotion.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {promotion.applicableProducts?.length || 0}
                      </TableCell>
                      {isAdmin() && (
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/promotions/edit/${promotion._id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(promotion._id)}
                          >
                            <DeleteIcon />
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
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
