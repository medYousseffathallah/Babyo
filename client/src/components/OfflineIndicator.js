import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  Collapse
} from '@mui/material';
import {
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';
import { addNetworkListeners, isOnline } from '../utils/pwaUtils';

const OfflineIndicator = () => {
  const [online, setOnline] = useState(isOnline());
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowOnlineAlert(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowOfflineAlert(true);
      setShowOnlineAlert(false);
    };

    // Add network listeners
    const cleanup = addNetworkListeners(handleOnline, handleOffline);

    // Show offline alert if starting offline
    if (!online) {
      setShowOfflineAlert(true);
    }

    return cleanup;
  }, [online]);

  const handleCloseOnlineAlert = () => {
    setShowOnlineAlert(false);
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      {/* Online notification */}
      <Snackbar
        open={showOnlineAlert}
        autoHideDuration={3000}
        onClose={handleCloseOnlineAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseOnlineAlert}
          severity="success"
          icon={<OnlineIcon />}
          sx={{ width: '100%' }}
        >
          Back online! All features are available.
        </Alert>
      </Snackbar>

      {/* Persistent offline indicator */}
      <Snackbar
        open={showOfflineAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1400
        }}
      >
        <Alert
          severity="warning"
          icon={<OfflineIcon />}
          sx={{
            width: '100%',
            borderRadius: 0,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          action={
            <IconButton
              size="small"
              onClick={handleToggleExpanded}
              sx={{ color: 'inherit' }}
            >
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          }
        >
          <Box>
            <Typography variant="body2" fontWeight="medium">
              You're offline
            </Typography>
            
            <Collapse in={expanded}>
              <Box mt={1}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Limited functionality available:
                </Typography>
                <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
                  <Typography component="li" variant="caption" display="block">
                    View cached emotion data
                  </Typography>
                  <Typography component="li" variant="caption" display="block">
                    Basic camera access (if permissions granted)
                  </Typography>
                  <Typography component="li" variant="caption" display="block">
                    Local emotion detection (limited accuracy)
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  Data will sync when connection is restored.
                </Typography>
              </Box>
            </Collapse>
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
};

export default OfflineIndicator;