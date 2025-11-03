import React from 'react';
import { Grid, TextField, Box } from '@mui/material';

function ExtractedDataDisplay({ data }) {
  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'company', label: 'Company' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'website', label: 'Website' },
    { key: 'address', label: 'Address' },
  ];

  return (
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid item xs={12} sm={6} key={field.key}>
          <TextField
            fullWidth
            label={field.label}
            value={data[field.key] || ''}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
            sx={{
              '& .MuiInputBase-input': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </Grid>
      ))}
      {data.rawText && (
        <Grid item xs={12}>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <strong>Raw Extracted Text:</strong>
            <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
              {data.rawText}
            </pre>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default ExtractedDataDisplay;

