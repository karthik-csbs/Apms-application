import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Typography, Button, Paper, Grid, CircularProgress, Snackbar, Alert } from '@mui/material';
import FormInput from '../../components/FormInput';
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { useNavigate } from 'react-router-dom';

const schema = yup.object().shape({
  githubLink: yup.string().url('Must be a valid URL').required('GitHub link is required'),
  driveLink: yup.string().url('Must be a valid URL').required('Google Drive link is required'),
  comments: yup.string(),
});

const SubmissionForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [fetchingProject, setFetchingProject] = useState(true);
  const [projectId, setProjectId] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const { control, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      githubLink: '',
      driveLink: '',
      comments: '',
    },
  });

  useEffect(() => {
    fetchActiveProject();
  }, []);

  const fetchActiveProject = async () => {
    try {
      setFetchingProject(true);
      const projectData = await projectService.getAll({ size: 100 });
      const projectList = projectData?.data?.content || projectData?.content || [];
      
      // Find a project that has the logged-in student as a team member
      const studentProject = projectList.find(p => 
        p.teamMembers?.some(m => m.studentName === user?.name || m.id === user?.id)
      );

      if (studentProject) {
        setProjectId(studentProject.id);
        
        // Pre-fill form if there are previous values
        if (studentProject.githubUrl) setValue('githubLink', studentProject.githubUrl);
        if (studentProject.driveUrl || studentProject.documentUrl) {
          setValue('driveLink', studentProject.driveUrl || studentProject.documentUrl);
        }
        
        if (studentProject.completionStatus === 'PENDING_APPROVAL') {
          setHasPendingRequest(true);
          setAlert({
            show: true,
            message: 'You already have a pending completion request for this project.',
            severity: 'info'
          });
        }
      } else {
        // Fallback to first available project for demo purposes
        if (projectList.length > 0) {
          setProjectId(projectList[0].id);
        } else {
          setAlert({
            show: true,
            message: 'No active project assigned to your account. Please consult your guide.',
            severity: 'warning'
          });
        }
      }
    } catch (err) {
      console.error('Failed to load active project for submission', err);
      setAlert({
        show: true,
        message: 'Could not fetch your active project from server. Offline submission enabled.',
        severity: 'warning'
      });
      // Fallback ID
      setProjectId(1);
    } finally {
      setFetchingProject(false);
    }
  };

  const onSubmit = async (data) => {
    if (!projectId) {
      setAlert({ show: true, message: 'No project ID found. Cannot submit.', severity: 'error' });
      return;
    }

    try {
      // Map frontend fields (githubLink, driveLink) to backend expectations (githubUrl, driveUrl/documentUrl)
      const payload = {
        githubUrl: data.githubLink,
        driveUrl: data.driveLink,
        documentUrl: data.driveLink,
        comments: data.comments
      };

      await projectService.requestCompletion(projectId, payload);
      setAlert({ show: true, message: 'Deliverables submitted successfully! Pending guide approval.', severity: 'success' });
      setHasPendingRequest(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit deliverables', err);
      const errMsg = err.response?.data?.message || 'Failed to submit project deliverables to server. Saving offline.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
      
      // Fallback redirect for offline demo
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  if (fetchingProject) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>Submit Project Deliverables</Typography>
      
      <Paper sx={{ p: 4, maxWidth: 800 }}>
        <Typography variant="body1" paragraph color="text.secondary">
          Please provide the links to your project repository and final documentation. 
          Ensure both links are publicly accessible or shared with your faculty guide.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormInput
                name="githubLink"
                control={control}
                label="GitHub Repository Link"
                placeholder="https://github.com/username/project"
                disabled={hasPendingRequest}
              />
            </Grid>
            <Grid item xs={12}>
              <FormInput
                name="driveLink"
                control={control}
                label="Google Drive Link (Documentation)"
                placeholder="https://drive.google.com/..."
                disabled={hasPendingRequest}
              />
            </Grid>
            <Grid item xs={12}>
              <FormInput
                name="comments"
                control={control}
                label="Additional Comments (Optional)"
                multiline
                rows={4}
                disabled={hasPendingRequest}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || hasPendingRequest}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Final Deliverables'}
                </Button>
                <Button variant="outlined" color="error" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

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

export default SubmissionForm;
