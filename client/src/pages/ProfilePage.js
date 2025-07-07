import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Avatar,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton
} from '@mui/material';
import {
  Person,
  Settings,
  ChildCare,
  Notifications,
  Security,
  Palette,
  Language,
  Storage,
  Help,
  Logout,
  Edit,
  Save,
  Cancel,
  Delete,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Navigation from '../components/Navigation';

const ProfilePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBaby, setEditingBaby] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'parent',
    joinDate: '2024-01-15',
    avatar: null
  });
  
  // Baby profile state
  const [babyProfiles, setBabyProfiles] = useState([
    {
      id: 1,
      name: 'Emma',
      birthDate: '2023-06-15',
      gender: 'female',
      weight: '8.5',
      height: '65',
      allergies: 'None',
      notes: 'Very active baby, loves music',
      photo: null
    }
  ]);
  
  // Settings state
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: {
      email: true,
      push: true,
      emotionAlerts: true,
      weeklyReports: true
    },
    privacy: {
      shareData: false,
      analytics: true
    },
    language: 'en',
    timezone: 'UTC-5'
  });

  const [newBaby, setNewBaby] = useState({
    name: '',
    birthDate: '',
    gender: '',
    weight: '',
    height: '',
    allergies: '',
    notes: ''
  });

  const [addBabyDialogOpen, setAddBabyDialogOpen] = useState(false);

  useEffect(() => {
    // Load user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserProfile(prev => ({ ...prev, ...user }));
    }
  }, []);

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      setSuccess('Profile updated successfully!');
      setEditingProfile(false);
      
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBabySave = async (babyId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Baby profile updated successfully!');
      setEditingBaby(false);
      
    } catch (err) {
      setError('Failed to update baby profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBaby = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newBaby.name || !newBaby.birthDate) {
        throw new Error('Name and birth date are required');
      }
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const baby = {
        id: Date.now(),
        ...newBaby
      };
      
      setBabyProfiles(prev => [...prev, baby]);
      setNewBaby({
        name: '',
        birthDate: '',
        gender: '',
        weight: '',
        height: '',
        allergies: '',
        notes: ''
      });
      setAddBabyDialogOpen(false);
      setSuccess('Baby profile added successfully!');
      
    } catch (err) {
      setError(err.message || 'Failed to add baby profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBaby = (babyId) => {
    setBabyProfiles(prev => prev.filter(baby => baby.id !== babyId));
    setSuccess('Baby profile deleted successfully!');
  };

  const handleSettingsChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    return ageInMonths;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Settings sx={{ mr: 2, color: 'primary.main' }} />
            Profile & Settings
          </Typography>
        </Box>
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

        <Grid container spacing={3}>
          {/* User Profile */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    User Profile
                  </Typography>
                  <IconButton
                    onClick={() => setEditingProfile(!editingProfile)}
                    color={editingProfile ? 'secondary' : 'primary'}
                  >
                    {editingProfile ? <Cancel /> : <Edit />}
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}
                    src={userProfile.avatar}
                  >
                    {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {userProfile.firstName} {userProfile.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Member since {new Date(userProfile.joinDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={userProfile.firstName}
                      onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
                      disabled={!editingProfile}
                      margin="normal"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={userProfile.lastName}
                      onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
                      disabled={!editingProfile}
                      margin="normal"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                      disabled={!editingProfile}
                      margin="normal"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                      disabled={!editingProfile}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
                
                {editingProfile && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleProfileSave}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Baby Profiles */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ChildCare sx={{ mr: 1, color: 'primary.main' }} />
                    Baby Profiles
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setAddBabyDialogOpen(true)}
                    size="small"
                  >
                    Add Baby
                  </Button>
                </Box>
                
                {babyProfiles.map((baby) => (
                  <Paper key={baby.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">{baby.name}</Typography>
                      <Box>
                        <IconButton size="small" onClick={() => setEditingBaby(baby.id)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteBaby(baby.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Age: {calculateAge(baby.birthDate)} months
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Gender: {baby.gender || 'Not specified'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Weight: {baby.weight || 'N/A'} lbs
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Height: {baby.height || 'N/A'} cm
                        </Typography>
                      </Grid>
                      {baby.allergies && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary">
                            Allergies: {baby.allergies}
                          </Typography>
                        </Grid>
                      )}
                      {baby.notes && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary">
                            Notes: {baby.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Settings */}
          <Grid size={{ xs: 12 }}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Settings sx={{ mr: 1, color: 'primary.main' }} />
                  Application Settings
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Appearance */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Palette sx={{ mr: 1 }} />
                        Appearance
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Palette />
                          </ListItemIcon>
                          <ListItemText primary="Dark Mode" secondary="Switch to dark theme" />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={settings.darkMode}
                              onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon>
                            <Language />
                          </ListItemIcon>
                          <ListItemText primary="Language" secondary="Select your preferred language" />
                          <ListItemSecondaryAction>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={settings.language}
                                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                              >
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="es">Spanish</MenuItem>
                                <MenuItem value="fr">French</MenuItem>
                                <MenuItem value="de">German</MenuItem>
                              </Select>
                            </FormControl>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                  
                  {/* Notifications */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Notifications sx={{ mr: 1 }} />
                        Notifications
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={settings.notifications.email}
                              onChange={(e) => handleSettingsChange('notifications', 'email', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText primary="Push Notifications" secondary="Receive push notifications" />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={settings.notifications.push}
                              onChange={(e) => handleSettingsChange('notifications', 'push', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText primary="Emotion Alerts" secondary="Get notified of significant emotion changes" />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={settings.notifications.emotionAlerts}
                              onChange={(e) => handleSettingsChange('notifications', 'emotionAlerts', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText primary="Weekly Reports" secondary="Receive weekly emotion summaries" />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={settings.notifications.weeklyReports}
                              onChange={(e) => handleSettingsChange('notifications', 'weeklyReports', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                  
                  {/* Privacy & Security */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Security sx={{ mr: 1 }} />
                        Privacy & Security
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Share Anonymous Data" secondary="Help improve the app" />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={settings.privacy.shareData}
                              onChange={(e) => handleSettingsChange('privacy', 'shareData', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText primary="Analytics" secondary="Allow usage analytics" />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={settings.privacy.analytics}
                              onChange={(e) => handleSettingsChange('privacy', 'analytics', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                  
                  {/* Account Actions */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} />
                        Account Actions
                      </Typography>
                      
                      <List dense>
                        <ListItem button onClick={() => setDeleteDialogOpen(true)}>
                          <ListItemIcon>
                            <Delete color="error" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Delete Account" 
                            secondary="Permanently delete your account and data"
                            primaryTypographyProps={{ color: 'error' }}
                          />
                        </ListItem>
                        
                        <ListItem button onClick={handleLogout}>
                          <ListItemIcon>
                            <Logout />
                          </ListItemIcon>
                          <ListItemText primary="Sign Out" secondary="Sign out of your account" />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Add Baby Dialog */}
      <Dialog open={addBabyDialogOpen} onClose={() => setAddBabyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Baby Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Baby's Name"
                value={newBaby.name}
                onChange={(e) => setNewBaby({ ...newBaby, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Birth Date"
                type="date"
                value={newBaby.birthDate}
                onChange={(e) => setNewBaby({ ...newBaby, birthDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={newBaby.gender}
                  label="Gender"
                  onChange={(e) => setNewBaby({ ...newBaby, gender: e.target.value })}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (lbs)"
                type="number"
                value={newBaby.weight}
                onChange={(e) => setNewBaby({ ...newBaby, weight: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allergies"
                value={newBaby.allergies}
                onChange={(e) => setNewBaby({ ...newBaby, allergies: e.target.value })}
                placeholder="None"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newBaby.notes}
                onChange={(e) => setNewBaby({ ...newBaby, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBabyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBaby} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Add Baby'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;