import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, Paper, Typography, Box, Button, Chip, CircularProgress, 
  Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemText, IconButton, Badge, Divider, TextField,
  Skeleton
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { notificationService } from '../../services/notificationService';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [activeProject, setActiveProject] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async (retryCount = 0) => {
    try {
      if (projects.length === 0) {
        setLoading(true);
      }
      
      // Fetch projects
      const projectRes = await projectService.getStudentProjects();
      const projList = projectRes?.data || projectRes || [];
      
      // Fetch notifications
      const notifRes = await notificationService.getAll();
      const notifList = notifRes?.data || notifRes || [];

      setProjects(projList);
      setNotifications(notifList);

      if (projList.length > 0) {
        const stillExists = projList.find(p => Number(p.id) === Number(selectedProjectId));
        if (stillExists) {
          setActiveProject(stillExists);
        } else {
          setSelectedProjectId(projList[0].id);
          setActiveProject(projList[0]);
        }
      } else {
        setActiveProject(null);
      }
      
    } catch (err) {
      if (retryCount < 1) {
        console.warn('First fetch failed. Retrying in 1 second...', err);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchDashboardData(retryCount + 1);
      }
      console.error('Failed to load student dashboard data after retry', err);
      if (!err.response) {
        setAlert({
          show: true,
          message: 'Backend server is not running',
          severity: 'error'
        });
        return;
      }
      switch (err.response.status) {
        case 401:
          setAlert({ show: true, message: 'Session expired. Please login again.', severity: 'error' });
          break;
        case 403:
          setAlert({ show: true, message: 'Access denied.', severity: 'error' });
          break;
        case 500:
          setAlert({ show: true, message: 'Internal server error.', severity: 'error' });
          break;
        default:
          setAlert({ show: true, message: 'Something went wrong.', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (event) => {
    const id = event.target.value;
    setSelectedProjectId(id);
    const selected = projects.find(p => Number(p.id) === Number(id));
    setActiveProject(selected);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      setAlert({ show: true, message: 'Failed to update notification state', severity: 'error' });
    }
  };

  const getMyRoleInProject = (project) => {
    if (!project || !project.teamMembers) return 'MEMBER';
    const member = project.teamMembers.find(m => m.studentId === user?.id);
    return member?.role || 'MEMBER';
  };

  useEffect(() => {
    if (activeProject) {
      setTitleInput(activeProject.title && activeProject.title !== 'Untitled Project' ? activeProject.title : '');
      setDescInput(activeProject.description || '');
      setTechInput(activeProject.technologies ? activeProject.technologies.join(', ') : '');
    }
  }, [activeProject]);

  const handleSaveProjectDetails = async () => {
    if (!activeProject) return;
    if (!titleInput.trim() || !descInput.trim()) {
      setAlert({ show: true, message: 'Title and Description are required.', severity: 'error' });
      return;
    }

    try {
      setSavingDetails(true);
      const techList = techInput
        ? techInput.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const payload = {
        title: titleInput,
        description: descInput,
        technologies: techList
      };

      const res = await projectService.updateTeamLead(activeProject.id, payload);
      const updatedProject = res?.data || res;
      
      setAlert({ show: true, message: 'Project details updated successfully!', severity: 'success' });
      
      setProjects(prev => prev.map(p => p.id === activeProject.id ? updatedProject : p));
      setActiveProject(updatedProject);
    } catch (err) {
      console.error('Failed to save project details', err);
      const errMsg = err.response?.data?.message || 'Failed to update project details.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setSavingDetails(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  if (loading && projects.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" height={60} width="40%" sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={150} />
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Skeleton variant="rectangular" height={150} />
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={200} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>Student Dashboard</Typography>
        {projects.length > 1 && (
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="project-select-label">Switch Active Project</InputLabel>
            <Select
              labelId="project-select-label"
              value={selectedProjectId}
              label="Switch Active Project"
              onChange={handleProjectChange}
            >
              {projects.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.title || 'Untitled Project'}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {projects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Projects Assigned
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You are not currently enrolled in any academic project. Please contact your Faculty Guide.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Main project info */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              {activeProject && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 500, mb: 1 }}>
                        {activeProject.title || 'Untitled Project'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={getMyRoleInProject(activeProject) === 'TEAM_LEAD' ? 'Team Lead' : 'Team Member'} 
                          color="secondary"
                          variant="filled"
                          size="small"
                        />
                        <Chip 
                          label={activeProject.projectType || 'MAIN'} 
                          variant="outlined" 
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={activeProject.status || 'PENDING'} 
                        color={activeProject.status === 'COMPLETED' ? 'success' : 'primary'} 
                        variant="outlined" 
                        size="small"
                      />
                      {activeProject.completionStatus && (
                        <Chip 
                          label={`Submission: ${activeProject.completionStatus}`} 
                          color={activeProject.completionStatus === 'APPROVED' ? 'success' : (activeProject.completionStatus === 'REJECTED' ? 'error' : 'warning')} 
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, mb: 3 }}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Project Title"
                          value={titleInput}
                          onChange={(e) => setTitleInput(e.target.value)}
                          variant="outlined"
                          size="small"
                          disabled={getMyRoleInProject(activeProject) !== 'TEAM_LEAD' || activeProject.completionStatus === 'APPROVED'}
                          InputProps={{
                            readOnly: getMyRoleInProject(activeProject) !== 'TEAM_LEAD' || activeProject.completionStatus === 'APPROVED'
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Project Description"
                          value={descInput}
                          onChange={(e) => setDescInput(e.target.value)}
                          multiline
                          rows={3}
                          variant="outlined"
                          size="small"
                          disabled={getMyRoleInProject(activeProject) !== 'TEAM_LEAD' || activeProject.completionStatus === 'APPROVED'}
                          InputProps={{
                            readOnly: getMyRoleInProject(activeProject) !== 'TEAM_LEAD' || activeProject.completionStatus === 'APPROVED'
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Technologies"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          variant="outlined"
                          size="small"
                          placeholder="e.g. Java, React, OpenCV"
                          disabled={getMyRoleInProject(activeProject) !== 'TEAM_LEAD' || activeProject.completionStatus === 'APPROVED'}
                          InputProps={{
                            readOnly: getMyRoleInProject(activeProject) !== 'TEAM_LEAD' || activeProject.completionStatus === 'APPROVED'
                          }}
                          helperText={getMyRoleInProject(activeProject) === 'TEAM_LEAD' ? "Separate technologies with commas" : ""}
                        />
                      </Grid>
                      {getMyRoleInProject(activeProject) === 'TEAM_LEAD' && activeProject.completionStatus !== 'APPROVED' && (
                        <Grid item xs={12}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small" 
                            onClick={handleSaveProjectDetails}
                            disabled={savingDetails}
                          >
                            {savingDetails ? 'Saving...' : 'Save Project Details'}
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary"><strong>Faculty Guide:</strong> {activeProject.facultyGuideName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary"><strong>Duration:</strong> {activeProject.duration} Weeks</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Team Lead:</strong> {activeProject.teamMembers?.find(m => m.role === 'TEAM_LEAD' || m.isTeamLead)?.studentName || 'Not assigned'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>Team Members</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Contribution</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeProject.teamMembers?.filter(m => m.role !== 'TEAM_LEAD' && !m.isTeamLead).map((m) => (
                          <TableRow key={m.studentId} selected={m.studentId === user?.id}>
                            <TableCell sx={{ fontWeight: m.studentId === user?.id ? 'bold' : 'normal' }}>
                              {m.studentName} {m.studentId === user?.id && '(You)'}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label="Member" 
                                color="default" 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell sx={{ fontStyle: m.contribution ? 'normal' : 'italic', color: m.contribution ? 'text.primary' : 'text.secondary' }}>
                              {m.contribution || 'No contribution detailed yet'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>
          </Grid>

          {/* Sidebar panels */}
          <Grid item xs={12} lg={4}>
            {/* Quick Actions */}
            <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>Quick Actions</Typography>
              <Button 
                variant="contained" 
                startIcon={<FileUploadIcon />} 
                fullWidth
                onClick={() => navigate(`/my-project?projectId=${selectedProjectId}`)}
                disabled={activeProject?.completionStatus === 'APPROVED' || activeProject?.completionStatus === 'PENDING_APPROVAL'}
              >
                Project Submission / Contribution
              </Button>
              <Button variant="outlined" fullWidth onClick={() => navigate('/meetings')}>
                Request Meeting
              </Button>
              <Button 
                variant="outlined" 
                color="success" 
                fullWidth 
                onClick={() => navigate('/certificates')}
                disabled={activeProject?.completionStatus !== 'APPROVED'}
              >
                Download Certificate
              </Button>
            </Paper>

            {/* Notifications Panel */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon color="primary" />
                  </Badge>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>Notifications</Typography>
                </Box>
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No notifications yet.
                </Typography>
              ) : (
                <List sx={{ maxHeight: 300, overflowY: 'auto', p: 0 }}>
                  {notifications.map((notif) => (
                    <ListItem 
                      key={notif.id} 
                      alignItems="flex-start"
                      sx={{ 
                        px: 1, 
                        py: 1.5,
                        borderBottom: '1px solid #f0ebe3',
                        bgcolor: notif.readStatus ? 'transparent' : 'rgba(212, 160, 23, 0.05)'
                      }}
                      secondaryAction={
                        !notif.readStatus && (
                          <IconButton edge="end" size="small" onClick={() => handleMarkAsRead(notif.id)} title="Mark as read">
                            <MarkEmailReadIcon fontSize="small" color="primary" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: notif.readStatus ? 500 : 700, pr: 3 }}>
                            {notif.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              {notif.message}
                            </Typography>
                            {notif.projectTitle && (
                              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'secondary.main', display: 'block', mt: 0.5 }}>
                                Project: {notif.projectTitle}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

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

export default StudentDashboard;
