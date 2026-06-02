import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Typography, Button, Paper, Grid, CircularProgress, Snackbar, Alert, Card, CardContent, Divider, TextField, Chip } from '@mui/material';
import FormInput from '../../components/FormInput';
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { studentService } from '../../services/studentService';
import { useNavigate, useSearchParams } from 'react-router-dom';

const schema = yup.object().shape({
  githubLink: yup.string().url('Must be a valid URL').required('GitHub link is required'),
  driveLink: yup.string().url('Must be a valid URL').required('Google Drive link is required'),
  comments: yup.string(),
});

const SubmissionForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryProjectId = searchParams.get('projectId');

  const [fetchingProject, setFetchingProject] = useState(true);
  const [projectId, setProjectId] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [myRole, setMyRole] = useState('MEMBER'); // 'TEAM_LEAD' or 'MEMBER'
  const [myContribution, setMyContribution] = useState('');
  const [updatingContribution, setUpdatingContribution] = useState(false);
  const [profileMobile, setProfileMobile] = useState('');
  const [profileRegNum, setProfileRegNum] = useState('');
  const [profileResumeUrl, setProfileResumeUrl] = useState('');
  const [profileName, setProfileName] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // Edit project details states (TEAM_LEAD only)
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsDesc, setDetailsDesc] = useState('');
  const [detailsDuration, setDetailsDuration] = useState('');
  const [detailsTech, setDetailsTech] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  const { control, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      githubLink: '',
      driveLink: '',
      comments: '',
    },
  });

  useEffect(() => {
    fetchProjectContext();
  }, [queryProjectId]);

  const fetchProjectContext = async () => {
    try {
      setFetchingProject(true);
      let targetId = queryProjectId;

      if (!targetId) {
        // Fallback: fetch student projects, select first
        const studentProjects = await projectService.getStudentProjects();
        const projList = studentProjects || [];
        if (projList.length > 0) {
          targetId = projList[0].id;
        }
      }

      if (!targetId) {
        setAlert({
          show: true,
          message: 'No active project found for your account. Please consult your guide.',
          severity: 'warning'
        });
        setFetchingProject(false);
        return;
      }

      setProjectId(targetId);

      // Load specific project details
      const proj = await projectService.getById(targetId);
      setProjectDetails(proj);

      // Determine user's role in this project
      const myMemberObj = proj.teamMembers?.find(m => m.studentId === user?.id);
      const roleStr = myMemberObj?.role || 'MEMBER';
      setMyRole(roleStr);
      setMyContribution(myMemberObj?.contribution || '');

      setDetailsTitle(proj.title || '');
      setDetailsDesc(proj.description || '');
      setDetailsDuration(proj.duration || '');
      setDetailsTech(proj.technologies ? proj.technologies.join(', ') : '');

      // Check if project has a pending completion status
      if (proj.completionStatus === 'PENDING_APPROVAL') {
        setHasPendingRequest(true);
        setAlert({
          show: true,
          message: 'This project has a pending completion request submitted.',
          severity: 'info'
        });
      } else if (proj.completionStatus === 'APPROVED') {
        setHasPendingRequest(true);
        setAlert({
          show: true,
          message: 'This project is already marked as completed and approved!',
          severity: 'success'
        });
      }

      // Pre-fill form if values exist in the database (or project submission objects if any)
      // Note: In APMS the Project schema itself or latest Submission details can be filled.
      // If we don't have separate fields directly, we'll try to find from project response
      if (proj.githubUrl) setValue('githubLink', proj.githubUrl);
      if (proj.driveUrl) setValue('driveLink', proj.driveUrl);
      if (proj.documentUrl && !proj.driveUrl) setValue('driveLink', proj.documentUrl);

      if (user?.role === 'STUDENT') {
        try {
          const profileRes = await studentService.getProfile();
          if (profileRes) {
            setProfileMobile(profileRes.mobile || '');
            setProfileRegNum(profileRes.registerNumber || '');
            setProfileResumeUrl(profileRes.resumeUrl || '');
            setProfileName(profileRes.name || user.name || '');
          }
        } catch (profileErr) {
          console.error('Failed to load student profile details', profileErr);
        }
      }

    } catch (err) {
      console.error('Failed to load project details for submission', err);
      setAlert({
        show: true,
        message: 'Could not fetch project details from the server.',
        severity: 'error'
      });
    } finally {
      setFetchingProject(false);
    }
  };

  const onSubmit = async (data) => {
    if (!projectId) {
      setAlert({ show: true, message: 'No project context found. Cannot submit.', severity: 'error' });
      return;
    }

    try {
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
      const errMsg = err.response?.data?.message || 'Failed to submit project deliverables to server.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    }
  };

  const handleUpdateContribution = async () => {
    if (!projectId) return;

    try {
      setUpdatingContribution(true);
      await projectService.updateContribution(projectId, myContribution);

      const profilePayload = {
        name: profileName || user?.name || 'Student',
        mobile: profileMobile,
        registerNumber: profileRegNum,
        resumeUrl: profileResumeUrl
      };
      await studentService.updateProfile(profilePayload);

      setAlert({ show: true, message: 'Your contribution and personal details updated successfully!', severity: 'success' });
      
      // Update local state
      setProjectDetails(prev => {
        if (!prev) return prev;
        const updatedMembers = prev.teamMembers?.map(m => 
          m.studentId === user?.id ? { ...m, contribution: myContribution, registerNumber: profileRegNum } : m
        );
        return { ...prev, teamMembers: updatedMembers };
      });
    } catch (err) {
      console.error('Failed to update contribution', err);
      const errMsg = err.response?.data?.message || 'Failed to update contribution details.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setUpdatingContribution(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!projectId || !projectDetails) return;
    if (!detailsTitle.trim() || !detailsDesc.trim()) {
      setAlert({ show: true, message: 'Please fill in all required fields.', severity: 'error' });
      return;
    }

    try {
      setSavingDetails(true);
      const techList = detailsTech
        ? detailsTech.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const payload = {
        title: detailsTitle,
        description: detailsDesc,
        technologies: techList
      };

      const updated = await projectService.updateTeamLead(projectId, payload);
      setProjectDetails(updated);
      setAlert({ show: true, message: 'Project details updated successfully!', severity: 'success' });
      setIsEditingDetails(false);
    } catch (err) {
      console.error('Failed to update project details', err);
      const errMsg = err.response?.data?.message || 'Failed to update project details.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setSavingDetails(false);
    }
  };

  if (fetchingProject) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!projectId) {
    return (
      <Box>
        <Typography variant="h5" color="text.secondary">No project found.</Typography>
      </Box>
    );
  }

  const isTeamLead = myRole === 'TEAM_LEAD';

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
        {isTeamLead ? 'Submit Project Deliverables' : 'Project Contribution Details'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            {projectDetails && (
              <Box sx={{ mb: 3 }}>
                {isEditingDetails ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Project Title"
                        value={detailsTitle}
                        onChange={(e) => setDetailsTitle(e.target.value)}
                        variant="outlined"
                        size="small"
                        required
                        disabled={savingDetails}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={detailsDesc}
                        onChange={(e) => setDetailsDesc(e.target.value)}
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        required
                        disabled={savingDetails}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Technologies (comma separated)"
                        value={detailsTech}
                        onChange={(e) => setDetailsTech(e.target.value)}
                        variant="outlined"
                        size="small"
                        disabled={savingDetails}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" size="small" onClick={handleSaveDetails} disabled={savingDetails}>
                          {savingDetails ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outlined" size="small" onClick={() => setIsEditingDetails(false)} disabled={savingDetails}>
                          Cancel
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>{projectDetails.title}</Typography>
                      {isTeamLead && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => setIsEditingDetails(true)}
                          disabled={projectDetails.completionStatus === 'APPROVED'}
                        >
                          Edit Details
                        </Button>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {projectDetails.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Faculty Guide:</strong> {projectDetails.facultyGuideName} | <strong>Status:</strong> {projectDetails.status} | <strong>Duration:</strong> {projectDetails.duration} Weeks
                    </Typography>
                    {projectDetails.technologies && projectDetails.technologies.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {projectDetails.technologies.map((t, idx) => (
                          <Chip key={idx} label={t} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}
                    {projectDetails.completionStatus && (
                      <Alert severity={projectDetails.completionStatus === 'APPROVED' ? 'success' : (projectDetails.completionStatus === 'REJECTED' ? 'error' : 'warning')} sx={{ mt: 2 }}>
                        Project Completion Status: <strong>{projectDetails.completionStatus}</strong>
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {isTeamLead ? (
              // Team Lead Deliverables Submission Form
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Team Lead Submission
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Provide the links to the team's project source code repository and final project documentation.
                  Ensure both links are publicly accessible.
                </Typography>

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
                      label="Additional Comments / Submission Remarks"
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
                        Back to Dashboard
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              // Regular Member Contribution Details View/Edit
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Individual Member Contribution & Personal Details
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  As a team member, you cannot submit the final deliverables. 
                  However, you must document your specific role, register/mobile number, and upload personal documents below. 
                  This will be visible to your Faculty Guide.
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Register Number"
                      value={profileRegNum}
                      onChange={(e) => setProfileRegNum(e.target.value)}
                      variant="outlined"
                      disabled={projectDetails?.completionStatus === 'APPROVED'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mobile Number"
                      value={profileMobile}
                      onChange={(e) => setProfileMobile(e.target.value)}
                      variant="outlined"
                      disabled={projectDetails?.completionStatus === 'APPROVED'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Personal Document Link (e.g. Resume, Report URL)"
                      value={profileResumeUrl}
                      onChange={(e) => setProfileResumeUrl(e.target.value)}
                      variant="outlined"
                      placeholder="https://drive.google.com/..."
                      disabled={projectDetails?.completionStatus === 'APPROVED'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="My Contribution Details"
                      value={myContribution}
                      onChange={(e) => setMyContribution(e.target.value)}
                      multiline
                      rows={6}
                      placeholder="Describe your role, modules worked on, tech stack implemented, etc."
                      variant="outlined"
                      disabled={projectDetails?.completionStatus === 'APPROVED'}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdateContribution}
                    disabled={updatingContribution || projectDetails?.completionStatus === 'APPROVED'}
                  >
                    {updatingContribution ? 'Saving...' : 'Update Details'}
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>Submission Rules</Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                1. <strong>Team Lead Role:</strong> Only the assigned Team Lead can trigger the completion request and submit final URLs.
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                2. <strong>Member Contributions:</strong> Every member must detail their individual contribution before or during the submission.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. <strong>Approval Workflow:</strong> Once submitted, the project enters <em>PENDING_APPROVAL</em>. Your Faculty Guide will review the deliverables and either Approve or Reject (with comments).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
