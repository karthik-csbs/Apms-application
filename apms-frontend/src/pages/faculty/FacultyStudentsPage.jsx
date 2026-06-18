import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, TextField, InputAdornment, TablePagination, TableSortLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { facultyService } from '../../services/facultyService';

const FacultyStudentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  // Pagination, Sort & Search State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, search, sortBy, sortDir]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await facultyService.getStudents({
        search,
        page,
        size: rowsPerPage,
        sortBy,
        sortDir
      });
      if (data) {
        setStudents(data.content || []);
        setTotalCount(data.totalElements !== undefined ? data.totalElements : (data.length || 0));
      }
    } catch (err) {
      console.error('Failed to load faculty students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = sortBy === property && sortDir === 'asc';
    setSortDir(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 500, mb: 3, color: '#1a0a0a' }}>My Students</Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Assigned Student Roster</Typography>
          <TextField
            size="small"
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 280 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : students.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No students assigned to you yet.</Typography>
        ) : (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortDir : 'asc'}
                        onClick={() => handleRequestSort('name')}
                      >
                        Student
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'registerNumber'}
                        direction={sortBy === 'registerNumber' ? sortDir : 'asc'}
                        onClick={() => handleRequestSort('registerNumber')}
                      >
                        Register No.
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'email'}
                        direction={sortBy === 'email' ? sortDir : 'asc'}
                        onClick={() => handleRequestSort('email')}
                      >
                        Email
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Skills</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((st, index) => (
                    <TableRow key={st.id}>
                      <TableCell>{(page * rowsPerPage) + index + 1}</TableCell>
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
          </>
        )}
      </Paper>
    </Box>
  );
};

export default FacultyStudentsPage;
