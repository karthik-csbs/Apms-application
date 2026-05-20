import React, { useRef } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CertificatePreview = () => {
  const certificateRef = useRef(null);

  // Dummy Data
  const data = {
    studentName: 'John Doe',
    registerNumber: 'CS2026001',
    department: 'Computer Science & Engineering',
    projectTitle: 'AI based Disease Prediction System',
    projectType: 'Main Project',
    facultyName: 'Dr. Alan Smith',
    academicYear: '2025-2026',
    completionDate: 'May 15, 2026',
    collegeName: 'PEC College of Engineering',
  };

  const handleDownload = async () => {
    const input = certificateRef.current;
    
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.studentName}_Certificate.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Project Completion Certificate</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<DownloadIcon />} 
          onClick={handleDownload}
        >
          Download PDF
        </Button>
      </Box>

      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Paper 
          ref={certificateRef}
          elevation={4} 
          sx={{ 
            width: '1056px', // A4 Landscape ratio approximation
            height: '816px',
            p: 8, 
            m: '0 auto',
            position: 'relative',
            backgroundColor: '#fff',
            border: '20px solid #1976d2',
            outline: '4px solid gold',
            outlineOffset: '-12px',
            backgroundImage: 'radial-gradient(#f5f5f5 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1, fontFamily: 'serif' }}>
            {data.collegeName}
          </Typography>
          <Typography variant="h5" sx={{ color: '#555', mb: 4, letterSpacing: 2 }}>
            DEPARTMENT OF {data.department.toUpperCase()}
          </Typography>

          <Typography variant="h2" sx={{ color: '#d32f2f', fontWeight: 'bold', mb: 4, fontFamily: 'serif' }}>
            CERTIFICATE OF COMPLETION
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 'normal', color: '#333', lineHeight: 2, mb: 6, maxWidth: '80%' }}>
            This is to certify that <strong style={{ textDecoration: 'underline', fontSize: '1.2em' }}>{data.studentName}</strong> 
            (Register No: {data.registerNumber}) has successfully completed the {data.projectType} titled 
            <br />
            <strong style={{ fontSize: '1.2em', color: '#1976d2' }}>"{data.projectTitle}"</strong>
            <br />
            under the guidance of <strong>{data.facultyName}</strong> during the academic year {data.academicYear}.
          </Typography>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mt: 'auto', px: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1">Date: {data.completionDate}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ borderBottom: '1px solid #000', width: 200, mb: 1, height: 40 }}></Box>
              <Typography variant="h6">Project Guide</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ borderBottom: '1px solid #000', width: 200, mb: 1, height: 40 }}></Box>
              <Typography variant="h6">Head of Department</Typography>
            </Box>
          </Box>

        </Paper>
      </Box>
    </Container>
  );
};

export default CertificatePreview;
