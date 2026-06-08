import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography } from '@mui/material';

const WorkflowProgress = ({ projectType, currentStage, workflowStatus, currentStageStatus }) => {
  // Determine number of stages
  let stages = ['Stage 1'];
  if (projectType === 'MINI') {
    stages = ['Stage 1', 'Stage 2'];
  } else if (projectType === 'MAIN') {
    stages = ['Stage 1', 'Stage 2', 'Stage 3'];
  }

  // Calculate active step index (0-indexed)
  // If COMPLETED, all stages are done.
  const isWorkflowCompleted = workflowStatus === 'COMPLETED';
  
  let activeStep = currentStage ? currentStage - 1 : 0;
  if (isWorkflowCompleted) {
    activeStep = stages.length;
  }

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {stages.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          
          const isCompleted = index < activeStep || isWorkflowCompleted;
          const isActive = index === activeStep && !isWorkflowCompleted;
          
          if (isCompleted) {
            labelProps.error = false;
          } else if (isActive) {
            if (currentStageStatus === 'REJECTED') {
              labelProps.error = true;
              labelProps.optional = (
                <Typography variant="caption" color="error" align="center" display="block">
                  Rejected
                </Typography>
              );
            } else if (currentStageStatus === 'UNDER_REVIEW') {
              labelProps.optional = (
                <Typography variant="caption" color="warning.main" align="center" display="block">
                  Under Review
                </Typography>
              );
            } else {
              labelProps.optional = (
                <Typography variant="caption" color="primary" align="center" display="block">
                  Active
                </Typography>
              );
            }
          }

          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default WorkflowProgress;
