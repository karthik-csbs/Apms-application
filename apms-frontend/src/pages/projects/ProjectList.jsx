import React, { useState } from 'react';
import { Box, Typography, Button, Paper, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../../components/DataTable';

const ProjectList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'type', label: 'Type', minWidth: 100 },
    { id: 'department', label: 'Department', minWidth: 130 },
    { id: 'duration', label: 'Duration (Weeks)', minWidth: 100, numeric: true },
    { id: 'status', label: 'Status', minWidth: 100 },
  ];

  const rows = [
    { id: 1, title: 'AI based Disease Prediction', type: 'Main', department: 'Computer Science', duration: 12, status: 'Active' },
    { id: 2, title: 'E-commerce Mobile App', type: 'Mini', department: 'Computer Science', duration: 6, status: 'Completed' },
    { id: 3, title: 'Smart Home IoT', type: 'Main', department: 'Electronics', duration: 12, status: 'Active' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Project Management</Typography>
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

        <DataTable
          columns={columns}
          data={rows}
          totalCount={rows.length}
          page={0}
          rowsPerPage={10}
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

export default ProjectList;
