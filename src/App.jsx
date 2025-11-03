import React, { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import {
  PhotoCamera,
  CloudUpload,
  Save,
  Refresh
} from '@mui/icons-material';
import CardScanner from './components/CardScanner';
import ExtractedDataDisplay from './components/ExtractedDataDisplay';
import SheetsConfig from './components/SheetsConfig';
import OcrConfig from './components/OcrConfig';

function App() {
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sheetsConfig, setSheetsConfig] = useState({
    provider: 'google',
    spreadsheetId: '',
    credentials: null,
    accessToken: null
  });
  const [ocrConfig, setOcrConfig] = useState({
    visionApiKey: localStorage.getItem('visionApiKey') || ''
  });

  const handleDataExtracted = (data) => {
    setExtractedData(data);
  };

  const handleSaveToSheets = async () => {
    if (!extractedData || !sheetsConfig.spreadsheetId) {
      setSnackbar({
        open: true,
        message: 'Please configure Sheets and extract data first',
        severity: 'warning'
      });
      return;
    }

    const isGoogle = sheetsConfig.provider === 'google';
    if (isGoogle && !sheetsConfig.credentials) {
      setSnackbar({
        open: true,
        message: 'Please upload Google Service Account credentials',
        severity: 'warning'
      });
      return;
    }

    if (!isGoogle && !sheetsConfig.accessToken) {
      setSnackbar({
        open: true,
        message: 'Please enter Zoho Access Token',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      if (isGoogle) {
        const { saveToGoogleSheets } = await import('./services/sheetsService');
        await saveToGoogleSheets(extractedData, sheetsConfig);
        setSnackbar({
          open: true,
          message: 'Data saved to Google Sheets successfully!',
          severity: 'success'
        });
      } else {
        const { saveToZohoSheets } = await import('./services/zohoSheetsService');
        await saveToZohoSheets(extractedData, sheetsConfig);
        setSnackbar({
          open: true,
          message: 'Data saved to Zoho Sheets successfully!',
          severity: 'success'
        });
      }
      setExtractedData(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error saving to Sheets: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setExtractedData(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Card Reader
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* OCR Configuration */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <OcrConfig
                config={ocrConfig}
                onConfigChange={(config) => {
                  setOcrConfig(config);
                  localStorage.setItem('visionApiKey', config.visionApiKey || '');
                }}
              />
            </Paper>
          </Grid>

          {/* Sheets Configuration */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <SheetsConfig
                config={sheetsConfig}
                onConfigChange={setSheetsConfig}
              />
            </Paper>
          </Grid>

          {/* Card Scanner */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Scan Business Card
                </Typography>
                <CardScanner
                  onDataExtracted={handleDataExtracted}
                  onLoadingChange={setLoading}
                  ocrConfig={ocrConfig}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Extracted Data Display */}
          {extractedData && (
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Extracted Information
                    </Typography>
                    <Box>
                      <Button
                        startIcon={<Refresh />}
                        onClick={handleReset}
                        sx={{ mr: 1 }}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        onClick={handleSaveToSheets}
                        disabled={loading || !sheetsConfig.spreadsheetId || 
                                 (sheetsConfig.provider === 'google' && !sheetsConfig.credentials) ||
                                 (sheetsConfig.provider === 'zoho' && !sheetsConfig.accessToken)}
                      >
                        Save to {sheetsConfig.provider === 'google' ? 'Google' : 'Zoho'} Sheets
                      </Button>
                    </Box>
                  </Box>
                  <ExtractedDataDisplay data={extractedData} />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;

