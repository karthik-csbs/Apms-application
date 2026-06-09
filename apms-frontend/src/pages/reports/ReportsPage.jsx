import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Card, CardContent
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import ExportButtons from '../../components/ExportButtons';

const DEPARTMENTS = [
  { id: 1, label: 'Computer Science and Engineering' },
  { id: 2, label: 'Electronics and Communication' },
  { id: 3, label: 'Information Technology' }
];

const PROJECT_TYPES = ['MINI', 'MICRO', 'MAIN'];

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState([]);
  
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    departmentId: '',
    facultyId: '',
    projectType: '',
    status: ''
  });

  const reportTypes = ['project', 'review', 'faculty-load', 'submission'];
  const currentReportType = reportTypes[tabIndex];

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [tabIndex, filters]);

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await reportService.getDashboardSummary();
      setSummary(res.data || res);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const cleanParams = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '') {
          cleanParams[key] = filters[key];
        }
      });

      let res;
      if (currentReportType === 'project') {
        res = await reportService.getProjectReport(cleanParams);
      } else if (currentReportType === 'review') {
        res = await reportService.getReviewReport(cleanParams);
      } else if (currentReportType === 'faculty-load') {
        res = await reportService.getFacultyLoadReport(cleanParams);
      } else if (currentReportType === 'submission') {
        res = await reportService.getSubmissionReport(cleanParams);
      }

      setReportData(res?.data || res || []);
    } catch (err) {
      console.error('Failed to load report data', err);
      setError('Failed to retrieve report data. Please check filters or try again.');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      departmentId: '',
      facultyId: '',
      projectType: '',
      status: ''
    });
  };

  const getColumnHeaders = () => {
    switch (currentReportType) {
      case 'project':
        return ['Project ID', 'Title', 'Type', 'Project Status', 'Workflow Status', 'Guide Name', 'Team Name', 'Created Date', 'Completed Date'];
      case 'review':
        return ['Review ID', 'Project Name', 'Reviewer', 'Stage', 'Review Date', 'Score', 'Comments', 'Status'];
      case 'faculty-load':
        return ['Faculty ID', 'Faculty Name', 'Department', 'Assigned Projects', 'Completed Projects', 'Pending Reviews', 'Active Reviews'];
      case 'submission':
        return ['Submission ID', 'Project Name', 'Submitted By', 'Submission Date', 'GitHub URL', 'Documentation URL', 'Status'];
      default:
        return [];
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 500, color: '#1a0a0a' }}>Reports & Exports</Typography>
        <ExportButtons reportType={currentReportType} params={filters} />
      </Box>

      {summary && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} md={2.4}>
            <Card sx={{ borderLeft: '4px solid #1976d2' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography color="text.secondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Total Projects</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>{summary.totalProjects ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <Card sx={{ borderLeft: '4px solid #2e7d32' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography color="text.secondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Completed Projects</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>{summary.completedProjects ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <Card sx={{ borderLeft: '4px solid #ed6c02' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography color="text.secondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Pending Reviews</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>{summary.pendingReviews ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <Card sx={{ borderLeft: '4px solid #9c27b0' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography color="text.secondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Faculty Load Count</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>{summary.facultyLoad ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <Card sx={{ borderLeft: '4px solid #0288d1' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography color="text.secondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Submissions</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>{summary.submissionCount ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Filters</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              label="From Date"
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              label="To Date"
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          {(user?.role === 'ADMIN' || user?.role === 'PRINCIPAL') && (
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                select
                label="Department"
                name="departmentId"
                value={filters.departmentId}
                onChange={handleFilterChange}
                fullWidth
                size="small"
              >
                <MenuItem value="">All Departments</MenuItem>
                {DEPARTMENTS.map(d => (
                  <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {user?.role !== 'FACULTY' && (
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                label="Faculty Guide ID"
                type="number"
                name="facultyId"
                value={filters.facultyId}
                onChange={handleFilterChange}
                fullWidth
                size="small"
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Project Type"
              name="projectType"
              value={filters.projectType}
              onChange={handleFilterChange}
              fullWidth
              size="small"
            >
              <MenuItem value="">All Types</MenuItem>
              {PROJECT_TYPES.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              fullWidth
              size="small"
              placeholder={currentReportType === 'project' ? 'ACTIVE / PENDING / COMPLETED' : 'Status'}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={1.5} sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="secondary" onClick={handleResetFilters} fullWidth size="small">
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newIdx) => setTabIndex(newIdx)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Projects Report" />
          <Tab label="Reviews Report" />
          <Tab label="Faculty Load Report" />
          <Tab label="Submissions Report" />
        </Tabs>

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <TableContainer sx={{ maxHeight: 440 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {getColumnHeaders().map((h, i) => (
                    <TableCell key={i} sx={{ fontWeight: 'bold', bgcolor: '#f5faf5' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={getColumnHeaders().length} align="center" sx={{ py: 3 }}>
                      No report records found matching the criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.map((row, idx) => (
                    <TableRow key={idx} hover>
                      {currentReportType === 'project' && (
                        <>
                          <TableCell>{row.projectId}</TableCell>
                          <TableCell>{row.projectTitle}</TableCell>
                          <TableCell>{row.projectType}</TableCell>
                          <TableCell>{row.projectStatus}</TableCell>
                          <TableCell>{row.workflowStatus}</TableCell>
                          <TableCell>{row.guideName}</TableCell>
                          <TableCell>{row.teamName}</TableCell>
                          <TableCell>{formatDate(row.createdDate)}</TableCell>
                          <TableCell>{formatDate(row.completedDate)}</TableCell>
                        </>
                      )}
                      {currentReportType === 'review' && (
                        <>
                          <TableCell>{row.reviewId}</TableCell>
                          <TableCell>{row.projectName}</TableCell>
                          <TableCell>{row.reviewer}</TableCell>
                          <TableCell>{row.stage}</TableCell>
                          <TableCell>{formatDate(row.reviewDate)}</TableCell>
                          <TableCell>{row.score || 'N/A'}</TableCell>
                          <TableCell>{row.comments || 'No comments'}</TableCell>
                          <TableCell>{row.status}</TableCell>
                        </>
                      )}
                      {currentReportType === 'faculty-load' && (
                        <>
                          <TableCell>{row.facultyId}</TableCell>
                          <TableCell>{row.facultyName}</TableCell>
                          <TableCell>{row.department}</TableCell>
                          <TableCell>{row.assignedProjects}</TableCell>
                          <TableCell>{row.completedProjects}</TableCell>
                          <TableCell>{row.pendingReviews}</TableCell>
                          <TableCell>{row.activeReviews}</TableCell>
                        </>
                      )}
                      {currentReportType === 'submission' && (
                        <>
                          <TableCell>{row.submissionId}</TableCell>
                          <TableCell>{row.projectName}</TableCell>
                          <TableCell>{row.submittedBy}</TableCell>
                          <TableCell>{formatDate(row.submissionDate)}</TableCell>
                          <TableCell>{row.gitHubUrl || 'N/A'}</TableCell>
                          <TableCell>{row.documentationUrl || 'N/A'}</TableCell>
                          <TableCell>{row.status}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ReportsPage;
