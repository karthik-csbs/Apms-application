import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const projectStatusData = [
  { name: 'Completed', value: 45 },
  { name: 'In Progress', value: 120 },
  { name: 'Pending Review', value: 15 },
  { name: 'Rejected', value: 5 },
];

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336'];

const HodDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        HOD Dashboard - Computer Science
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #1976d2' }}>
            <Typography variant="h6" color="text.secondary">Total Faculty</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>24</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #2e7d32' }}>
            <Typography variant="h6" color="text.secondary">Total Students</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>240</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #9c27b0' }}>
            <Typography variant="h6" color="text.secondary">Total Projects</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>185</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom align="center">
              Project Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Faculty Workload (Projects Assigned)
            </Typography>
            {/* We will implement a list or another chart here */}
            <Typography variant="body2" color="text.secondary">
              Dr. Smith: 8 projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prof. Johnson: 12 projects
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dr. Williams: 6 projects
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HodDashboard;
