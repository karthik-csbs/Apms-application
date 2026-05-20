import React from 'react';
import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

const FormInput = ({ name, control, label, rules = {}, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          label={label}
          fullWidth
          error={!!error}
          helperText={error ? error.message : props.helperText}
          sx={{ mb: 2, ...props.sx }}
        />
      )}
    />
  );
};

export default FormInput;
