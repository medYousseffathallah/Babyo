import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider
} from '@mui/material';
import {
  Wifi as OnlineIcon,
  WifiOff as OfflineIcon,
  GetApp as InstallIcon,
  Smartphone as DeviceIcon,
  Notifications as NotificationIcon,
  CameraAlt as CameraIcon,
  Storage as CacheIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import {
  isPWA,
  isOnline,
  getDeviceType,
  supportsCameraAPI,
  requestNotificationPermission,
  showNotification,
  canInstall,
  trackPWAEvent
} from '../utils/pwaUtils';

const PWATestPage = () => {
  const [online, setOnline] = useState(isOnline());
  const [pwaInstalled, setPwaInstalled] = useState(isPWA());
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [cameraSupported, setCameraSupported] = useState(supportsCameraAPI());
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [canInstallApp, setCanInstallApp] = useState(canInstall());

  useEffect(() => {
    // Update online status
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Track PWA test page visit
    trackPWAEvent('pwa_test_page_visit');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(Notification.permission);
    
    if (granted) {
      showNotification('Notifications Enabled!', {
        body: 'You will now receive baby monitoring alerts.',
        tag: 'test-notification'
      });
    }
  };

  const handleTestNotification = () => {
    showNotification('Test Notification', {
      body: 'This is a test notification from Baby Monitor PWA.',
      tag: 'test-notification'
    });
  };

  const getStatusIcon = (condition) => {
    return condition ? <CheckIcon color="success" /> : <CancelIcon color="error" />;
  };

  const getStatusColor = (condition) => {
    return condition ? 'success' : 'error';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        PWA Status Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" paragraph>
        Test and monitor Progressive Web App features
      </Typography>

      <Grid container spacing={3}>
        {/* Connection Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                {online ? <OnlineIcon color="success" /> : <OfflineIcon color="error" />}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Connection Status
                </Typography>
              </Box>
              <Chip
                label={online ? 'Online' : 'Offline'}
                color={online ? 'success' : 'error'}
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {online 
                  ? 'All features available' 
                  : 'Limited functionality - cached data only'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* PWA Installation Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <InstallIcon color={pwaInstalled ? 'success' : 'warning'} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  PWA Installation
                </Typography>
              </Box>
              <Chip
                label={pwaInstalled ? 'Installed' : 'Not Installed'}
                color={pwaInstalled ? 'success' : 'warning'}
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {pwaInstalled 
                  ? 'Running as installed PWA' 
                  : canInstallApp 
                    ? 'Can be installed - look for install button'
                    : 'Installation not available in this browser'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device & Browser Capabilities
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DeviceIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Device Type"
                    secondary={deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(cameraSupported)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Camera API Support"
                    secondary={cameraSupported ? 'Supported' : 'Not supported'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(notificationPermission === 'granted')}
                  </ListItemIcon>
                  <ListItemText
                    primary="Notifications"
                    secondary={`Permission: ${notificationPermission}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon('serviceWorker' in navigator)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Service Worker"
                    secondary={'serviceWorker' in navigator ? 'Supported' : 'Not supported'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* PWA Features Test */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test PWA Features
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={2}>
                {notificationPermission !== 'granted' && (
                  <Button
                    variant="outlined"
                    startIcon={<NotificationIcon />}
                    onClick={handleRequestNotifications}
                  >
                    Enable Notifications
                  </Button>
                )}
                
                {notificationPermission === 'granted' && (
                  <Button
                    variant="outlined"
                    startIcon={<NotificationIcon />}
                    onClick={handleTestNotification}
                  >
                    Test Notification
                  </Button>
                )}
              </Box>
              
              {notificationPermission === 'denied' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Notifications are blocked. Please enable them in your browser settings to receive baby monitoring alerts.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* PWA Benefits */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                PWA Benefits for Baby Monitor
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CacheIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Offline Functionality"
                    secondary="Access cached emotion data and basic features without internet"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <InstallIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Home Screen Installation"
                    secondary="Quick access like a native app from your device's home screen"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive alerts about baby's emotional state even when app is closed"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CameraIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Enhanced Performance"
                    secondary="Faster loading and smoother camera operations with service worker caching"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PWATestPage;