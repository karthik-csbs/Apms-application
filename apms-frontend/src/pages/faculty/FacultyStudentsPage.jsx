import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar } from '@mui/material';
import { facultyService } from '../../services/facultyService';

const FacultyStudentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await facultyService.getStudents();
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load faculty students', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 500, mb: 3, color: '#1a0a0a' }}>My Students</Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Assigned Student Roster</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : students.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No students assigned to you yet.</Typography>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Register No.</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Skills</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((st) => (
                  <TableRow key={st.id}>
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#8b1a1a', width: 32, height: 32, fontSize: 13 }}>
                        {st.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 500 }}>{st.name}</Typography>
                    </TableCell>
                    <TableCell><Chip label={st.registerNumber} size="small" variant="outlined" /></TableCell>
                    <TableCell>{st.email}</TableCell>
                    <TableCell>{st.departmentName || 'Computer Science'}</TableCell>
                    <TableCell>
                      {st.skills ? (
                        st.skills.split(',').map((skill, index) => (
                          <Chip key={index} label={skill.trim()} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default FacultyStudentsPage;
