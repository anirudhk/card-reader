import React, { useState } from 'react';
import {
  TextField,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip
} from '@mui/material';
import { Settings, AutoAwesome, Image } from '@mui/icons-material';

function OcrConfig({ config, onConfigChange }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [tabValue, setTabValue] = useState(localConfig.visionApiKey ? 0 : 1);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApiKeyChange = (event) => {
    const newConfig = {
      ...localConfig,
      visionApiKey: event.target.value
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Settings sx={{ mr: 1 }} />
        <Typography variant="h6">OCR Configuration</Typography>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<AutoAwesome />} iconPosition="start" label="AI-Powered (Google Vision)" />
          <Tab icon={<Image />} iconPosition="start" label="Offline (Tesseract)" />
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        // Google Vision API Configuration
        <Box>
          <TextField
            fullWidth
            label="Google Cloud Vision API Key"
            type="password"
            value={localConfig.visionApiKey || ''}
            onChange={handleApiKeyChange}
            placeholder="Enter your Google Vision API Key"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText="Get your API key from Google Cloud Console"
          />

          {localConfig.visionApiKey && (
            <Chip
              icon={<AutoAwesome />}
              label="AI-Powered OCR Enabled"
              color="success"
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}

          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              <strong>Why use Google Vision API?</strong>
            </Typography>
            <ul style={{ marginTop: 8, paddingLeft: 20, marginBottom: 8 }}>
              <li>🎯 <strong>95%+ accuracy</strong> vs 70-80% with Tesseract</li>
              <li>🚀 <strong>Faster processing</strong> - Results in 1-2 seconds</li>
              <li>📱 <strong>Better with mobile photos</strong> - Handles angles, lighting, blur</li>
              <li>🌐 <strong>Multi-language support</strong> - Detects language automatically</li>
            </ul>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>How to get your API Key:</strong>
            </Typography>
            <ol style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Create or select a project</li>
              <li>Enable <strong>Cloud Vision API</strong></li>
              <li>Go to <strong>APIs & Services → Credentials</strong></li>
              <li>Click <strong>Create Credentials → API Key</strong></li>
              <li>Copy and paste the API key above</li>
              <li>(Optional) Restrict the API key to Vision API for security</li>
            </ol>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              💡 <strong>Free tier:</strong> First 1,000 requests/month are free!
            </Typography>
          </Alert>
        </Box>
      ) : (
        // Tesseract (Offline) Configuration
        <Box>
          <Alert severity="info">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              <strong>Using Offline OCR (Tesseract.js)</strong>
            </Typography>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>✅ <strong>Works offline</strong> - No internet required</li>
              <li>✅ <strong>Completely free</strong> - No API keys needed</li>
              <li>✅ <strong>Privacy-first</strong> - All processing in browser</li>
              <li>⚠️ <strong>Lower accuracy</strong> - ~70-80% accuracy</li>
              <li>⏱️ <strong>Slower</strong> - Takes 5-15 seconds to process</li>
            </ul>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Tips for best results:</strong>
            </Typography>
            <ul style={{ marginTop: 4, paddingLeft: 20 }}>
              <li>Take photos in good lighting</li>
              <li>Hold camera steady and ensure text is in focus</li>
              <li>Keep the card flat and parallel to camera</li>
              <li>Clean camera lens before taking photo</li>
            </ul>
          </Alert>
        </Box>
      )}
    </Box>
  );
}

export default OcrConfig;

