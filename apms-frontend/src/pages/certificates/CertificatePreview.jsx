import React, { useRef, useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Paper, Container, CircularProgress, Snackbar, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { certificateService } from '../../services/certificateService';

const CertificatePreview = () => {
  const { user } = useContext(AuthContext);
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  // Certificate Data State
  const [data, setData] = useState({
    studentName: user?.name || 'John Doe',
    registerNumber: 'CS2026001',
    department: 'Computer Science & Engineering',
    projectTitle: 'AI based Disease Prediction System',
    projectType: 'Main Project',
    facultyName: 'Dr. Alan Smith',
    academicYear: '2025-2026',
    completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    collegeName: 'Prathyusha Engineering College',
  });

  useEffect(() => {
    fetchCertificateDetails();
  }, []);

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getStudentProjects();
      const projectList = projectData?.data || projectData || [];
      
      // Find a project that has the logged-in student as a team member
      const studentProject = projectList.find(p => 
        p.teamMembers?.some(m => m.studentName === user?.name || m.id === user?.id)
      );

      if (studentProject) {
        setProjectId(studentProject.id);
        
        // Find user's team member registration number
        const myMemberInfo = studentProject.teamMembers?.find(m => m.studentName === user?.name || m.id === user?.id);
        const regNum = myMemberInfo?.registerNumber || 'CS2026001';

        // Format project type enum (e.g. MAIN_PROJECT -> Main Project)
        const formatProjectType = (type) => {
          if (!type) return 'Main Project';
          return type.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        };

        // Determine academic year from createdAt or current year
        const getAcademicYear = (dateStr) => {
          const date = dateStr ? new Date(dateStr) : new Date();
          const year = date.getFullYear();
          const month = date.getMonth(); // 0-indexed
          if (month >= 5) {
            return `${year}-${year + 1}`;
          } else {
            return `${year - 1}-${year}`;
          }
        };

        setData({
          studentName: user?.name || 'John Doe',
          registerNumber: regNum,
          department: studentProject.departmentName || 'Computer Science & Engineering',
          projectTitle: studentProject.title,
          projectType: formatProjectType(studentProject.projectType),
          facultyName: studentProject.facultyGuideName || 'Dr. Alan Smith',
          academicYear: getAcademicYear(studentProject.createdAt),
          completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          collegeName: 'Prathyusha Engineering College',
        });
      } else {
        setAlert({
          show: true,
          message: 'No completed project found on server. Showing demo certificate.',
          severity: 'info'
        });
      }
    } catch (err) {
      console.error('Failed to load certificate details', err);
      setAlert({
        show: true,
        message: 'Could not fetch project details from server. Displaying offline demo.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateClientSidePDF = async () => {
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
      
      setAlert({
        show: true,
        message: 'Certificate PDF generated and downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF', error);
      setAlert({
        show: true,
        message: 'Failed to generate PDF. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDownload = async () => {
    if (!projectId) {
      await generateClientSidePDF();
      return;
    }
    
    try {
      setDownloading(true);
      const pdfBlob = await certificateService.download(projectId);
      
      const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data.studentName}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setAlert({
        show: true,
        message: 'Official certificate downloaded successfully from server!',
        severity: 'success'
      });
    } catch (error) {
      console.warn('Backend PDF download failed, falling back to client-side generation:', error);
      setAlert({
        show: true,
        message: 'Offline mode: Generating high-quality PDF in-browser...',
        severity: 'info'
      });
      await generateClientSidePDF();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Project Completion Certificate</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />} 
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Downloading...' : 'Download PDF'}
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
    </Container>
  );
};

export default CertificatePreview;
