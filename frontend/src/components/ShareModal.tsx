import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon
} from '@mui/icons-material';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onShare: (platform: string) => void;
  currentUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, onShare, currentUrl }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    onShare(platform);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Dashboard</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Share via:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => handleShare('twitter')}
            >
              Twitter
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => handleShare('linkedin')}
            >
              LinkedIn
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => handleShare('whatsapp')}
            >
              WhatsApp
            </Button>
          </Box>

          <TextField
            fullWidth
            label="Share Link"
            value={currentUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <>
                  <Tooltip title="Copy Link">
                    <IconButton onClick={handleCopy}>
                      <CopyIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open in New Tab">
                    <IconButton onClick={() => window.open(currentUrl, '_blank')}>
                      <OpenIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                </>
              ),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal;
