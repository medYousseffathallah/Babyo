import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  Psychology,
  Timeline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [emotionFilter, setEmotionFilter] = useState('all');

  const emotionColors = {
    happy: '#4CAF50',
    sad: '#2196F3',
    angry: '#F44336',
    normal: '#FF9800',
    surprised: '#9C27B0',
    fearful: '#795548'
  };

  useEffect(() => {
    fetchEmotions();
  }, [timeFilter, emotionFilter]);

  const fetchEmotions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/emotions');
      let data = response.data;

      // Apply time filter
      const now = new Date();
      const filterDate = new Date();
      switch (timeFilter) {
        case '1d':
          filterDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        default:
          filterDate.setFullYear(now.getFullYear() - 1);
      }

      data = data.filter(emotion => new Date(emotion.timestamp) >= filterDate);

      // Apply emotion filter
      if (emotionFilter !== 'all') {
        data = data.filter(emotion => emotion.emotion === emotionFilter);
      }

      setEmotions(data);
    } catch (err) {
      console.error('Error fetching emotions:', err);
      setError('Failed to load emotion data');
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const getEmotionDistribution = () => {
    const distribution = {};
    emotions.forEach(emotion => {
      distribution[emotion.emotion] = (distribution[emotion.emotion] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: emotionColors[emotion] || '#999'
    }));
  };

  const getEmotionTimeline = () => {
    const timeline = {};
    emotions.forEach(emotion => {
      const date = new Date(emotion.timestamp).toLocaleDateString();
      if (!timeline[date]) {
        timeline[date] = { date, happy: 0, sad: 0, angry: 0, normal: 0, total: 0 };
      }
      timeline[date][emotion.emotion] = (timeline[date][emotion.emotion] || 0) + 1;
      timeline[date].total += 1;
    });
    
    return Object.values(timeline).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getHourlyDistribution = () => {
    const hourly = {};
    emotions.forEach(emotion => {
      const hour = new Date(emotion.timestamp).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });
    
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      count: hourly[hour] || 0
    }));
  };

  const getEmotionStats = () => {
    const total = emotions.length;
    const distribution = getEmotionDistribution();
    const dominant = distribution.reduce((max, current) => 
      current.value > max.value ? current : max, { name: 'none', value: 0 }
    );
    
    const avgConfidence = emotions.reduce((sum, emotion) => sum + emotion.confidence, 0) / total;
    
    return {
      total,
      dominant: dominant.name,
      avgConfidence: avgConfidence || 0,
      uniqueDays: new Set(emotions.map(e => new Date(e.timestamp).toDateString())).size
    };
  };

  const stats = getEmotionStats();
  const pieData = getEmotionDistribution();
  const timelineData = getEmotionTimeline();
  const hourlyData = getHourlyDistribution();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Dashboard sx={{ mr: 2, color: 'primary.main' }} />
            Emotion Dashboard
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timeFilter}
                  label="Time Period"
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <MenuItem value="1d">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Emotion</InputLabel>
                <Select
                  value={emotionFilter}
                  label="Emotion"
                  onChange={(e) => setEmotionFilter(e.target.value)}
                >
                  <MenuItem value="all">All Emotions</MenuItem>
                  <MenuItem value="happy">Happy</MenuItem>
                  <MenuItem value="sad">Sad</MenuItem>
                  <MenuItem value="angry">Angry</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Detections
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Dominant Emotion
                </Typography>
                <Typography variant="h4" component="div" sx={{ textTransform: 'capitalize' }}>
                  {stats.dominant}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Avg Confidence
                </Typography>
                <Typography variant="h4" component="div">
                  {Math.round(stats.avgConfidence * 100)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Active Days
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.uniqueDays}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Emotion Distribution Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Psychology sx={{ mr: 1 }} />
                  Emotion Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Emotion Timeline */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ mr: 1 }} />
                  Emotion Timeline
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="happy" stroke={emotionColors.happy} strokeWidth={2} />
                    <Line type="monotone" dataKey="sad" stroke={emotionColors.sad} strokeWidth={2} />
                    <Line type="monotone" dataKey="angry" stroke={emotionColors.angry} strokeWidth={2} />
                    <Line type="monotone" dataKey="normal" stroke={emotionColors.normal} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Hourly Distribution */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  Hourly Activity Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {emotions.slice(0, 10).map((emotion, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: index < 9 ? '1px solid #eee' : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={emotion.emotion}
                    size="small"
                    sx={{ bgcolor: emotionColors[emotion.emotion], color: 'white' }}
                  />
                  <Typography variant="body2">
                    Confidence: {Math.round(emotion.confidence * 100)}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {new Date(emotion.timestamp).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default DashboardPage;