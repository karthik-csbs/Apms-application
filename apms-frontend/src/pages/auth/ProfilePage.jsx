import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Paper, Grid, TextField, CircularProgress, Snackbar, Alert, Avatar, Divider, Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { AuthContext } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.role === 'STUDENT';

  const [loading, setLoading] = useState(isStudent);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    registerNumber: '',
    departmentName: '',
    mobile: '',
    skills: '',
    githubProfile: '',
    linkedinUrl: '',
    resumeUrl: '',
    createdAt: ''
  });

  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    if (isStudent) {
      fetchStudentProfile();
    }
  }, [isStudent]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await studentService.getProfile();
      if (res.success && res.data) {
        setProfileData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch student profile', err);
      setAlert({
        show: true,
        message: 'Failed to load profile details from server.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      setAlert({ show: true, message: 'Name is required.', severity: 'error' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: profileData.name,
        mobile: profileData.mobile,
        skills: profileData.skills,
        githubProfile: profileData.githubProfile,
        linkedinUrl: profileData.linkedinUrl,
        resumeUrl: profileData.resumeUrl
      };

      const res = await studentService.updateProfile(payload);
      if (res.success && res.data) {
        setProfileData(res.data);
        setAlert({ show: true, message: 'Profile updated successfully!', severity: 'success' });
        setEditMode(false);
        // Note: Name in AuthContext/sessionStorage remains the same until session refresh, 
        // but it will reflect on page reload or if they refresh the session.
      }
    } catch (err) {
      console.error('Failed to update student profile', err);
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      setAlert({ show: true, message: errMsg, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const initials = profileData.name ? profileData.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>User Profile</Typography>

      <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'primary.main', 
                fontSize: '2.5rem', 
                fontWeight: 'bold',
                mb: 2 
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 500, textAlign: 'center' }}>{profileData.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              {user?.role}
            </Typography>
            {isStudent && profileData.registerNumber && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Reg: {profileData.registerNumber}
              </Typography>
            )}
            {profileData.departmentName && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
                {profileData.departmentName}
              </Typography>
            )}

            {isStudent && !editMode && (
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={() => setEditMode(true)}
                sx={{ mt: 3 }}
                fullWidth
              >
                Edit Profile
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={9}>
            <Box component="form" onSubmit={handleSave}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>Profile Information</Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!editMode}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profileData.email}
                    disabled
                    variant="outlined"
                    helperText="Email address cannot be changed."
                  />
                </Grid>

                {isStudent && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mobile Number"
                        name="mobile"
                        value={profileData.mobile || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Skills"
                        name="skills"
                        value={profileData.skills || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                        variant="outlined"
                        placeholder="e.g. Java, React, Python"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="GitHub Profile Link"
                        name="githubProfile"
                        value={profileData.githubProfile || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                        variant="outlined"
                        placeholder="https://github.com/username"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="LinkedIn Profile Link"
                        name="linkedinUrl"
                        value={profileData.linkedinUrl || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                        variant="outlined"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Resume Link (Google Drive/Dropbox)"
                        name="resumeUrl"
                        value={profileData.resumeUrl || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                        variant="outlined"
                        placeholder="https://drive.google.com/..."
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              {editMode && (
                <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setEditMode(false);
                      if (isStudent) fetchStudentProfile();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="contained" 
                    color="primary" 
                    startIcon={<SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

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

export default ProfilePage;
