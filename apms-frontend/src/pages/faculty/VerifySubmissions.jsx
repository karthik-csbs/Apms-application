import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DataTable from '../../components/DataTable';

const VerifySubmissions = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [action, setAction] = useState(''); // 'approve' or 'reject'
  const [comments, setComments] = useState('');

  const handleAction = (submission, act) => {
    setSelectedSubmission(submission);
    setAction(act);
    setOpenDialog(true);
  };

  const handleConfirm = () => {
    console.log(`Action: ${action} for submission ID: ${selectedSubmission?.id} with comments: ${comments}`);
    // TODO: Integrate API
    setOpenDialog(false);
    setComments('');
  };

  const columns = [
    { id: 'projectTitle', label: 'Project Title', minWidth: 200 },
    { id: 'studentName', label: 'Student', minWidth: 150 },
    { 
      id: 'links', 
      label: 'Submissions', 
      minWidth: 200,
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" href={row.githubLink} target="_blank">GitHub</Button>
          <Button size="small" href={row.driveLink} target="_blank">Drive</Button>
        </Box>
      )
    },
    { id: 'status', label: 'Status', minWidth: 120, render: (value) => <Chip label={value} color="warning" size="small" /> },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" color="success" variant="contained" onClick={() => handleAction(row, 'approve')}><CheckCircleIcon fontSize="small" sx={{ mr: 1 }}/> Approve</Button>
          <Button size="small" color="error" variant="contained" onClick={() => handleAction(row, 'reject')}><CancelIcon fontSize="small" sx={{ mr: 1 }}/> Reject</Button>
        </Box>
      ),
    },
  ];

  const rows = [
    { id: 1, projectTitle: 'AI based Disease Prediction', studentName: 'John Doe', githubLink: '#', driveLink: '#', status: 'Pending Review' },
    { id: 2, projectTitle: 'Smart Home IoT', studentName: 'Bob Wilson', githubLink: '#', driveLink: '#', status: 'Pending Review' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Verify Submissions</Typography>
      
      <Paper sx={{ p: 3 }}>
        <DataTable
          columns={columns}
          data={rows}
          totalCount={rows.length}
          page={0}
          rowsPerPage={10}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          orderBy="projectTitle"
          orderDirection="asc"
          onSort={() => {}}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {action === 'approve' ? 'Approve Completion Request' : 'Reject Completion Request'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            You are about to {action} the project <strong>{selectedSubmission?.projectTitle}</strong> submitted by {selectedSubmission?.studentName}.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Faculty Comments (Optional for Approval, Required for Rejection)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirm} color={action === 'approve' ? 'success' : 'error'} variant="contained">
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerifySubmissions;
