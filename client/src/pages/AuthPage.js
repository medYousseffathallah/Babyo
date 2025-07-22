import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Paper,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  IconButton
} from '@mui/material';
import {
  Security,
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  Facebook
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';

const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'parent',
    babyName: '',
    babyAge: '',
    agreeToTerms: false
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!loginForm.email || !loginForm.password) {
        throw new Error('Please fill in all fields');
      }
      
      // Mock login - in real app, this would call backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful login
      const mockUser = {
        id: '1',
        email: loginForm.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'parent'
      };
      
      // Store user data (in real app, use proper auth state management)
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-jwt-token');
      
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password) {
        throw new Error('Please fill in all required fields');
      }
      
      if (signupForm.password !== signupForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (signupForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (!signupForm.agreeToTerms) {
        throw new Error('Please agree to the terms and conditions');
      }
      
      // Mock signup - in real app, this would call backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Account created successfully! Please log in.');
      
      // Switch to login tab
      setTimeout(() => {
        setActiveTab(0);
        setSignupForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'parent',
          babyName: '',
          babyAge: '',
          agreeToTerms: false
        });
      }, 1500);
      
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setError(`${provider} login is not implemented yet. This would integrate with ${provider} OAuth.`);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navigation />

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={8} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                Baby Emotion Detector
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Secure access to your baby's emotion insights
              </Typography>
            </Box>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} centered>
                <Tab label="Login" />
                <Tab label="Sign Up" />
              </Tabs>
            </Box>

            {/* Login Form */}
            {activeTab === 0 && (
              <Box component="form" onSubmit={handleLoginSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={loginForm.rememberMe}
                      onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                    />
                  }
                  label="Remember me"
                  sx={{ mt: 1, mb: 2 }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2, mb: 2, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Box>
              </Box>
            )}

            {/* Signup Form */}
            {activeTab === 1 && (
              <Box component="form" onSubmit={handleSignupSubmit}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={signupForm.firstName}
                    onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    margin="normal"
                    required
                  />
                </Box>
                
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={signupForm.role}
                    label="Role"
                    onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                  >
                    <MenuItem value="parent">Parent</MenuItem>
                    <MenuItem value="pediatrician">Pediatrician</MenuItem>
                    <MenuItem value="caregiver">Caregiver</MenuItem>
                  </Select>
                </FormControl>
                
                {signupForm.role === 'parent' && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Baby's Name (Optional)"
                      value={signupForm.babyName}
                      onChange={(e) => setSignupForm({ ...signupForm, babyName: e.target.value })}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Baby's Age (months)"
                      type="number"
                      value={signupForm.babyAge}
                      onChange={(e) => setSignupForm({ ...signupForm, babyAge: e.target.value })}
                      margin="normal"
                      inputProps={{ min: 0, max: 60 }}
                    />
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  margin="normal"
                  required
                  helperText="Minimum 6 characters"
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={signupForm.agreeToTerms}
                      onChange={(e) => setSignupForm({ ...signupForm, agreeToTerms: e.target.checked })}
                      required
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link href="#" onClick={(e) => e.preventDefault()}>
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="#" onClick={(e) => e.preventDefault()}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                  sx={{ mt: 1, mb: 2 }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2, mb: 2, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
              </Box>
            )}

            {/* Social Login */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Or continue with
              </Typography>
            </Divider>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Facebook />}
                onClick={() => handleSocialLogin('Facebook')}
                disabled={loading}
              >
                Facebook
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            🔒 Your privacy is our priority. All data is encrypted and securely stored.
            <br />
            This application is not a medical diagnosis tool. Please consult healthcare professionals for medical concerns.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthPage;