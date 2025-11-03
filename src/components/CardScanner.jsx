import React, { useRef, useState } from 'react';
import { Button, Box, Typography, Card, CardMedia } from '@mui/material';
import { PhotoCamera, CloudUpload } from '@mui/icons-material';
import { extractCardData } from '../services/ocrService';

function CardScanner({ onDataExtracted, onLoadingChange }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = async (file) => {
    setProcessing(true);
    onLoadingChange(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const extractedData = await extractCardData(file);
      onDataExtracted(extractedData);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setProcessing(false);
      onLoadingChange(false);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<PhotoCamera />}
          onClick={handleCameraClick}
          disabled={processing}
          size="large"
        >
          Take Photo
        </Button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Button
          variant="outlined"
          startIcon={<CloudUpload />}
          onClick={handleFileClick}
          disabled={processing}
          size="large"
        >
          Upload Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </Box>

      {preview && (
        <Card sx={{ mb: 2 }}>
          <CardMedia
            component="img"
            image={preview}
            alt="Business card preview"
            sx={{ maxHeight: 400, objectFit: 'contain' }}
          />
        </Card>
      )}

      {processing && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Processing image... This may take a few seconds.
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        📸 Take a clear photo of the business card or upload an image file.
        Ensure good lighting and focus for best results.
      </Typography>
    </Box>
  );
}

export default CardScanner;

