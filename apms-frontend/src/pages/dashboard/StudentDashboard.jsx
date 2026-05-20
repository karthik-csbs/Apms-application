import React from 'react';
import { Grid, Paper, Typography, Box, Button, Chip } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const StudentDashboard = () => {
  // Dummy data
  const project = {
    title: 'AI based Disease Prediction',
    faculty: 'Dr. Smith',
    status: 'In Progress',
    deadline: '2026-11-30',
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Student Dashboard</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h5" color="primary">{project.title}</Typography>
              <Chip 
                label={project.status} 
                color="primary" 
                variant="outlined" 
              />
            </Box>
            
            <Typography variant="body1" paragraph>
              <strong>Guide:</strong> {project.faculty}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Deadline:</strong> {project.deadline}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Recent Announcements</Typography>
              <Typography variant="body2" color="text.secondary">
                - Final presentation schedule has been updated.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Button variant="contained" startIcon={<FileUploadIcon />} fullWidth>
              Upload Submission
            </Button>
            <Button variant="outlined" fullWidth>
              Request Meeting
            </Button>
            <Button variant="outlined" color="success" fullWidth disabled={project.status !== 'Completed'}>
              Download Certificate
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
