import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Avatar,
  useMediaQuery,
  Container,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Home,
  Videocam,
  Dashboard,
  CloudUpload,
  Assessment,
  Person,
  Login,
  Close
} from '@mui/icons-material';

const Navigation = ({ isAuthenticated = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home /> },
    { name: 'Live Detection', path: '/live', icon: <Videocam /> },
    { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { name: 'Upload Session', path: '/upload', icon: <CloudUpload /> },
    { name: 'Reports', path: '/reports', icon: <Assessment /> },
  ];

  const authItems = isAuthenticated 
    ? [{ name: 'Profile', path: '/profile', icon: <Person /> }]
    : [{ name: 'Login / Sign Up', path: '/auth', icon: <Login /> }];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const renderNavItems = (items) => {
    return items.map((item) => (
      <Button
        key={item.name}
        color="inherit"
        onClick={() => handleNavigation(item.path)}
        sx={{
          mx: 1,
          fontWeight: isActive(item.path) ? 'bold' : 'normal',
          borderBottom: isActive(item.path) ? '2px solid white' : 'none',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
        startIcon={item.icon}
      >
        {item.name}
      </Button>
    ));
  };

  const renderMobileDrawer = () => {
    return (
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Baby Emotion Detector
          </Typography>
          <IconButton onClick={toggleDrawer}>
            <Close />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {navItems.concat(authItems).map((item) => (
            <ListItem 
              button 
              key={item.name} 
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                backgroundColor: isActive(item.path) ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              {renderMobileDrawer()}
            </>
          ) : null}
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              mr: isMobile ? 0 : 2
            }}
            onClick={() => handleNavigation('/')}
          >
            <Avatar 
              src="/baby-logo.svg" 
              alt="Baby Emotion Detector" 
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 1,
                bgcolor: 'primary.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              B
            </Avatar>
            {(!isMobile || (isMobile && !drawerOpen)) && (
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ fontWeight: 'bold' }}
              >
                BabyEmo
              </Typography>
            )}
          </Box>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {renderNavItems(navItems)}
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {renderNavItems(authItems)}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;