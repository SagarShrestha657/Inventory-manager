import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu'; // Import MenuIcon
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  Drawer,// Import ViewListIcon
} from '@mui/material';

import { Sidebar } from './Sidebar'; // Import Sidebar component

const drawerWidth = 240;

// SVG Logo Component
const Logo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v3" />
      <path d="M21 8h-6l-2 3H5a2 2 0 0 0-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7a2 2 0 0 0-2-2z" />
      <path d="M8 12h8" />
      <path d="M12 8v4" />
    </svg>
    <Typography variant="h6" component="div" sx={{ ml: 1, fontWeight: 700, color: 'inherit' }}>
      InventoryFlow
    </Typography>
  </Box>
);

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  // const handleDrawerClose = () => {
  //   setIsClosing(true);
  //   setMobileOpen(false);
  // };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { xl2: `calc(100% - ${drawerWidth}px)` },
          ml: { xl2: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper, // Use paper background for a clean look
          color: theme.palette.text.primary, // Use primary text color for content
          boxShadow: 'none', // Remove shadow for minimalist look
          borderBottom: `1px solid ${theme.palette.divider}`, // Subtle border at the bottom
        }}
        
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xl2: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Logo /> {/* Integrate the Logo component */}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { xl2: drawerWidth }, flexShrink: { xl2: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'block', md: 'block', xl2: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          <Sidebar open={mobileOpen} onClose={handleDrawerToggle} /> {/* Use Sidebar component */}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', xl2: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          <Sidebar open={true} onClose={() => { }} /> {/* Use Sidebar component */}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xl2: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Height of the AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;