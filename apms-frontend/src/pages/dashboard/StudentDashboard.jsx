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
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { notificationService } from '../../services/notificationService';

const StudentDashboard = () => {
  const { user, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [activeProject, setActiveProject] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  // Editable project detail fields
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  const fetchedRef = useRef(false);

  // ─── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || authLoading || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchDashboardData = async (retryCount = 0) => {
    try {
      if (projects.length === 0) setLoading(true);

      const [projectRes, notifRes] = await Promise.all([
        projectService.getStudentProjects(),
        notificationService.getAll()
      ]);

      const projList = projectRes || [];
      const notifList = notifRes || [];

      // Only replace projects if we have a successful non-empty result or initially empty
      setProjects(prev => (projList.length > 0 ? projList : prev));
      setNotifications(notifList);

      if (projList.length > 0) {
        const stillExists = projList.find(p => Number(p.id) === Number(selectedProjectId));
        const project = stillExists || projList[0];
        setSelectedProjectId(String(project.id));
        setActiveProject(project);
      } else {
        setActiveProject(null);
      }
    } catch (err) {
      if (retryCount < 1) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchDashboardData(retryCount + 1);
      }
      if (!err.response) {
        setAlert({ show: true, message: 'Backend server is not running', severity: 'error' });
        return;
      }
      const msgs = { 401: 'Session expired. Please login again.', 403: 'Access denied.', 500: 'Internal server error.' };
      setAlert({ show: true, message: msgs[err.response.status] || 'Something went wrong.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Sync form fields whenever active project changes ─────────────────────
  useEffect(() => {
    if (!activeProject) return;
    setTitleInput(activeProject.title && activeProject.title !== 'Untitled Project' ? activeProject.title : '');
    setDescInput(activeProject.description || '');
    setTechInput(activeProject.technologies?.join(', ') || '');
  }, [activeProject]);

  // ─── Project switcher ────────────────────────────────────────────────────────
  const handleProjectChange = (e) => {
    const id = e.target.value;
    setSelectedProjectId(id);
    const selected = projects.find(p => Number(p.id) === Number(id));
    setActiveProject(selected || null);
  };

  // ─── Notifications ────────────────────────────────────────────────────────────
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch {
      setAlert({ show: true, message: 'Failed to update notification', severity: 'error' });
    }
  };

  // ─── Role helper ─────────────────────────────────────────────────────────────
  const getMyRole = (project) => {
    if (!project?.teamMembers) return 'MEMBER';
    const member = project.teamMembers.find(m => m.studentId === user?.id);
    return member?.role || 'MEMBER';
  };

  // ─── Save project details (Team Lead only) ────────────────────────────────
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
        title: titleInput.trim(),
        description: descInput.trim(),
        technologies: techList
      };

      const updated = await projectService.updateTeamLead(activeProject.id, payload);

      // Update both the active project and the projects list so the
      // faculty dashboard table reflects the new title/technologies immediately.
      setActiveProject(updated);
      setProjects(prev => prev.map(p => p.id === activeProject.id ? updated : p));

      setAlert({ show: true, message: 'Project details saved successfully!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update project details.';
      setAlert({ show: true, message: msg, severity: 'error' });
    } finally {
      setSavingDetails(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;
  const isTeamLead = getMyRole(activeProject) === 'TEAM_LEAD';
  const isApproved = activeProject?.completionStatus === 'APPROVED';
  const canEdit = isTeamLead && !isApproved;

  // ─── Loading skeleton ────────────────────────────────────────────────────────
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
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>Student Dashboard</Typography>

        {/* Project switcher — shown when student has multiple projects */}
        {projects.length > 1 && (
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel id="project-select-label">Active Project</InputLabel>
            <Select
              labelId="project-select-label"
              value={selectedProjectId}
              label="Active Project"
              onChange={handleProjectChange}
            >
              {projects.map(p => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.title || 'Untitled Project'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* ── No projects ── */}
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

          {/* ── Left: Project details ── */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              {activeProject && (
                <>
                  {/* Status chips row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={isTeamLead ? 'Team Lead' : 'Team Member'}
                        color="secondary"
                        variant="filled"
                        size="small"
                      />
                      <Chip label={activeProject.projectType || 'MAIN'} variant="outlined" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={activeProject.status || 'PENDING'}
                        color={activeProject.status === 'COMPLETED' ? 'success' : 'primary'}
                        variant="outlined"
                        size="small"
                      />
                      {activeProject.completionStatus && (
                        <Chip
                          label={`Submission: ${activeProject.completionStatus}`}
                          color={
                            activeProject.completionStatus === 'APPROVED' ? 'success' :
                            activeProject.completionStatus === 'REJECTED' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>

                  {/* ── Editable fields ── */}
                  <Grid container spacing={2.5} sx={{ mb: 3 }}>

                    {/* Title — the student selects/changes the project title here */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Project Title"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        variant="outlined"
                        size="small"
                        disabled={!canEdit}
                        helperText={
                          canEdit
                            ? 'As team lead, you can set or change the project title.'
                            : isApproved
                              ? 'Project is approved — no further edits allowed.'
                              : 'Only the team lead can edit this field.'
                        }
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
                        disabled={!canEdit}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Technologies Used"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        variant="outlined"
                        size="small"
                        placeholder="e.g. Java, React, OpenCV"
                        disabled={!canEdit}
                        helperText={canEdit ? 'Separate technologies with commas.' : ''}
                      />
                    </Grid>

                    {canEdit && (
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

                  {/* Meta info */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Faculty Guide:</strong> {activeProject.facultyGuideName || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Duration:</strong> {activeProject.duration} Weeks
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Team Lead:</strong>{' '}
                        {activeProject.teamMembers?.find(m => m.role === 'TEAM_LEAD' || m.isTeamLead)?.studentName || 'Not assigned'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Team table */}
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
                        {activeProject.teamMembers?.map((m) => (
                          <TableRow key={m.studentId} selected={m.studentId === user?.id}>
                            <TableCell sx={{ fontWeight: m.studentId === user?.id ? 'bold' : 'normal' }}>
                              {m.studentName}{m.studentId === user?.id ? ' (You)' : ''}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={m.role === 'TEAM_LEAD' || m.isTeamLead ? 'Team Lead' : 'Member'}
                                color={m.role === 'TEAM_LEAD' || m.isTeamLead ? 'primary' : 'default'}
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

          {/* ── Right sidebar ── */}
          <Grid item xs={12} lg={4}>

            {/* Quick actions */}
            <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>Quick Actions</Typography>
              <Button
                variant="contained"
                startIcon={<FileUploadIcon />}
                fullWidth
                onClick={() => navigate(`/my-project?projectId=${selectedProjectId}`)}
                disabled={isApproved || activeProject?.completionStatus === 'PENDING_APPROVAL'}
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
                disabled={!isApproved}
              >
                Download Certificate
              </Button>
            </Paper>

            {/* Notifications */}
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
                <List sx={{ maxHeight: 320, overflowY: 'auto', p: 0 }}>
                  {notifications.map((notif) => (
                    <ListItem
                      key={notif.id}
                      alignItems="flex-start"
                      sx={{
                        px: 1, py: 1.5,
                        borderBottom: '1px solid #f0ebe3',
                        bgcolor: notif.readStatus ? 'transparent' : 'rgba(212,160,23,0.05)'
                      }}
                      secondaryAction={
                        !notif.readStatus && (
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleMarkAsRead(notif.id)}
                            title="Mark as read"
                          >
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
        <Alert
          onClose={() => setAlert({ ...alert, show: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentDashboard;