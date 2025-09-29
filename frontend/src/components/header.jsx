import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { SUPPORTED_LANGUAGES, LANGUAGE_VERSIONS, FILE_EXTENSIONS, COMMENT_SYNTAX } from '../services/constants.js';
import Particles from './styles/particles.jsx';
import BrandHeader from './styles/brandheader.jsx';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://codehiveng.vercel.app'
  : 'http://localhost:5000';

const EditorHeader = ({ language, onLanguageChange, roomId, roomName, code }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Check if current user is room owner
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.user && userData.user.id && roomId) {
      // Fetch room details to check owner
      fetch(`${API_URL}/api/rooms/${roomId}/details`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      })
        .then(res => res.json())
        .then(data => {
          // --- IGNORE ---
          if (data.room && data.room.createdBy._id === userData.user.id) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        });
    }
  }, [roomId]);

  const handleBrandClick = () => {
    setIsAboutOpen(true);
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  const handleDownloadClick = () => {
    setOpenDialog(true);
  };

  const handleDownload = () => {
    if (!fileName) return;
    const commentSyntax = COMMENT_SYNTAX[language];
    const websiteComment = `${commentSyntax} Coded on https://codehiveng.vercel.app\n\n`;
    const fileContent = websiteComment + code;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${FILE_EXTENSIONS[language]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setOpenDialog(false);
    setFileName('');
  };

  const handleBellClick = async () => {
    // Fetch pending requests
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.token) return;
    try {
      const res = await fetch(`${API_URL}/api/rooms/${roomId}/pending-requests`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      const data = await res.json();
      setPendingRequests(data.requests || []);
      setPendingDialogOpen(true);
    } catch (err) {
      setPendingRequests([]);
      setPendingDialogOpen(true);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.token) return;
    await fetch(`${API_URL}/api/rooms/join-request/${requestId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userData.token}` }
    });
    // Refresh list
    handleBellClick();
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(15, 15, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 255, 149, 0.2)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
          left: 0,
          right: 0,
          overflow: 'hidden'
        }}
      >
        <Particles />
        <Toolbar sx={{ justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <BrandHeader 
            variant="h6" 
            onClick={handleBrandClick}
            sx={{ flexBasis: '200px' }}
          />

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 2
          }}>
            <Select
              value={language}
              onChange={onLanguageChange}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'rgba(15, 15, 26, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 255, 149, 0.2)',
                    '& .MuiMenuItem-root': {
                      color: '#00ff95',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 149, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 255, 149, 0.2)',
                      },
                    },
                  },
                },
              }}
              sx={{
                minWidth: 250,
                background: 'rgba(0, 255, 149, 0.1)',
                border: '1px solid rgba(0, 255, 149, 0.3)',
                color: '#00ff95',
                '& .MuiSelect-icon': {
                  color: '#00ff95'
                }
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                    <Typography variant="caption" sx={{ opacity: 0.7, ml: 2 }}>
                      v{LANGUAGE_VERSIONS[lang]}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            flexBasis: '200px',
            justifyContent: 'flex-end'
          }}>
            <Tooltip title="Download Code">
              <IconButton 
                onClick={handleDownloadClick}
                sx={{ 
                  color: '#00ff95',
                  '&:hover': {
                    background: 'rgba(0, 255, 149, 0.1)'
                  }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            {isOwner && (
              <Tooltip title="Pending Join Requests">
                <IconButton
                  onClick={handleBellClick}
                  sx={{ color: '#00ff95' }}
                >
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            )}

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              color: '#00ff95' 
            }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Room:
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {roomName || 'Loading...'}
              </Typography>
              <Tooltip title="Copy Room ID">
                <IconButton 
                  onClick={handleCopyRoomId}
                  sx={{ 
                    color: '#00ff95',
                    '&:hover': {
                      background: 'rgba(0, 255, 149, 0.1)'
                    }
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{ 
          sx: { 
            background: 'rgba(15, 15, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 149, 0.2)',
            color: '#00ff95'
          } 
        }}
      >
        <DialogTitle>Download Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#00ff95',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 149, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 149, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 255, 149, 0.7)',
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(0, 255, 149, 0.7)' }}>
            File will be saved as: {fileName}.{FILE_EXTENSIONS[language]}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ color: '#00ff95' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDownload}
            sx={{ color: '#00ff95' }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pending Join Requests Dialog */}
      <Dialog
        open={pendingDialogOpen}
        onClose={() => setPendingDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(15, 15, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 149, 0.2)',
            color: '#00ff95'
          }
        }}
      >
        <DialogTitle>Pending Join Requests</DialogTitle>
        <DialogContent>
          {pendingRequests.length === 0 ? (
            <Typography>No pending requests.</Typography>
          ) : (
            <List>
              {pendingRequests.map(req => (
                <ListItem key={req._id} secondaryAction={
                  <Button sx={{ color: '#00ff95' }} onClick={() => handleAcceptRequest(req._id)}>Accept</Button>
                }>
                  <ListItemText  primary={req.requesterId.username} secondary={req.requesterId.email} primaryTypographyProps={{ sx: { color: '#00ff95' } }}
  secondaryTypographyProps={{ sx: { color: '#00ff95' } }}/>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDialogOpen(false)} sx={{ color: '#00ff95' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(15, 15, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 149, 0.2)',
            borderRadius: '12px',
            color: '#00ff95'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 255, 149, 0.2)' }}>
          About codingSphere
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography paragraph>
            codingSphere is a real-time collaborative coding platform that enables developers to code together, share ideas, and learn from each other in a seamless environment.
          </Typography>
          <Typography paragraph>
            Features:
            • Real-time code collaboration
            • Multiple programming language support
            • Integrated chat system
            • Code execution capabilities
            • Easy room sharing
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(0, 255, 149, 0.2)', p: 2 }}>
          <Button 
            onClick={() => setIsAboutOpen(false)}
            sx={{
              color: '#00ff95',
              border: '1px solid rgba(0, 255, 149, 0.5)',
              '&:hover': {
                background: 'rgba(0, 255, 149, 0.1)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditorHeader;
