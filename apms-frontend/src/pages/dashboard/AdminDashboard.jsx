import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Computer Science', projects: 45 },
  { name: 'Information Tech', projects: 38 },
  { name: 'Electronics', projects: 28 },
  { name: 'Mechanical', projects: 32 },
];

const StatCard = ({ title, value, color }) => (
  <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, borderTop: `4px solid ${color}` }}>
    <Typography component="h2" variant="h6" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography component="p" variant="h3" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
      {value}
    </Typography>
  </Paper>
);

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Departments" value="8" color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Faculty" value="124" color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Students" value="856" color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Projects" value="215" color="#9c27b0" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Projects per Department
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="projects" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • New HOD assigned to Computer Science
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • 15 new faculty members onboarded
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Final year project guidelines published
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
