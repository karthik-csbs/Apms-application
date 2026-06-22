import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Card, CardContent, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment, IconButton, Tooltip, Chip, List, ListItem, ListItemText, Checkbox
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import { AuthContext } from '../../context/AuthContext';
import { meetingService } from '../../services/meetingService';

const MEETING_TYPES = [
  { value: 'PROJECT_MEETING', label: 'Project Meeting' },
  { value: 'STUDENT_MEETING', label: 'Student Meeting' },
  { value: 'FACULTY_MEETING', label: 'Faculty Meeting' },
  { value: 'REVIEW_MEETING', label: 'Review Meeting' },
  { value: 'DEPARTMENT_MEETING', label: 'Department Meeting' }
];

const MeetingsPage = () => {
  const { user } = useContext(AuthContext);

  // Table State
  const [meetings, setMeetings] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('meetingDate');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(false);

  // Form Dialog State
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    meetingType: 'PROJECT_MEETING',
    meetingDate: '',
    startTime: '',
    endTime: '',
    location: '',
    meetingLink: '',
    projectId: '',
    departmentId: '',
    participantIds: []
  });

  // Dropdown Lists
  const [projects, setProjects] = useState([]);
  const [dropdownUsers, setDropdownUsers] = useState([]);
  const [previewParticipants, setPreviewParticipants] = useState([]);

  // Fetch Meetings
  const loadMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetingService.getMyMeetings({
        page,
        size,
        search,
        sortBy,
        sortDir
      });
      if (res && res.success && res.data) {
        setMeetings(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load meetings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [page, size, search, sortBy, sortDir]);

  // Load contextual dropdowns
  useEffect(() => {
    if (open) {
      if (form.meetingType === 'PROJECT_MEETING' || form.meetingType === 'REVIEW_MEETING') {
        meetingService.getActiveProjects()
          .then(res => {
            if (res && res.success) setProjects(res.data || []);
          })
          .catch(err => console.error(err));
      }
      
      if (form.meetingType === 'STUDENT_MEETING') {
        meetingService.getUsersForDropdown('STUDENT')
          .then(res => {
            if (res && res.success) setDropdownUsers(res.data || []);
          })
          .catch(err => console.error(err));
      } else if (form.meetingType === 'FACULTY_MEETING') {
        meetingService.getUsersForDropdown('FACULTY')
          .then(res => {
            if (res && res.success) setDropdownUsers(res.data || []);
          })
          .catch(err => console.error(err));
      } else if (form.meetingType === 'REVIEW_MEETING') {
        meetingService.getUsersForDropdown('FACULTY')
          .then(res => {
            if (res && res.success) setDropdownUsers(res.data || []);
          })
          .catch(err => console.error(err));
      }
    }
  }, [open, form.meetingType]);

  // Handle Project Change - Auto-fetch Project Participants
  const handleProjectChange = async (projectId) => {
    setForm(prev => ({ ...prev, projectId }));
    if (!projectId) {
      setPreviewParticipants([]);
      return;
    }
    try {
      const res = await meetingService.getProjectParticipantsPreview(projectId);
      if (res && res.success) {
        setPreviewParticipants(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load project participants preview', err);
    }
  };

  const handleSelectUser = (userId) => {
    const isSelected = form.participantIds.includes(userId);
    const updated = isSelected 
      ? form.participantIds.filter(id => id !== userId)
      : [...form.participantIds, userId];
    
    setForm(prev => ({ ...prev, participantIds: updated }));

    // Update preview list
    const selectedDetails = dropdownUsers.filter(u => updated.includes(u.userId));
    setPreviewParticipants(selectedDetails);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.meetingDate || !form.startTime || !form.endTime) return;
    try {
      const payload = {
        title: form.title,
        description: form.description,
        meetingType: form.meetingType,
        meetingDate: form.meetingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        meetingLink: form.meetingLink,
        projectId: form.projectId || null,
        departmentId: form.departmentId || null,
        participantIds: form.participantIds
      };
      const res = await meetingService.createMeeting(payload);
      if (res && res.success) {
        setOpen(false);
        loadMeetings();
        resetForm();
      }
    } catch (err) {
      console.error('Failed to schedule meeting', err);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      meetingType: 'PROJECT_MEETING',
      meetingDate: '',
      startTime: '',
      endTime: '',
      location: '',
      meetingLink: '',
      projectId: '',
      departmentId: '',
      participantIds: []
    });
    setPreviewParticipants([]);
  };

  const handleCancelMeeting = async (id) => {
    if (window.confirm('Are you sure you want to cancel this meeting?')) {
      try {
        await meetingService.cancelMeeting(id);
        loadMeetings();
      } catch (err) {
        console.error('Failed to cancel meeting', err);
      }
    }
  };

  const isOrganizer = user?.role === 'FACULTY' || user?.role === 'HOD' || user?.role === 'ADMIN';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1a0a0a' }}>Meetings Portal</Typography>
          <Typography variant="body2" color="text.secondary">Schedule, manage, and attend targeted review and department meetings.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={loadMeetings} color="primary">
            <RefreshIcon />
          </IconButton>
          {isOrganizer && (
            <Button variant="contained" startIcon={<EventIcon />} onClick={() => setOpen(true)} sx={{ bgcolor: '#8b1a1a', '&:hover': { bgcolor: '#a01f1f' } }}>
              Schedule Meeting
            </Button>
          )}
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search meetings by title, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 300, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Meetings List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Meeting Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Location / Link</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Participants</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              {isOrganizer && <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {meetings.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{m.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{m.description}</Typography>
                  {m.projectTitle && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={`Project: ${m.projectTitle}`} size="small" variant="outlined" />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={m.meetingType.replace('_', ' ')} 
                    size="small" 
                    color={
                      m.meetingType === 'PROJECT_MEETING' ? 'primary' :
                      m.meetingType === 'REVIEW_MEETING' ? 'secondary' :
                      m.meetingType === 'DEPARTMENT_MEETING' ? 'warning' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{m.meetingDate}</Typography>
                  <Typography variant="caption" color="text.secondary">{m.startTime} - {m.endTime}</Typography>
                </TableCell>
                <TableCell>
                  {m.meetingLink ? (
                    <Button 
                      variant="text" 
                      size="small" 
                      startIcon={<LinkIcon />} 
                      href={m.meetingLink.startsWith('http') ? m.meetingLink : `https://${m.meetingLink}`} 
                      target="_blank"
                    >
                      Join Meeting
                    </Button>
                  ) : (
                    <Typography variant="body2">{m.location || 'No Venue Specified'}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title={m.participants?.map(p => `${p.name} (${p.participantRole})`).join(', ') || 'No participants'}>
                    <Chip avatar={<PeopleIcon />} label={`${m.participants?.length || 0} enrolled`} size="small" variant="outlined" clickable />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={m.status} 
                    size="small" 
                    color={m.status === 'SCHEDULED' ? 'success' : m.status === 'CANCELLED' ? 'error' : 'default'} 
                  />
                </TableCell>
                {isOrganizer && (
                  <TableCell align="right">
                    {m.status !== 'CANCELLED' && (
                      <Tooltip title="Cancel Meeting">
                        <IconButton size="small" color="error" onClick={() => handleCancelMeeting(m.id)}>
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {meetings.length === 0 && (
              <TableRow>
                <TableCell colSpan={isOrganizer ? 7 : 6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No meetings found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={size}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setSize(parseInt(e.target.value, 10))}
        />
      </TableContainer>

      {/* Schedule Meeting Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 600 }}>Schedule Targeted Meeting</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Meeting Topic / Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Meeting Type"
                  value={form.meetingType}
                  onChange={(e) => setForm({ ...form, meetingType: e.target.value, projectId: '', participantIds: [] })}
                  fullWidth
                >
                  {MEETING_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Project Selection / Dynamic options based on Meeting Type */}
            {(form.meetingType === 'PROJECT_MEETING' || form.meetingType === 'REVIEW_MEETING') && (
              <TextField
                select
                label="Select Project"
                value={form.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                fullWidth
                required
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Direct Participant selection for Student / Faculty Meetings */}
            {(form.meetingType === 'STUDENT_MEETING' || form.meetingType === 'FACULTY_MEETING') && (
              <Paper sx={{ p: 2, border: '1px solid #e0e0e0', maxHeight: 200, overflowY: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>Select Recipients</Typography>
                <List dense>
                  {dropdownUsers.map((u) => (
                    <ListItem key={u.userId} button onClick={() => handleSelectUser(u.userId)}>
                      <Checkbox
                        edge="start"
                        checked={form.participantIds.includes(u.userId)}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText primary={u.name} secondary={u.email} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Preview resolved participants */}
            {previewParticipants.length > 0 && (
              <Box sx={{ p: 2, bgcolor: '#fdfbf7', border: '1px dashed #d4a017', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="warning.dark" sx={{ mb: 1, fontWeight: 600 }}>
                  Recipient Preview (Auto-resolved):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {previewParticipants.map((p) => (
                    <Chip key={p.userId} label={`${p.name} (${p.role || p.participantRole})`} size="small" variant="outlined" color="primary" />
                  ))}
                </Box>
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Date"
                  type="date"
                  value={form.meetingDate}
                  onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="End Time"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Venue / Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  fullWidth
                  placeholder="e.g. Room 102"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Virtual Meeting Link"
                  value={form.meetingLink}
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  fullWidth
                  placeholder="e.g. Zoom or GMeet Link"
                />
              </Grid>
            </Grid>

            <TextField
              label="Agenda / Notes"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#8b1a1a', '&:hover': { bgcolor: '#a01f1f' } }}>
            Schedule Meeting
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingsPage;
