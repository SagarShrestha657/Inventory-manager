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
import Tour from '../tour/Tour';

const drawerWidth = 240;

// SVG Logo Component
const Logo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
    
    <Typography variant="h6" component="div" sx={{ ml: 1, fontWeight: 700, color: 'inherit' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="180" height="50" viewBox="0 0 300 80" fill="none">
        <rect x="10" y="17" width="60" height="60" rx="8" fill="#4F46E5" />
        <path d="M25 32 L55 62 M55 32 L25 62" stroke="white" stroke-width="6" stroke-linecap="round" />
        <text x="80" y="60" font-family="Inter, sans-serif" font-weight="700" font-size="38" fill="#111827">
          Vendora<tspan fill="#4F46E5">X</tspan>
        </text>
      </svg>
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
        id="app-bar"
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
          id="sidebar"
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
        id="main-content"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xl2: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Height of the AppBar
        }}
      >
        {children}
      </Box>
      <Tour />
    </Box>
  );
};

export default Layout;