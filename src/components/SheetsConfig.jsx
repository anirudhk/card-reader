import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip
} from '@mui/material';
import { Settings, CheckCircle } from '@mui/icons-material';

function SheetsConfig({ config, onConfigChange }) {
  const [localConfig, setLocalConfig] = useState({
    provider: 'google',
    ...config
  });
  const [credentialsFile, setCredentialsFile] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [idExtracted, setIdExtracted] = useState(false);

  useEffect(() => {
    if (config.provider) {
      setTabValue(config.provider === 'google' ? 0 : 1);
    }
  }, [config.provider]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const provider = newValue === 0 ? 'google' : 'zoho';
    const newConfig = {
      ...localConfig,
      provider,
      // Clear provider-specific configs when switching
      spreadsheetId: '',
      credentials: provider === 'google' ? localConfig.credentials : null,
      accessToken: provider === 'zoho' ? localConfig.accessToken : null,
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
    setCredentialsFile(null);
    setIdExtracted(false);
  };

  // Extract Google Sheets ID from URL
  const extractGoogleSheetId = (input) => {
    // Pattern: https://docs.google.com/spreadsheets/d/{ID}/edit
    const googlePattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = input.match(googlePattern);
    if (match) {
      return match[1];
    }
    // If no pattern match, assume it's already an ID
    return input;
  };

  // Extract Zoho Workbook ID from URL
  const extractZohoWorkbookId = (input) => {
    // Pattern: https://sheet.zoho.com/sheet/{ID} or https://sheet.zoho.com/{ID}
    const zohoPattern = /sheet\.zoho\.com\/sheet\/([a-zA-Z0-9-_]+)|sheet\.zoho\.com\/([a-zA-Z0-9-_]+)/;
    const match = input.match(zohoPattern);
    if (match) {
      return match[1] || match[2];
    }
    // If no pattern match, assume it's already an ID
    return input;
  };

  const handleSpreadsheetIdChange = (event) => {
    const input = event.target.value;
    let extractedId = input;
    let wasExtracted = false;
    
    // Try to extract ID from URL if it looks like a URL
    if (input.includes('http') || input.includes('docs.google.com') || input.includes('sheet.zoho.com')) {
      if (tabValue === 0) {
        // Google Sheets
        const extracted = extractGoogleSheetId(input);
        if (extracted !== input && extracted.length > 0) {
          extractedId = extracted;
          wasExtracted = true;
        }
      } else {
        // Zoho Sheets
        const extracted = extractZohoWorkbookId(input);
        if (extracted !== input && extracted.length > 0) {
          extractedId = extracted;
          wasExtracted = true;
        }
      }
    }

    setIdExtracted(wasExtracted);

    const newConfig = {
      ...localConfig,
      spreadsheetId: extractedId
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleCredentialsFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const credentials = JSON.parse(reader.result);
          const newConfig = {
            ...localConfig,
            credentials
          };
          setLocalConfig(newConfig);
          onConfigChange(newConfig);
          setCredentialsFile(file.name);
        } catch (error) {
          alert('Invalid JSON file. Please upload a valid Service Account credentials file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAccessTokenChange = (event) => {
    const newConfig = {
      ...localConfig,
      accessToken: event.target.value
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Settings sx={{ mr: 1 }} />
        <Typography variant="h6">Sheets Configuration</Typography>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Google Sheets" />
          <Tab label="Zoho Sheets" />
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        // Google Sheets Configuration
        <Box>
          <TextField
            fullWidth
            label="Spreadsheet ID or Link"
            value={localConfig.spreadsheetId || ''}
            onChange={handleSpreadsheetIdChange}
            placeholder="Paste spreadsheet link or ID: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Paste the full Google Sheets link or just the Spreadsheet ID</span>
                {idExtracted && (
                  <Chip
                    icon={<CheckCircle />}
                    label="ID extracted"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            }
          />

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload Service Account Credentials (JSON)
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleCredentialsFileChange}
              />
            </Button>
            {credentialsFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selected: {credentialsFile}
              </Typography>
            )}
          </Box>

          <Alert severity="info">
            To get started with Google Sheets:
            <ol style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Create a Google Cloud Project and enable Google Sheets API</li>
              <li>Create a Service Account and download the credentials JSON file</li>
              <li>Share your Google Sheet with the service account email</li>
              <li>Upload the credentials file and paste your Spreadsheet link or ID</li>
            </ol>
          </Alert>
        </Box>
      ) : (
        // Zoho Sheets Configuration
        <Box>
          <TextField
            fullWidth
            label="Workbook ID or Link"
            value={localConfig.spreadsheetId || ''}
            onChange={handleSpreadsheetIdChange}
            placeholder="Paste workbook link or ID: https://sheet.zoho.com/sheet/WORKBOOK_ID"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Paste the full Zoho Sheets link or just the Workbook ID</span>
                {idExtracted && (
                  <Chip
                    icon={<CheckCircle />}
                    label="ID extracted"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            }
          />

          <TextField
            fullWidth
            label="Access Token"
            type="password"
            value={localConfig.accessToken || ''}
            onChange={handleAccessTokenChange}
            placeholder="Enter your Zoho OAuth Access Token"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText="Generate an OAuth access token with Sheets API permissions"
          />

          <Alert severity="info">
            To get started with Zoho Sheets:
            <ol style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Go to <a href="https://api-console.zoho.com/" target="_blank" rel="noopener noreferrer">Zoho API Console</a> and create a new application</li>
              <li>Generate OAuth credentials (Client ID and Client Secret)</li>
              <li>Generate an Access Token with ZohoSheet scope (Read/Write)</li>
              <li>Paste your Workbook link or ID and Access Token above</li>
              <li>Alternatively, use Self Client for server-to-server authentication</li>
            </ol>
            <Box sx={{ mt: 1 }}>
              <strong>Quick Token Generation:</strong>
              <ol style={{ marginTop: 4, paddingLeft: 20 }}>
                <li>Visit: <code>https://accounts.zoho.com/oauth/v2/auth?scope=ZohoSheet.workbooks.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=YOUR_REDIRECT_URI</code></li>
                <li>Authorize and get the authorization code</li>
                <li>Exchange the code for an access token via POST to <code>https://accounts.zoho.com/oauth/v2/token</code></li>
              </ol>
            </Box>
          </Alert>
        </Box>
      )}
    </Box>
  );
}

export default SheetsConfig;
