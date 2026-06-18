import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Button, Paper, TextField, InputAdornment, 
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, FormControl, InputLabel, 
  Select, MenuItem, Autocomplete, Chip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Grid, TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import ExportButton from '../../components/ExportButton';
import { projectService } from '../../services/projectService';
import { studentService } from '../../services/studentService';
import { AuthContext } from '../../context/AuthContext';

const ProjectList = () => {
  const { user, authLoading } = useContext(AuthContext);
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

  // Pagination & Sorting State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    if (!user || authLoading) return;

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, page, rowsPerPage, searchTerm, sortBy, sortDir]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Load Faculty Projects with search & pagination parameters
      let projRes;
      try {
        projRes = await projectService.getFacultyProjects({
          search: searchTerm,
          page,
          size: rowsPerPage,
          sortBy,
          sortDir
        });
      } catch (firstErr) {
        console.warn('First attempt to fetch projects failed, retrying once', firstErr);
        projRes = await projectService.getFacultyProjects({
          search: searchTerm,
          page,
          size: rowsPerPage,
          sortBy,
          sortDir
        });
      }

      if (projRes) {
        setProjects(projRes.content || projRes || []);
        setTotalCount(projRes.totalElements !== undefined ? projRes.totalElements : (projRes.length || 0));
      }

      // Load all students for the dropdown selection with one retry
      let studentRes;
      try {
        studentRes = await studentService.getAll();
      } catch (firstErr) {
        console.warn('First attempt to fetch students failed, retrying once', firstErr);
        studentRes = await studentService.getAll();
      }

      if (studentRes && Array.isArray(studentRes)) {
        setStudents(studentRes);
      }

    } catch (err) {
      console.error('Failed to load projects list or students list', err);
      const status = err?.response?.status;
      let message = 'Server error occurred.';
      if (!err?.response) message = 'Backend server is not running.';
      else if (status === 401) message = 'Session expired. Please login again.';
      else if (status === 403) message = 'You do not have permission.';

      setAlert({
        show: true,
        message,
        severity: 'warning'
      });
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



  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>Project Management</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <ExportButton reportType="project" disabled={loading} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
            Create Project
          </Button>
        </Stack>
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
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Team Lead</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No projects found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((p, index) => {
                      const lead = p.teamMembers?.find(m => m.role === 'TEAM_LEAD' || m.isTeamLead);
                      return (
                        <TableRow key={p.id}>
                          <TableCell>{(page * rowsPerPage) + index + 1}</TableCell>
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Box>
          </>
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
