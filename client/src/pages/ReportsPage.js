import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Assessment,
  Download,
  ExpandMore,
  Schedule,
  Psychology,
  TrendingUp,
  Print,
  Share
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [expandedSession, setExpandedSession] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [dateFilter, emotionFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/sessions');
      let data = response.data;

      // Apply filters
      if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        data = data.filter(session => 
          new Date(session.startTime).toDateString() === filterDate
        );
      }

      if (emotionFilter !== 'all') {
        data = data.filter(session => 
          session.dominantEmotion === emotionFilter
        );
      }

      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      // Mock data for demonstration
      const mockSessions = generateMockSessions();
      setSessions(mockSessions);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSessions = () => {
    const emotions = ['happy', 'cry', 'sleepy', 'normal'];
    const sessions = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + Math.random() * 60 * 60 * 1000);
      const dominantEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      const emotionCounts = {};
      emotions.forEach(emotion => {
        emotionCounts[emotion] = Math.floor(Math.random() * 20);
      });
      emotionCounts[dominantEmotion] += 10;
      
      sessions.push({
        id: `session_${i + 1}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: Math.floor((endTime - startTime) / 1000 / 60), // minutes
        dominantEmotion,
        emotionCounts,
        totalDetections: Object.values(emotionCounts).reduce((a, b) => a + b, 0),
        avgConfidence: 0.7 + Math.random() * 0.3,
        notes: `Session ${i + 1} - ${dominantEmotion} dominant`,
        detections: generateMockDetections(emotionCounts)
      });
    }
    
    return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  };

  const generateMockDetections = (emotionCounts) => {
    const detections = [];
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      for (let i = 0; i < count; i++) {
        detections.push({
          id: `detection_${detections.length + 1}`,
          emotion,
          confidence: 0.6 + Math.random() * 0.4,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });
    return detections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const generatePDFReport = async (session) => {
    try {
      setGeneratingReport(true);
      
      // Mock PDF generation - in real app, this would call backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple text report for download
      const reportContent = `
BABY EMOTION DETECTION REPORT
=============================

Session ID: ${session.id}
Date: ${new Date(session.startTime).toLocaleDateString()}
Start Time: ${new Date(session.startTime).toLocaleTimeString()}
End Time: ${new Date(session.endTime).toLocaleTimeString()}
Duration: ${session.duration} minutes

EMOTION SUMMARY
===============
Dominant Emotion: ${session.dominantEmotion.toUpperCase()}
Total Detections: ${session.totalDetections}
Average Confidence: ${Math.round(session.avgConfidence * 100)}%

EMOTION BREAKDOWN
=================
${Object.entries(session.emotionCounts).map(([emotion, count]) => 
  `${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${count} detections`
).join('\n')}

NOTES
=====
${session.notes}

DISCLAIMER
==========
This report is generated by an AI emotion detection system and should not be used as a medical diagnosis. Please consult with healthcare professionals for any medical concerns.

Generated on: ${new Date().toLocaleString()}
      `;
      
      // Download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emotion_report_${session.id}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'success',
      cry: 'info',
      sleepy: 'error',
      normal: 'warning'
    };
    return colors[emotion] || 'default';
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
              <Assessment sx={{ mr: 2, color: 'primary.main' }} />
              Reports & Logs
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Filter by Date"
                  value={dateFilter}
                  onChange={(newValue) => setDateFilter(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Dominant Emotion</InputLabel>
                  <Select
                    value={emotionFilter}
                    label="Dominant Emotion"
                    onChange={(e) => setEmotionFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Emotions</MenuItem>
                    <MenuItem value="happy">Happy</MenuItem>
                    <MenuItem value="cry">Cry</MenuItem>
                    <MenuItem value="sleepy">Sleepy</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setDateFilter(null);
                    setEmotionFilter('all');
                  }}
                  sx={{ height: '56px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Sessions Overview */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                Session Logs ({sessions.length})
              </Typography>
              
              {sessions.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No sessions found for the selected filters.
                </Typography>
              ) : (
                <Box>
                  {sessions.map((session) => (
                    <Accordion
                      key={session.id}
                      expanded={expandedSession === session.id}
                      onChange={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />} component="div">
                        <Grid container alignItems="center" spacing={2}>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {new Date(session.startTime).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Duration
                            </Typography>
                            <Typography variant="body1">
                              {formatDuration(session.duration)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Dominant Emotion
                            </Typography>
                            <Chip
                              label={session.dominantEmotion}
                              color={getEmotionColor(session.dominantEmotion)}
                              size="small"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Detections
                            </Typography>
                            <Typography variant="body1">
                              {session.totalDetections}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Avg Confidence
                                </Typography>
                                <Typography variant="body1">
                                  {Math.round(session.avgConfidence * 100)}%
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  generatePDFReport(session);
                                }}
                                disabled={generatingReport}
                                sx={{ ml: 1 }}
                              >
                                PDF
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          {/* Emotion Breakdown */}
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="h6" gutterBottom>
                              Emotion Breakdown
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Emotion</TableCell>
                                    <TableCell align="right">Count</TableCell>
                                    <TableCell align="right">Percentage</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(session.emotionCounts).map(([emotion, count]) => (
                                    <TableRow key={emotion}>
                                      <TableCell>
                                        <Chip
                                          label={emotion}
                                          color={getEmotionColor(emotion)}
                                          size="small"
                                        />
                                      </TableCell>
                                      <TableCell align="right">{count}</TableCell>
                                      <TableCell align="right">
                                        {Math.round((count / session.totalDetections) * 100)}%
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                          
                          {/* Recent Detections */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                              Recent Detections
                            </Typography>
                            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                              <List dense>
                                {session.detections.slice(0, 10).map((detection, index) => (
                                  <React.Fragment key={detection.id}>
                                    <ListItem>
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                              label={detection.emotion}
                                              color={getEmotionColor(detection.emotion)}
                                              size="small"
                                            />
                                            <Typography variant="body2">
                                              {Math.round(detection.confidence * 100)}%
                                            </Typography>
                                          </Box>
                                        }
                                        secondary={new Date(detection.timestamp).toLocaleString()}
                                      />
                                    </ListItem>
                                    {index < Math.min(session.detections.length - 1, 9) && <Divider />}
                                  </React.Fragment>
                                ))}
                              </List>
                            </Paper>
                          </Grid>
                          
                          {/* Session Notes */}
                          <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                              Session Notes
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="body2">
                                {session.notes || 'No notes available for this session.'}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          {/* Actions */}
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                              <Button
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={() => window.print()}
                              >
                                Print
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<Share />}
                              >
                                Share
                              </Button>
                              <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={() => generatePDFReport(session)}
                                disabled={generatingReport}
                              >
                                {generatingReport ? 'Generating...' : 'Download Report'}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card elevation={1} sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Features:
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {[
            'View detailed session logs',
            'Filter by date range',
            'Download PDF reports',
            'Track emotion patterns',
            'Export CSV data'
          ].map((feature, index) => (
            <li key={`report-feature-${index}`}>{feature}</li>
          ))}
                  {[
                    'View detailed session logs with emotion breakdowns',
                    'Filter sessions by date and dominant emotion',
                    'Download PDF reports for healthcare providers',
                    'Track emotion patterns over time',
                    'Export data for further analysis'
                  ].map((feature, index) => (
                    <li key={`detailed-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportsPage;