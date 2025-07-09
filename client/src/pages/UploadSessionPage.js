import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Divider,
  IconButton
} from '@mui/material';
import {
  CloudUpload,
  VideoFile,
  Image,
  CheckCircle,
  Error,
  Psychology,
  AccessTime,
  Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Navigation from '../components/Navigation';

const UploadSessionPage = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'uploaded',
      progress: 0,
      results: null,
      error: null
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  });

  const processFile = async (fileItem) => {
    try {
      setProcessing(true);
      setError(null);
      
      // Update file status
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'processing', progress: 0 } : f
      ));

      const formData = new FormData();
      const isVideo = fileItem.file.type.startsWith('video/');
      const isImage = fileItem.file.type.startsWith('image/');
      
      if (isVideo) {
        formData.append('video', fileItem.file);
      } else if (isImage) {
        formData.append('image', fileItem.file);
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === fileItem.id && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 500);

      // Send to backend for processing
      const endpoint = isVideo ? '/api/process-video' : '/api/process-image';
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: percentCompleted } : f
          ));
        }
      });

      clearInterval(progressInterval);

      // Update with results
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileItem.id ? {
          ...f,
          status: 'completed',
          progress: 100,
          results: response.data
        } : f
      ));

      // Add to results for display
      setResults(prev => [...prev, {
        id: fileItem.id,
        fileName: fileItem.name,
        fileType: isVideo ? 'video' : 'image',
        ...response.data
      }]);

    } catch (err) {
      console.error('Error processing file:', err);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileItem.id ? {
          ...f,
          status: 'error',
          error: 'Failed to process file'
        } : f
      ));
      setError('Failed to process file. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const processAllFiles = async () => {
    const pendingFiles = uploadedFiles.filter(f => f.status === 'uploaded');
    for (const file of pendingFiles) {
      await processFile(file);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setResults(prev => prev.filter(r => r.id !== fileId));
  };

  const getStatusIcon = (status, fileType) => {
    switch (status) {
      case 'uploaded':
        return fileType?.startsWith('video/') ? <VideoFile color="primary" /> : <Image color="primary" />;
      case 'processing':
        return <AccessTime color="warning" />;
      case 'completed':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      default:
        return fileType?.startsWith('video/') ? <VideoFile /> : <Image />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded':
        return 'primary';
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUpload sx={{ mr: 2, color: 'primary.main' }} />
            Upload Media Session
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Upload Area */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CloudUpload sx={{ mr: 1, color: 'primary.main' }} />
              Upload Video & Image Files
            </Typography>
            
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                bgcolor: isDragActive ? 'primary.light' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.light'
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the files here...' : 'Drag & drop video or image files here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or click to select files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Videos: MP4, AVI, MOV, WMV, FLV, WebM<br/>
                Images: JPG, JPEG, PNG, GIF, BMP, WebP
              </Typography>
            </Paper>

            {uploadedFiles.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Uploaded Files ({uploadedFiles.length})
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={processAllFiles}
                    disabled={processing || uploadedFiles.every(f => f.status !== 'uploaded')}
                    startIcon={<Psychology />}
                  >
                    Process All Files
                  </Button>
                </Box>
                
                <List>
                  {uploadedFiles.map((file) => (
                    <ListItem key={file.id} sx={{ border: '1px solid #eee', borderRadius: 1, mb: 1 }}>
                      <ListItemIcon>
                        {getStatusIcon(file.status, file.file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{file.name}</Typography>
                            <Chip
                              label={file.status}
                              size="small"
                              color={getStatusColor(file.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Size: {formatFileSize(file.size)}
                            </Typography>
                            {file.status === 'processing' && (
                              <LinearProgress
                                variant="determinate"
                                value={file.progress}
                                sx={{ mt: 1 }}
                              />
                            )}
                            {file.error && (
                              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {file.error}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {file.status === 'uploaded' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => processFile(file)}
                            disabled={processing}
                            startIcon={<Psychology />}
                          >
                            Process
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => removeFile(file.id)}
                          disabled={processing && file.status === 'processing'}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                Processing Results
              </Typography>
              
              <Grid container spacing={3}>
                {results.map((result) => (
                  <Grid size={{ xs: 12, md: 6 }} key={result.id}>
                    <Paper elevation={1} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {result.fileName}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Processing Summary:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          File Type: {result.fileType === 'video' ? 'Video' : 'Image'}
                        </Typography>
                        {result.fileType === 'video' && (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Duration: {result.duration || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Frames Analyzed: {result.framesAnalyzed || 'N/A'}
                            </Typography>
                          </>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Processing Time: {result.processingTime || 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {result.fileType === 'video' ? 'Detected Emotions:' : 'Detected Emotion:'}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {result.fileType === 'video' ? (
                            result.emotions && result.emotions.map((emotion, index) => (
                              <Chip
                                key={index}
                                label={`${emotion.emotion} (${Math.round(emotion.confidence * 100)}%) at ${emotion.timestamp}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            result.emotion ? (
                              <Chip
                                label={`${result.emotion} (${Math.round(result.confidence * 100)}%)`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No emotion detected
                              </Typography>
                            )
                          )}
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {result.fileType === 'video' ? 'Dominant Emotion:' : 'Primary Emotion:'}
                        </Typography>
                        <Chip
                          label={result.fileType === 'video' ? (result.dominantEmotion || 'Unknown') : (result.emotion || 'Unknown')}
                          color="secondary"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card elevation={1} sx={{ mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Instructions:
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Upload video or image files of your baby</li>
                <li>Videos: MP4, AVI, MOV, WMV, FLV, WebM formats supported</li>
                <li>Images: JPG, JPEG, PNG, GIF, BMP, WebP formats supported</li>
                <li>Files will be processed using AI emotion detection</li>
                <li>Processing time depends on file size and type</li>
                <li>Results will show detected emotions with confidence scores</li>
                <li>You can upload multiple files and process them in batch</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default UploadSessionPage;