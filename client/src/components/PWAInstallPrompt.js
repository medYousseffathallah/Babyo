import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  Smartphone as PhoneIcon
} from '@mui/icons-material';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setSnackbarMessage('Baby Monitor installed successfully!');
      setShowSnackbar(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallDialog(true);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setSnackbarMessage('Installing Baby Monitor...');
      } else {
        setSnackbarMessage('Installation cancelled');
      }
      
      setShowSnackbar(true);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
      setSnackbarMessage('Installation failed. Please try again.');
      setShowSnackbar(true);
    }
  };

  const handleCloseDialog = () => {
    setShowInstallDialog(false);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  // Don't show install button if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<InstallIcon />}
        onClick={handleInstallClick}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        Install App
      </Button>

      <Dialog
        open={showInstallDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              Install Baby Monitor
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" paragraph>
            Install the Baby Monitor app on your device for the best experience:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" paragraph>
              Quick access from your home screen
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Offline functionality for basic features
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Push notifications for baby monitoring alerts
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Native app-like experience
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            <strong>How to install:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • On Chrome: Look for the install icon in the address bar
            <br />
            • On Safari (iOS): Tap the share button and select "Add to Home Screen"
            <br />
            • On Android: Tap the menu and select "Add to Home Screen"
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Maybe Later
          </Button>
          <Button onClick={handleCloseDialog} variant="contained">
            Got It
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAInstallPrompt;