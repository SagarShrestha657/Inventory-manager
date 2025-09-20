import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useTourStore from '../../store/tourStore';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,  
  History as HistoryIcon, // Import HistoryIcon
  Analytics as AnalyticsIcon, // Import AnalyticsIcon
  ViewList as ViewListIcon, // Import ViewListIcon
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Box,
  Typography,
  ListItemButton,
} from '@mui/material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Products', icon: <InventoryIcon />, path: '/products' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { text: 'History', icon: <HistoryIcon />, path: '/history' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const location = useLocation();
  const startTour = useTourStore((state) => state.startTour);

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(0, 1),
          ...theme.mixins.toolbar,
          justifyContent: 'flex-start',
        }}
      >
        {/* <IconButton onClick={onClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton> */}
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}> {/* Add icon and align items */}
          <ViewListIcon sx={{ mr: 3.5,h:10, color: 'text.secondary' }} /> {/* Add the icon */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
            Menu
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={onClose} // Add this line to close the sidebar on item click
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem key="tour" disablePadding>
          <ListItemButton
            onClick={() => {
              console.log('Take a Tour button clicked!');
              startTour();
              onClose();
            }}
          >
            <ListItemIcon><HelpOutlineIcon /></ListItemIcon>
            <ListItemText primary="Take a Tour" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};