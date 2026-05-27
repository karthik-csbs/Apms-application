import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, TextField, InputAdornment, 
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, FormControl, InputLabel, 
  Select, MenuItem, Autocomplete, Chip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { projectService } from '../../services/projectService';
import { studentService } from '../../services/studentService';
import { AuthContext } from '../../context/AuthContext';

const ProjectList = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [duration, setDuration] = useState('');
  const [projectType, setProjectType] = useState('MAIN');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [teamLeadId, setTeamLeadId] = useState('');

  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchData();
  }, [user]);

  const handleApiError = (err) => {
    if (!err.response) {
      setAlert({ show: true, message: "Backend server is not running", severity: "error" });
      return;
    }

    switch (err.response.status) {
      case 401:
        setAlert({ show: true, message: "Session expired. Please login again.", severity: "error" });
        break;
      case 403:
        setAlert({ show: true, message: "Access denied.", severity: "error" });
        break;
      case 500:
        setAlert({ show: true, message: "Internal server error.", severity: "error" });
        break;
      default:
        setAlert({ show: true, message: "Something went wrong.", severity: "error" });
    }
  };

  const fetchData = async () => {
    try {
      if (projects.length === 0) {
        setLoading(true);
      }
      
      const [projectRes, studentRes] = await Promise.all([
        projectService.getFacultyProjects(),
        studentService.getAll()
      ]);

      const projList = projectRes?.data || projectRes || [];
      const studList = studentRes?.data || studentRes || [];

      if (Array.isArray(projList)) {
        setProjects(projList);
      }

      if (Array.isArray(studList)) {
        setStudents(studList);
      }

    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setSelectedProjectId(null);
    setTitle('');
    setDescription('');
    setTechnologiesText('');
    setDuration('');
    setProjectType('MAIN');
    setSelectedStudents([]);
    setTeamLeadId('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (project) => {
    setIsEditMode(true);
    setSelectedProjectId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setTechnologiesText(project.technologies ? project.technologies.join(', ') : '');
    setDuration(project.duration);
    setProjectType(project.projectType || 'MAIN');
    
    // Map existing team members to selection list
    const currentMembers = project.teamMembers?.map(m => {
      const fullStudent = students.find(s => s.id === m.studentId);
      return fullStudent || { id: m.studentId, name: m.studentName, registerNumber: m.registerNumber };
    }) || [];
    
    setSelectedStudents(currentMembers);

    const lead = project.teamMembers?.find(m => m.role === 'TEAM_LEAD' || m.isTeamLead);
    setTeamLeadId(lead ? lead.studentId : '');

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!submitting) {
      setDialogOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!duration.trim()) {
      setAlert({ show: true, message: 'Please fill in all required fields.', severity: 'error' });
      return;
    }

    if (!isEditMode && selectedStudents.length === 0) {
      setAlert({ show: true, message: 'At least one student must be assigned.', severity: 'error' });
      return;
    }

    if (!isEditMode && !teamLeadId) {
      setAlert({ show: true, message: 'Please select a Team Lead.', severity: 'error' });
      return;
    }

    try {
      setSubmitting(true);

      const payload = isEditMode
        ? {
            duration,
            projectType
          }
        : {
            duration,
            projectType,
            studentIds: selectedStudents.map(s => s.id),
            teamLeadId: Number(teamLeadId)
          };

      if (isEditMode) {
        await projectService.update(selectedProjectId, payload);
        setAlert({ show: true, message: 'Project updated successfully!', severity: 'success' });
      } else {
        await projectService.create(payload);
        setAlert({ show: true, message: 'Project created successfully!', severity: 'success' });
      }

      setDialogOpen(false);
      
      // Reload projects and students lists
      await fetchData();

    } catch (err) {
      console.error('Failed to save project', err);
      const errMsg = err.response?.data?.message || 'Error occurred while saving project.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.projectType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.completionStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>Project Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Create Project
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects by title, type, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Team Lead</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((p) => {
                    const lead = p.teamMembers?.find(m => m.role === 'TEAM_LEAD' || m.isTeamLead);
                    return (
                      <TableRow key={p.id}>
                        <TableCell sx={{ fontWeight: 500 }}>{p.title}</TableCell>
                        <TableCell><Chip label={p.projectType} size="small" variant="outlined" /></TableCell>
                        <TableCell>{p.duration} Weeks</TableCell>
                        <TableCell>
                          <Chip 
                            label={p.completionStatus || 'ACTIVE'} 
                            color={p.completionStatus === 'APPROVED' ? 'success' : (p.completionStatus === 'PENDING_APPROVAL' ? 'warning' : 'primary')}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{lead ? lead.studentName : 'Not assigned'}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenEditDialog(p)} color="primary" size="small" title="Edit details">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Project Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 500 }}>
          {isEditMode ? 'Edit Project Details' : 'Create New Project'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (Weeks)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  variant="outlined"
                  required
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="project-type-label">Project Type</InputLabel>
                  <Select
                    labelId="project-type-label"
                    value={projectType}
                    label="Project Type"
                    onChange={(e) => setProjectType(e.target.value)}
                    disabled={submitting}
                  >
                    <MenuItem value="MICRO">MICRO</MenuItem>
                    <MenuItem value="MINI">MINI</MenuItem>
                    <MenuItem value="MAIN">MAIN</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Student Assignment: Hide or read-only during edit mode as per system requirements */}
              {!isEditMode && (
                <>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={students}
                      getOptionLabel={(option) => option ? `${option.name} (${option.registerNumber})` : ''}
                      value={selectedStudents}
                      onChange={(event, newValue) => {
                        setSelectedStudents(newValue);
                        // Reset team lead if selected students change and team lead is not in the list
                        if (newValue.length > 0) {
                          if (!newValue.some(s => s.id === Number(teamLeadId))) {
                            setTeamLeadId(newValue[0].id.toString());
                          }
                        } else {
                          setTeamLeadId('');
                        }
                      }}
                      disabled={submitting}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          variant="outlined" 
                          label="Assign Students" 
                          placeholder="Search students..." 
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...chipProps } = getTagProps({ index });
                          return (
                            <Chip 
                              key={key}
                              label={option.name} 
                              {...chipProps} 
                              color="primary" 
                              variant="outlined" 
                            />
                          );
                        })
                      }
                    />
                  </Grid>

                  {selectedStudents.length > 0 && (
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel id="team-lead-label">Select Team Lead</InputLabel>
                        <Select
                          labelId="team-lead-label"
                          value={teamLeadId}
                          label="Select Team Lead"
                          onChange={(e) => setTeamLeadId(e.target.value)}
                          disabled={submitting}
                        >
                          {selectedStudents.map(s => (
                            <MenuItem key={s.id} value={s.id}>{s.name} ({s.registerNumber})</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditMode ? 'Update Details' : 'Create Project')}
            </Button>
          </DialogActions>
        </Box>
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

export default ProjectList;
