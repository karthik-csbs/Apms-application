import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Box, Button, Chip, CircularProgress, Snackbar, Alert } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [project, setProject] = useState({
    title: 'AI based Disease Prediction',
    faculty: 'Dr. Smith',
    status: 'In Progress',
    deadline: '2026-11-30',
  });

  useEffect(() => {
    fetchStudentProject();
  }, []);

  const fetchStudentProject = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getAll({ size: 100 });
      const projectList = projectData?.data?.content || projectData?.content || [];
      
      // Find a project that has the logged-in student as a team member
      const studentProject = projectList.find(p => 
        p.teamMembers?.some(m => m.studentName === user?.name || m.id === user?.id)
      );

      if (studentProject) {
        setProject({
          id: studentProject.id,
          title: studentProject.title,
          faculty: studentProject.facultyGuideName || 'Dr. Smith',
          status: studentProject.completionStatus === 'APPROVED' ? 'Completed' : (studentProject.completionStatus === 'PENDING_APPROVAL' ? 'Pending Review' : 'In Progress'),
          deadline: studentProject.duration ? `In ${studentProject.duration} weeks` : '2026-11-30'
        });
      } else if (projectList.length > 0) {
        // Fallback to first available project for demo purposes
        const demoProj = projectList[0];
        setProject({
          id: demoProj.id,
          title: demoProj.title,
          faculty: demoProj.facultyGuideName || 'Dr. Smith',
          status: demoProj.completionStatus === 'APPROVED' ? 'Completed' : (demoProj.completionStatus === 'PENDING_APPROVAL' ? 'Pending Review' : 'In Progress'),
          deadline: demoProj.duration ? `In ${demoProj.duration} weeks` : '2026-11-30'
        });
      }
    } catch (err) {
      console.error('Failed to load student project', err);
      setErrorMsg('Failed to connect to backend APIs. Using offline state.');
      setShowError(true);
      // Fallback stays as default state
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>Student Dashboard</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 500 }}>{project.title}</Typography>
                <Chip 
                  label={project.status} 
                  color={project.status === 'Completed' ? 'success' : (project.status === 'Pending Review' ? 'warning' : 'primary')} 
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
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Recent Announcements</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  - Final presentation schedule has been updated.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - Submit all project deliverables using the quick actions panel.
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Quick Actions</Typography>
              <Button 
                variant="contained" 
                startIcon={<FileUploadIcon />} 
                fullWidth
                onClick={() => navigate('/my-project')}
                disabled={project.status === 'Completed' || project.status === 'Pending Review'}
              >
                Upload Submission
              </Button>
              <Button variant="outlined" fullWidth onClick={() => navigate('/meetings')}>
                Request Meeting
              </Button>
              <Button 
                variant="outlined" 
                color="success" 
                fullWidth 
                onClick={() => navigate('/certificates')}
                disabled={project.status !== 'Completed'}
              >
                Download Certificate
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowError(false)} severity="warning" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentDashboard;
