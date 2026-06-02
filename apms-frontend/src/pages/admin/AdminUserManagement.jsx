import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Snackbar, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Card, CardContent
} from '@mui/material';
import { studentService } from '../../services/studentService';
import api from '../../services/api';

const DEPARTMENTS = [
  { id: 1, name: 'Computer Science and Engineering' },
  { id: 2, name: 'Electronics and Communication' },
  { id: 3, name: 'Mechanical Engineering' },
  { id: 4, name: 'Civil Engineering' },
  { id: 5, name: 'Information Technology' }
];

const ROLES = [
  { id: 'FACULTY', label: 'Faculty Guide' },
  { id: 'HOD', label: 'Head of Department' },
  { id: 'PRINCIPAL', label: 'Principal' }
];

const AdminUserManagement = () => {
  const [role, setRole] = useState('FACULTY');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    designation: '',
    departmentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await studentService.getAll();
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || (role !== 'PRINCIPAL' && (!form.designation || !form.departmentId))) {
      setAlert({ show: true, message: 'Please fill in all required fields.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      let endpoint = `/admin/register/${role.toLowerCase()}`;
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(role !== 'PRINCIPAL' && {
          designation: form.designation,
          departmentId: Number(form.departmentId)
        })
      };

      await api.post(endpoint, payload);
      setAlert({ show: true, message: `${role} registered successfully!`, severity: 'success' });
      setForm({ name: '', email: '', password: '', designation: '', departmentId: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register user.';
      setAlert({ show: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 500, mb: 3, color: '#1a0a0a' }}>User Management</Typography>
      
      <Grid container spacing={3}>
        {/* Left: Register Form */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderTop: '4px solid #8b1a1a' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Onboard Institutional Staff</Typography>
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Role to Register</InputLabel>
                  <Select value={role} label="Role to Register" onChange={(e) => setRole(e.target.value)}>
                    {ROLES.map(r => (
                      <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  sx={{ mb: 2 }}
                  required
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  sx={{ mb: 2 }}
                  required
                  helperText="Must be at least 8 characters"
                />

                {role !== 'PRINCIPAL' && (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      label="Designation"
                      name="designation"
                      value={form.designation}
                      onChange={handleChange}
                      sx={{ mb: 2 }}
                      required
                    />

                    <FormControl fullWidth size="small" sx={{ mb: 2 }} required>
                      <InputLabel>Department</InputLabel>
                      <Select
                        name="departmentId"
                        value={form.departmentId}
                        label="Department"
                        onChange={handleChange}
                      >
                        {DEPARTMENTS.map(d => (
                          <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ bgcolor: '#8b1a1a', '&:hover': { bgcolor: '#a01f1f' } }}
                >
                  {loading ? 'Registering...' : 'Register User'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Students Table */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Registered Students</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Register No.</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingStudents ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Loading students...</TableCell>
                    </TableRow>
                  ) : students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No students registered yet</TableCell>
                    </TableRow>
                  ) : (
                    students.map((st) => (
                      <TableRow key={st.id}>
                        <TableCell sx={{ fontWeight: 500 }}>{st.name}</TableCell>
                        <TableCell><Chip label={st.registerNumber} size="small" variant="outlined" /></TableCell>
                        <TableCell>{st.email}</TableCell>
                        <TableCell>{st.departmentName || 'CSE'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

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

export default AdminUserManagement;
