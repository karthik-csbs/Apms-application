import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';

const DEFAULT_MEETINGS = [
  { id: 1, title: 'Project Proposal Review', date: '2026-06-02', time: '10:00 AM', mode: 'Online (Zoom)', description: 'Initial presentation of milestones and database scheme' },
  { id: 2, title: 'Mid-Term Progress Check', date: '2026-06-15', time: '02:30 PM', mode: 'Office Room 102', description: 'Reviewing frontend integration and backend APIs' }
];

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState(DEFAULT_MEETINGS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', mode: '', description: '' });

  const handleRequest = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.mode) return;
    setMeetings([...meetings, { id: Date.now(), ...form }]);
    setOpen(false);
    setForm({ title: '', date: '', time: '', mode: '', description: '' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, color: '#1a0a0a' }}>Project Meetings</Typography>
        <Button variant="contained" startIcon={<EventIcon />} onClick={() => setOpen(true)} sx={{ bgcolor: '#8b1a1a', '&:hover': { bgcolor: '#a01f1f' } }}>
          Request Meeting
        </Button>
      </Box>

      <Grid container spacing={3}>
        {meetings.map((m) => (
          <Grid item xs={12} md={6} key={m.id}>
            <Card sx={{ borderLeft: '4px solid #8b1a1a' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a0a0a' }}>{m.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Date:</strong> {m.date} | <strong>Time:</strong> {m.time}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Location/Mode:</strong> {m.mode}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.5, color: '#444' }}>
                  {m.description || 'No additional details provided.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Request Project Review Meeting</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Meeting Topic / Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              size="small"
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
            <TextField
              label="Venue / Virtual Link"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              fullWidth
              size="small"
              placeholder="e.g. Zoom link or Room 302"
              required
            />
            <TextField
              label="Agenda / Notes"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRequest} sx={{ bgcolor: '#8b1a1a', '&:hover': { bgcolor: '#a01f1f' } }}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingsPage;
