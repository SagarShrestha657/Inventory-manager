import React, { useState, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import API_BASE_URL from '../../config';

interface BulkAddProductsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const requiredHeaders = ['name', 'sku', 'price', 'buyingPrice', 'quantity', 'category'];

const API_URL = `${API_BASE_URL}/inventory`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

const BulkAddProductsModal: React.FC<BulkAddProductsModalProps> = ({ open, onClose, onSuccess, onError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      onError('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/bulk-upload`, formData, getAuthHeaders());
      onSuccess(response.data.message || 'Products added successfully!');
      onClose();
    } catch (err: any) {
      onError(err.response?.data?.message || 'Error uploading file.');
    } finally {
      setIsLoading(false);
      setFile(null); // Clear selected file after upload attempt
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Bulk Add Products via Excel/CSV</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Upload an Excel (.xlsx, .xls) or CSV (.csv) file with the following columns to add products in bulk and you can have description column it is optional.
            The column headers in your file must exactly match these names, but the order does not matter.
          </Typography>
        </Alert>

        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>Required Columns:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {requiredHeaders.map(header => (
              <Chip key={header} label={header} color="primary" variant="outlined" />
            ))}
          </Box>
          <Typography component="div" variant="body2">
            <strong>Important Notes:</strong>
            <ul>
              <li>Each product must have a unique <strong>sku</strong>.</li>
              <li>Values for <strong>price</strong>, <strong>buyingPrice</strong>, and <strong>quantity</strong> must not be negative.</li>
            </ul>
          </Typography>
        </Box>

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed grey',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'transparent',
            transition: 'background-color 0.2s ease-in-out',
            mt: 2,
          }}
        >
          <input {...getInputProps()} />
          <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          {file ? (
            <Typography variant="h6" color="text.secondary">Selected: {file.name}</Typography>
          ) : (
            <Typography color="text.secondary">
              {isDragActive ? 'Drop the file here ...' : 'Drag & drop a file here, or click to select a file'}
            </Typography>
          )}
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleUpload} color="primary" variant="contained" disabled={!file || isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Upload and Add Products'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAddProductsModal;