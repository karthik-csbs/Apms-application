import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Box, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';
import { facultyService } from '../../services/facultyService';
import { AuthContext } from '../../context/AuthContext';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [stats, setStats] = useState({
    assignedStudents: 0,
    pendingApprovals: 0,
    completedProjects: 0
  });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchFacultyData();
    }
  }, [user, authLoading]);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const [projectsRes, studentsRes] = await Promise.allSettled([
        facultyService.getProjects(),
        facultyService.getStudents()
      ]);

      const isProjectsRejected = projectsRes.status === 'rejected';
      const isStudentsRejected = studentsRes.status === 'rejected';

      const projectList = !isProjectsRejected
        ? (projectsRes.value || [])
        : [];

      const studentList = !isStudentsRejected
        ? (studentsRes.value || [])
        : [];

      // Calculate stats
      const assignedStudents = isStudentsRejected ? 32 : studentList.length;
      const pendingApprovals = projectList.filter(p => p.completionStatus === 'PENDING_APPROVAL').length;
      const completedProjects = projectList.filter(p => p.status === 'COMPLETED').length;

      // Map rows for DataTable
      const rows = projectList.map(p => {
        const leadMember = p.teamMembers?.find(m => m.role === 'TEAM_LEAD' || m.isTeamLead || m.teamLead);
        const firstMember = p.teamMembers?.[0];
        const studentName = leadMember?.studentName || firstMember?.studentName || 'Student Team';
        
        return {
          id: p.id,
          title: p.title,
          student: studentName,
          type: p.projectType || 'Main',
          status: p.completionStatus === 'PENDING_APPROVAL' ? 'Pending Review' : (p.status === 'COMPLETED' ? 'Completed' : 'In Progress'),
          raw: p
        };
      });

      if (isProjectsRejected) {
        setErrorMsg(projectsRes.reason?.response?.data?.message || projectsRes.reason?.message || 'Failed to fetch projects.');
        setShowError(true);
        setProjects([]);
      } else {
        setProjects(rows);
      }

      setStats({
        assignedStudents,
        pendingApprovals,
        completedProjects
      });

      if (isStudentsRejected) {
        setErrorMsg(studentsRes.reason?.response?.data?.message || studentsRes.reason?.message || 'Failed to fetch students.');
        setShowError(true);
      }
    } catch (err) {
      console.error('Failed to load faculty dashboard data', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to connect to backend APIs.');
      setShowError(true);
      setStats({
        assignedStudents: 0,
        pendingApprovals: 0,
        completedProjects: 0
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

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
        <Button 
          size="small" 
          variant="outlined" 
          color="primary"
          onClick={() => navigate('/submissions')}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>Faculty Dashboard</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects')}
        >
          New Project
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{
            p: 3, textAlign: 'center', borderLeft: '5px solid #1976d2',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px 0 rgba(0,0,0,0.08)' }
          }}>
            <Typography variant="h6" color="text.secondary">Assigned Students</Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.assignedStudents}</Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{
            p: 3, textAlign: 'center', borderLeft: '5px solid #ff9800',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px 0 rgba(0,0,0,0.08)' }
          }}>
            <Typography variant="h6" color="text.secondary">Pending Approvals</Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.pendingApprovals}</Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{
            p: 3, textAlign: 'center', borderLeft: '5px solid #4caf50',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px 0 rgba(0,0,0,0.08)' }
          }}>
            <Typography variant="h6" color="text.secondary">Completed Projects</Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.completedProjects}</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Recent Projects</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={projects}
            totalCount={projects.length}
            page={0}
            rowsPerPage={5}
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

export default FacultyDashboard;
