import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { CheckCircle, Error, Api } from '@mui/icons-material';

const RoboflowTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testRoboflowConnection = async () => {
    setLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/test-roboflow');
      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
      } else {
        setError(data.message || 'Failed to test Roboflow connection');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Api color="primary" />
          Roboflow Integration Test
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Test the connection to your Roboflow AI model to ensure proper integration.
        </Typography>

        <Button
          variant="contained"
          onClick={testRoboflowConnection}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Api />}
          sx={{ mb: 2 }}
        >
          {loading ? 'Testing Connection...' : 'Test Roboflow Connection'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {testResult && (
          <Box>
            <Alert 
              severity={testResult.status === 'success' ? 'success' : 'error'} 
              sx={{ mb: 2 }}
              icon={testResult.status === 'success' ? <CheckCircle /> : <Error />}
            >
              {testResult.message}
            </Alert>

            {testResult.status === 'success' && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Connection Details:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    label={`Workspace: ${testResult.workspace}`} 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                  />
                  <Chip 
                    label={`Project: ${testResult.projectId}`} 
                    color="secondary" 
                    variant="outlined" 
                    size="small"
                  />
                  <Chip 
                    label={`Version: ${testResult.modelVersion}`} 
                    color="success" 
                    variant="outlined" 
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Inference URL: {testResult.inferenceUrl}
                </Typography>
              </Stack>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RoboflowTest;