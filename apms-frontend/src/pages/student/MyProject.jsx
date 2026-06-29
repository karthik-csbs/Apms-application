import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { 
  Box, Typography, Button, Paper, Grid, CircularProgress, 
  Snackbar, Alert, Card, CardContent, Divider, TextField, Chip 
} from '@mui/material';
import FormInput from '../../components/FormInput';
import WorkflowProgress from '../../components/WorkflowProgress';
import WorkflowHistory from '../../components/WorkflowHistory';
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { studentService } from '../../services/studentService';
import { workflowService } from '../../services/workflowService';
import { useNavigate, useSearchParams } from 'react-router-dom';

const schema = yup.object().shape({
  githubLink: yup.string().url('Must be a valid URL').required('GitHub link is required'),
  driveLink: yup.string().url('Must be a valid URL').required('Google Drive link is required'),
  comments: yup.string(),
});

const MyProject = () => {
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

  // Workflow integration states
  const [workflowData, setWorkflowData] = useState(null);
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [remarksInput, setRemarksInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

      // Load Workflow details
      try {
        const wf = await workflowService.getWorkflow(targetId);
        setWorkflowData(wf);
        const history = await workflowService.getWorkflowHistory(targetId);
        setWorkflowHistory(history);
      } catch (wfErr) {
        console.error('Failed to load workflow data', wfErr);
      }

      // Pre-fill form if values exist
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
      console.error('Failed to load project details', err);
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

      await projectService.updateTeamLead(projectId, {
        duration: projectDetails.duration,
        projectType: projectDetails.projectType
      });
      
      // Save URLs
      await projectService.update(projectId, {
        githubUrl: data.githubLink,
        driveUrl: data.driveLink,
        documentUrl: data.driveLink,
        completionStatus: 'PENDING_APPROVAL'
      });

      setAlert({ show: true, message: 'Deliverables saved successfully!', severity: 'success' });
      fetchProjectContext();
    } catch (err) {
      console.error('Failed to save deliverables', err);
      const errMsg = err.response?.data?.message || 'Failed to save deliverables.';
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
      fetchProjectContext();
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

  // Workflow action handlers
  const handleWorkflowSubmit = async () => {
    try {
      setActionLoading(true);
      await workflowService.submitWorkflow(projectId);
      setAlert({ show: true, message: 'Workflow stage submitted successfully!', severity: 'success' });
      fetchProjectContext();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to submit workflow.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWorkflowReview = async () => {
    try {
      setActionLoading(true);
      await workflowService.reviewWorkflow(projectId, remarksInput);
      setAlert({ show: true, message: 'Stage reviewed successfully!', severity: 'success' });
      setRemarksInput('');
      fetchProjectContext();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to review workflow.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWorkflowApprove = async () => {
    try {
      setActionLoading(true);
      await workflowService.approveWorkflow(projectId, remarksInput);
      setAlert({ show: true, message: 'Stage approved successfully!', severity: 'success' });
      setRemarksInput('');
      fetchProjectContext();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to approve stage.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWorkflowReject = async () => {
    if (!remarksInput.trim()) {
      setAlert({ show: true, message: 'Remarks are required for rejection.', severity: 'error' });
      return;
    }
    try {
      setActionLoading(true);
      await workflowService.rejectWorkflow(projectId, remarksInput);
      setAlert({ show: true, message: 'Stage rejected successfully!', severity: 'success' });
      setRemarksInput('');
      fetchProjectContext();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reject stage.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to determine next action information
  const getNextActionInfo = () => {
    if (!workflowData) return { reviewer: '—', action: '—' };
    const stage = workflowData.currentStage;
    const status = workflowData.workflowStatus;
    const currentStageStatus = workflowData.stages?.find(s => s.stageNumber === stage)?.stageStatus;

    let reviewer = '—';
    if (stage === 1) reviewer = 'Guide (Faculty)';
    else if (stage === 2) reviewer = 'HOD';
    else if (stage === 3) reviewer = 'Principal';

    let action = '—';
    if (status === 'COMPLETED') {
      reviewer = '—';
      action = 'Workflow completed successfully!';
    } else if (currentStageStatus === 'ACTIVE' || currentStageStatus === 'PENDING') {
      action = `Student needs to submit Stage ${stage} review request`;
    } else if (currentStageStatus === 'UNDER_REVIEW') {
      if (stage === 1) {
        action = `Guide needs to review Stage 1`;
      } else {
        action = `${reviewer} needs to Approve/Reject Stage ${stage}`;
      }
    } else if (currentStageStatus === 'REJECTED') {
      action = `Student needs to address remarks and re-submit Stage ${stage}`;
    }

    return { reviewer, action };
  };

  const { reviewer: currentReviewer, action: nextAction } = getNextActionInfo();

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
  const isWorkflowCompleted = workflowData?.workflowStatus === 'COMPLETED';

  // Determine stage status for active stage
  const activeStageStatus = workflowData?.stages?.find(s => s.stageNumber === workflowData.currentStage)?.stageStatus;

  // Actions allowed mapping
  const canStudentSubmit = user?.role === 'STUDENT' && isTeamLead && !isWorkflowCompleted && (activeStageStatus === 'ACTIVE' || activeStageStatus === 'PENDING' || activeStageStatus === 'REJECTED');
  const canGuideReview = user?.role === 'FACULTY' && !isWorkflowCompleted && workflowData?.currentStage === 1 && activeStageStatus === 'UNDER_REVIEW';
  const canHodApprove = user?.role === 'HOD' && !isWorkflowCompleted && workflowData?.currentStage === 2 && activeStageStatus === 'UNDER_REVIEW';
  const canPrincipalApprove = user?.role === 'PRINCIPAL' && !isWorkflowCompleted && workflowData?.currentStage === 3 && activeStageStatus === 'UNDER_REVIEW';

  const showRemarksField = (user?.role === 'FACULTY' && canGuideReview) || (user?.role === 'HOD' && canHodApprove) || (user?.role === 'PRINCIPAL' && canPrincipalApprove);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
        Project Lifecycle & Submission
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          
          {/* 1. Workflow Information Card */}
          {workflowData && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 500, mb: 2 }}>
                  Workflow Stage Tracker
                </Typography>
                
                {/* Stepper Progress */}
                <WorkflowProgress 
                  projectType={workflowData.projectType}
                  currentStage={workflowData.currentStage}
                  workflowStatus={workflowData.workflowStatus}
                  currentStageStatus={activeStageStatus}
                />
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Project Type:</strong> {workflowData.projectType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Workflow Status:</strong>{' '}
                      <Chip 
                        label={workflowData.workflowStatus} 
                        size="small"
                        color={isWorkflowCompleted ? 'success' : 'primary'}
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Active Stage:</strong> Stage {workflowData.currentStage} / {workflowData.totalStages}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Submitted Date:</strong> {formatDate(workflowData.submittedDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Approved Date:</strong> {formatDate(workflowData.approvedDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* 2. Project Metadata Card */}
          <Paper sx={{ p: 4, mb: 3 }}>
            {projectDetails && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>{projectDetails.title || 'Untitled Project'}</Typography>
                  {isTeamLead && user?.role === 'STUDENT' && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setIsEditingDetails(true)}
                      disabled={isWorkflowCompleted}
                    >
                      Edit Details
                    </Button>
                  )}
                </Box>
                
                {isEditingDetails ? (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {projectDetails.description || 'No description provided yet.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Faculty Guide:</strong> {projectDetails.facultyGuideName || '—'} | <strong>Status:</strong> {projectDetails.status} | <strong>Duration:</strong> {projectDetails.duration} Weeks
                    </Typography>
                    {projectDetails.technologies && projectDetails.technologies.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {projectDetails.technologies.map((t, idx) => (
                          <Chip key={idx} label={t} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Render Deliverables form or Member details */}
            {user?.role === 'STUDENT' && isTeamLead ? (
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Team Lead Deliverables Submission
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Provide the links to the team's project source code repository and final project documentation.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormInput
                      name="githubLink"
                      control={control}
                      label="GitHub Repository Link"
                      placeholder="https://github.com/username/project"
                      disabled={isWorkflowCompleted}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormInput
                      name="driveLink"
                      control={control}
                      label="Google Drive Link (Documentation)"
                      placeholder="https://drive.google.com/..."
                      disabled={isWorkflowCompleted}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormInput
                      name="comments"
                      control={control}
                      label="Additional Comments / Submission Remarks"
                      multiline
                      rows={3}
                      disabled={isWorkflowCompleted}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || isWorkflowCompleted}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Deliverables'}
                      </Button>
                      {canStudentSubmit && (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleWorkflowSubmit}
                          disabled={actionLoading}
                        >
                          Submit For Review
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : user?.role === 'STUDENT' ? (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Individual Member Contribution & Personal Details
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Register Number"
                      value={profileRegNum}
                      onChange={(e) => setProfileRegNum(e.target.value)}
                      variant="outlined"
                      disabled={isWorkflowCompleted}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mobile Number"
                      value={profileMobile}
                      onChange={(e) => setProfileMobile(e.target.value)}
                      variant="outlined"
                      disabled={isWorkflowCompleted}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Personal Document Link (e.g. Resume URL)"
                      value={profileResumeUrl}
                      onChange={(e) => setProfileResumeUrl(e.target.value)}
                      variant="outlined"
                      placeholder="https://drive.google.com/..."
                      disabled={isWorkflowCompleted}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="My Contribution Details"
                      value={myContribution}
                      onChange={(e) => setMyContribution(e.target.value)}
                      multiline
                      rows={4}
                      placeholder="Describe your role..."
                      variant="outlined"
                      disabled={isWorkflowCompleted}
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  onClick={handleUpdateContribution}
                  disabled={updatingContribution || isWorkflowCompleted}
                >
                  {updatingContribution ? 'Saving...' : 'Update Details'}
                </Button>
              </Box>
            ) : (
              // Guide / HOD / Principal View Deliverables
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Submitted Project Deliverables
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>GitHub Repository:</strong>{' '}
                      {projectDetails?.githubUrl ? (
                        <a href={projectDetails.githubUrl} target="_blank" rel="noopener noreferrer">{projectDetails.githubUrl}</a>
                      ) : 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Documentation (Drive Link):</strong>{' '}
                      {projectDetails?.driveUrl ? (
                        <a href={projectDetails.driveUrl} target="_blank" rel="noopener noreferrer">{projectDetails.driveUrl}</a>
                      ) : 'Not provided'}
                    </Typography>
                  </Grid>
                </Grid>

                {showRemarksField && (
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Remarks/Comments</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Add remarks here (Required for Rejection)"
                      value={remarksInput}
                      onChange={(e) => setRemarksInput(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      {user?.role === 'FACULTY' && (
                        <Button variant="contained" color="primary" onClick={handleWorkflowReview} disabled={actionLoading}>
                          Submit Review
                        </Button>
                      )}
                      {user?.role === 'HOD' && (
                        <>
                          <Button variant="contained" color="success" onClick={handleWorkflowApprove} disabled={actionLoading}>
                            Approve Stage
                          </Button>
                          <Button variant="contained" color="error" onClick={handleWorkflowReject} disabled={actionLoading}>
                            Reject Stage
                          </Button>
                        </>
                      )}
                      {user?.role === 'PRINCIPAL' && (
                        <>
                          <Button variant="contained" color="success" onClick={handleWorkflowApprove} disabled={actionLoading}>
                            Final Approve
                          </Button>
                          <Button variant="contained" color="error" onClick={handleWorkflowReject} disabled={actionLoading}>
                            Reject Stage
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Paper>

          {/* 3. Workflow History Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 500, mb: 2 }}>
                Workflow History Log
              </Typography>
              <WorkflowHistory history={workflowHistory} />
            </CardContent>
          </Card>

        </Grid>
        
        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>Workflow Status Summary</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary"><strong>Workflow Status:</strong></Typography>
                <Chip label={workflowData?.workflowStatus || 'DRAFT'} size="small" variant="filled" color={isWorkflowCompleted ? 'success' : 'primary'} />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary"><strong>Current Stage:</strong></Typography>
                <Typography variant="body2">Stage {workflowData?.currentStage || 1}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary"><strong>Current Reviewer:</strong></Typography>
                <Typography variant="body2">{currentReviewer}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary"><strong>Next Required Action:</strong></Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{nextAction}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="caption" display="block" color="text.secondary">
                For changes in Stage 2/3 approvals, ensure the HOD/Principal log in to their dashboard and approve or reject appropriately.
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

export default MyProject;
