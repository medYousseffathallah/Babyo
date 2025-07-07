import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import LiveDetectionPage from './pages/LiveDetectionPage';
import DashboardPage from './pages/DashboardPage';
import UploadSessionPage from './pages/UploadSessionPage';
import ReportsPage from './pages/ReportsPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import PWATestPage from './pages/PWATestPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8AAAE5', // Baby Blue
      light: '#B8CCF0',
      dark: '#6B8DD6',
    },
    secondary: {
      main: '#F7CFE2', // Soft Pink
      light: '#FADDE8',
      dark: '#F4B8D4',
    },
    background: {
      default: '#FAFBFF',
      paper: '#FFFFFF',
    },
    info: {
      main: '#E8D5FF', // Lavender
      light: '#F0E6FF',
      dark: '#D4B8FF',
    },
    success: {
      main: '#A8E6CF', // Soft Green
    },
    warning: {
      main: '#FFE4B5', // Soft Orange
    },
    error: {
      main: '#FFB3BA', // Soft Red
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1.1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 16, // Rounded corners
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0, 0, 0, 0.08)',
    '0px 4px 16px rgba(0, 0, 0, 0.1)',
    '0px 8px 24px rgba(0, 0, 0, 0.12)',
    '0px 12px 32px rgba(0, 0, 0, 0.14)',
    '0px 16px 40px rgba(0, 0, 0, 0.16)',
    '0px 20px 48px rgba(0, 0, 0, 0.18)',
    '0px 24px 56px rgba(0, 0, 0, 0.2)',
    '0px 28px 64px rgba(0, 0, 0, 0.22)',
    '0px 32px 72px rgba(0, 0, 0, 0.24)',
    '0px 36px 80px rgba(0, 0, 0, 0.26)',
    '0px 40px 88px rgba(0, 0, 0, 0.28)',
    '0px 44px 96px rgba(0, 0, 0, 0.3)',
    '0px 48px 104px rgba(0, 0, 0, 0.32)',
    '0px 52px 112px rgba(0, 0, 0, 0.34)',
    '0px 56px 120px rgba(0, 0, 0, 0.36)',
    '0px 60px 128px rgba(0, 0, 0, 0.38)',
    '0px 64px 136px rgba(0, 0, 0, 0.4)',
    '0px 68px 144px rgba(0, 0, 0, 0.42)',
    '0px 72px 152px rgba(0, 0, 0, 0.44)',
    '0px 76px 160px rgba(0, 0, 0, 0.46)',
    '0px 80px 168px rgba(0, 0, 0, 0.48)',
    '0px 84px 176px rgba(0, 0, 0, 0.5)',
    '0px 88px 184px rgba(0, 0, 0, 0.52)',
    '0px 92px 192px rgba(0, 0, 0, 0.54)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '12px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/live" element={<LiveDetectionPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadSessionPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/pwa-test" element={<PWATestPage />} />
        </Routes>
        <PWAInstallPrompt />
        <OfflineIndicator />
      </Router>
    </ThemeProvider>
  );
}

export default App;
