import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import FormInput from '../../components/FormInput';

const schema = yup.object().shape({
  githubLink: yup.string().url('Must be a valid URL').required('GitHub link is required'),
  driveLink: yup.string().url('Must be a valid URL').required('Google Drive link is required'),
  comments: yup.string(),
});

const SubmissionForm = () => {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      githubLink: '',
      driveLink: '',
      comments: '',
    },
  });

  const onSubmit = async (data) => {
    console.log('Submission data:', data);
    // TODO: Connect to actual API
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Submit Project Deliverables</Typography>
      
      <Paper sx={{ p: 4, maxWidth: 800 }}>
        <Typography variant="body1" paragraph color="text.secondary">
          Please provide the links to your project repository and final documentation. 
          Ensure both links are publicly accessible or shared with your faculty guide.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormInput
                name="githubLink"
                control={control}
                label="GitHub Repository Link"
                placeholder="https://github.com/username/project"
              />
            </Grid>
            <Grid item xs={12}>
              <FormInput
                name="driveLink"
                control={control}
                label="Google Drive Link (Documentation)"
                placeholder="https://drive.google.com/..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormInput
                name="comments"
                control={control}
                label="Additional Comments (Optional)"
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Final Deliverables'}
                </Button>
                <Button variant="outlined" color="error">
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default SubmissionForm;
