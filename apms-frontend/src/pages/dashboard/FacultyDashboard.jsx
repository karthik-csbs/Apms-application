import React from 'react';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';

const FacultyDashboard = () => {
  // Dummy data for initial display, this should be replaced with API calls
  const columns = [
    { id: 'title', label: 'Project Title', minWidth: 170 },
    { id: 'student', label: 'Lead Student', minWidth: 100 },
    { id: 'type', label: 'Type', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100 },
    {
      id: 'action',
      label: 'Action',
      minWidth: 100,
      render: (value, row) => (
        <Button size="small" variant="outlined" color="primary">
          View
        </Button>
      ),
    },
  ];

  const rows = [
    { id: 1, title: 'AI based Disease Prediction', student: 'John Doe', type: 'Main', status: 'In Progress' },
    { id: 2, title: 'E-commerce App', student: 'Jane Smith', type: 'Mini', status: 'Completed' },
    { id: 3, title: 'Smart Home IoT', student: 'Bob Wilson', type: 'Main', status: 'Pending Review' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Faculty Dashboard</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Project
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #1976d2' }}>
            <Typography variant="h6" color="text.secondary">Assigned Students</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>32</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #ff9800' }}>
            <Typography variant="h6" color="text.secondary">Pending Approvals</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>5</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #4caf50' }}>
            <Typography variant="h6" color="text.secondary">Completed Projects</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>12</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Projects</Typography>
        <DataTable
          columns={columns}
          data={rows}
          totalCount={rows.length}
          page={0}
          rowsPerPage={5}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          orderBy="title"
          orderDirection="asc"
          onSort={() => {}}
        />
      </Paper>
    </Box>
  );
};

export default FacultyDashboard;
