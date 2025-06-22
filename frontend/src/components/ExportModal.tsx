import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box
} from '@mui/material';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: string, filename: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, onExport }) => {
  const [format, setFormat] = useState('pdf');
  const [filename, setFilename] = useState('growth-metrics-report');

  const handleExport = () => {
    onExport(format, filename);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Data</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={format}
              label="Format"
              onChange={(e) => setFormat(e.target.value as string)}
            >
              <MenuItem value="pdf">PDF Report</MenuItem>
              <MenuItem value="csv">CSV Data</MenuItem>
              <MenuItem value="excel">Excel Spreadsheet</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            helperText="Enter desired filename (without extension)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport} variant="contained" color="primary">
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
