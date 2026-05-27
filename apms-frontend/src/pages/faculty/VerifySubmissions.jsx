import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DataTable from '../../components/DataTable';
import { projectService } from '../../services/projectService';
import { facultyService } from '../../services/facultyService';

const VerifySubmissions = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [action, setAction] = useState(''); // 'approve' or 'reject'
  const [comments, setComments] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const projectData = await facultyService.getProjects();
      const projectList = projectData?.data || projectData || [];
      
      // Filter for projects pending completion approval
      const pendingProjects = projectList.filter(p => p.completionStatus === 'PENDING_APPROVAL');
      
      const rows = pendingProjects.map(p => {
        const leadMember = p.teamMembers?.find(m => m.role === 'TEAM_LEAD' || m.isTeamLead || m.teamLead);
        const firstMember = p.teamMembers?.[0];
        const studentName = leadMember?.studentName || firstMember?.studentName || 'Student Team';
        
        return {
          id: p.id,
          projectTitle: p.title,
          studentName: studentName,
          githubLink: p.githubUrl || '#',
          driveLink: p.driveUrl || p.documentUrl || '#',
          status: 'Pending Review'
        };
      });

      setSubmissions(rows);
    } catch (err) {
      console.error('Failed to load pending submissions', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (submission, act) => {
    setSelectedSubmission(submission);
    setAction(act);
    setOpenDialog(true);
  };

  const handleConfirm = async () => {
    if (action === 'reject' && !comments.trim()) {
      setAlert({ show: true, message: 'Comments are required for rejection.', severity: 'error' });
      return;
    }

    try {
      setSubmittingAction(true);
      if (action === 'approve') {
        await projectService.approveCompletion(selectedSubmission.id, comments);
        setAlert({ show: true, message: 'Project completion approved successfully!', severity: 'success' });
      } else {
        await projectService.rejectCompletion(selectedSubmission.id, comments);
        setAlert({ show: true, message: 'Project completion request rejected.', severity: 'info' });
      }
      setOpenDialog(false);
      setComments('');
      await fetchSubmissions(); // reload list
    } catch (err) {
      console.error(`Failed to ${action} submission`, err);
      const errMsg = err.response?.data?.message || `Failed to perform ${action} action.`;
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setSubmittingAction(false);
    }
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
          <Button size="small" href={row.githubLink} target="_blank" disabled={row.githubLink === '#'}>GitHub</Button>
          <Button size="small" href={row.driveLink} target="_blank" disabled={row.driveLink === '#'}>Drive</Button>
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>Verify Submissions</Typography>
      
      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={submissions}
            totalCount={submissions.length}
            page={0}
            rowsPerPage={10}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            orderBy="projectTitle"
            orderDirection="asc"
            onSort={() => {}}
          />
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => !submittingAction && setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 500 }}>
          {action === 'approve' ? 'Approve Completion Request' : 'Reject Completion Request'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            You are about to {action} the project <strong>{selectedSubmission?.projectTitle}</strong> submitted by {selectedSubmission?.studentName}.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={action === 'approve' ? "Faculty Comments (Optional)" : "Faculty Comments (Required for Rejection)"}
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={submittingAction}
            required={action === 'reject'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={submittingAction}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            color={action === 'approve' ? 'success' : 'error'} 
            variant="contained"
            disabled={submittingAction}
          >
            {submittingAction ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={alert.show} 
        autoHideDuration={6000} 
        onClose={() => setAlert({ ...alert, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setAlert({ ...alert, show: false })} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerifySubmissions;
