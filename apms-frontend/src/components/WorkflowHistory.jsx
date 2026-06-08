import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';

const WorkflowHistory = ({ history }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="workflow history table">
        <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
          <TableRow>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>User</strong></TableCell>
            <TableCell><strong>Action</strong></TableCell>
            <TableCell><strong>Previous Status</strong></TableCell>
            <TableCell><strong>New Status</strong></TableCell>
            <TableCell><strong>Remarks</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!history || history.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                No history recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            history.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{formatDate(row.performedDate)}</TableCell>
                <TableCell>{row.performedBy || 'System'}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.previousStatus || '—'}</TableCell>
                <TableCell>{row.newStatus || '—'}</TableCell>
                <TableCell>{row.remarks || '—'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WorkflowHistory;
