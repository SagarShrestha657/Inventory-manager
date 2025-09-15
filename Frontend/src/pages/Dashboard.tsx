import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  styled,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
} from '@mui/icons-material';

const ActionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

interface ActionIconProps {
  bgcolor?: string;
}
const ActionIcon = styled(Box)<ActionIconProps>(({ theme, bgcolor = 'primary.main' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: bgcolor,
  color: theme.palette.common.white,
  margin: '0 auto 16px',
}));

const WelcomeSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 2,
}));

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add new products to your inventory',
      icon: <AddIcon fontSize="large" />,
      color: 'success.main',
      action: () => navigate('/products'),
    },
    {
      title: 'View Analytics',
      description: 'Check sales performance and goals',
      icon: <AnalyticsIcon fontSize="large" />,
      color: 'info.main',
      action: () => navigate('/analytics'),
    },
    {
      title: 'Inventory Management',
      description: 'Manage your product inventory',
      icon: <InventoryIcon fontSize="large" />,
      color: 'primary.main',
      action: () => navigate('/products'),
    },
    {
      title: 'View History',
      description: 'Check transaction history',
      icon: <HistoryIcon fontSize="large" />,
      color: 'warning.main',
      action: () => navigate('/history'),
    },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <WelcomeSection elevation={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Welcome to Your Inventory Manager
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your inventory efficiently and track your business goals
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <TrendingUpIcon sx={{ fontSize: 80, opacity: 0.3 }} />
          </Box>
        </Box>
      </WelcomeSection>

      {/* Quick Actions Section */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <ActionCard onClick={action.action}>
              <CardContent sx={{ textAlign: 'center', flexGrow: 1, p: 3 }}>
                <ActionIcon bgcolor={action.color}>
                  {action.icon}
                </ActionIcon>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {action.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {action.description}
                </Typography>
              </CardContent>
            </ActionCard>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <MoneyIcon sx={{ mr: 2, fontSize: 40 }} />
              <Typography variant="h6">
                Business Overview
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              View detailed analytics and set your business goals in the Analytics section.
              Track your daily and monthly progress towards your targets.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #42A5F5 0%, #1976D2 100%)',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <ReportIcon sx={{ mr: 2, fontSize: 40 }} />
              <Typography variant="h6">
                Performance Tracking
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Monitor your inventory performance and sales data. 
              Get insights on your best-selling products and profit margins.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
