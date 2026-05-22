import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, InputAdornment, CircularProgress, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../../components/DataTable';
import { projectService } from '../../services/projectService';

const ProjectList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getAll({ size: 100 });
      const projectList = projectData?.data?.content || projectData?.content || [];
      
      const rows = projectList.map(p => ({
        id: p.id,
        title: p.title,
        type: p.projectType || 'Main',
        department: p.departmentName || p.department || 'Computer Science',
        duration: p.duration || 12,
        status: p.completionStatus === 'APPROVED' ? 'Completed' : (p.completionStatus === 'PENDING_APPROVAL' ? 'Pending Review' : 'Active')
      }));

      setProjects(rows.length > 0 ? rows : [
        { id: 1, title: 'AI based Disease Prediction', type: 'Main', department: 'Computer Science', duration: 12, status: 'Active' },
        { id: 2, title: 'E-commerce Mobile App', type: 'Mini', department: 'Computer Science', duration: 6, status: 'Completed' },
        { id: 3, title: 'Smart Home IoT', type: 'Main', department: 'Electronics', duration: 12, status: 'Active' },
      ]);
    } catch (err) {
      console.error('Failed to load projects list', err);
      setErrorMsg('Failed to connect to backend APIs. Using offline state.');
      setShowError(true);
      setProjects([
        { id: 1, title: 'AI based Disease Prediction', type: 'Main', department: 'Computer Science', duration: 12, status: 'Active' },
        { id: 2, title: 'E-commerce Mobile App', type: 'Mini', department: 'Computer Science', duration: 6, status: 'Completed' },
        { id: 3, title: 'Smart Home IoT', type: 'Main', department: 'Electronics', duration: 12, status: 'Active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'type', label: 'Type', minWidth: 100 },
    { id: 'department', label: 'Department', minWidth: 130 },
    { id: 'duration', label: 'Duration (Weeks)', minWidth: 100, numeric: true },
    { id: 'status', label: 'Status', minWidth: 100 },
  ];

  // Filter projects by search term
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>Project Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create Project
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects..."
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
          <DataTable
            columns={columns}
            data={filteredProjects}
            totalCount={filteredProjects.length}
            page={0}
            rowsPerPage={10}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            orderBy="title"
            orderDirection="asc"
            onSort={() => {}}
          />
        )}
      </Paper>

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

export default ProjectList;
