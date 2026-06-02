import React, { useRef, useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, Container, CircularProgress, Snackbar, Alert } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { certificateService } from '../../services/certificateService';

/* ─── Google Fonts injected once ─── */
const injectFonts = () => {
  if (document.getElementById('cert-fonts')) return;
  const link = document.createElement('link');
  link.id = 'cert-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap';
  document.head.appendChild(link);
};

/* ─── Decorative SVG corner ─── */
const Corner = ({ style }) => (
  <svg
    style={{ position: 'absolute', width: 64, height: 64, ...style }}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M2 32 L2 2 L32 2" stroke="#b8973b" strokeWidth="2" fill="none" />
    <path d="M2 16 L2 2 L16 2" stroke="#b8973b" strokeWidth="0.8" fill="none" />
    <circle cx="2" cy="2" r="3" fill="#b8973b" />
    <path d="M10 2 Q6 6 2 10" stroke="#d4b96a" strokeWidth="0.6" fill="none" />
    <path d="M18 2 Q10 10 2 18" stroke="rgba(184,151,59,0.3)" strokeWidth="0.4" fill="none" />
  </svg>
);

/* ─── Ornamental divider ─── */
const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #b8973b, transparent)' }} />
    <div style={{ width: 8, height: 8, background: '#b8973b', transform: 'rotate(45deg)', flexShrink: 0 }} />
    <div style={{ width: 5, height: 5, background: '#d4b96a', transform: 'rotate(45deg)', flexShrink: 0 }} />
    <div style={{ width: 8, height: 8, background: '#b8973b', transform: 'rotate(45deg)', flexShrink: 0 }} />
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #b8973b, transparent)' }} />
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const CertificatePreview = () => {
  const { user } = useContext(AuthContext);
  const certificateRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const [data, setData] = useState({
    studentName: user?.name || 'John Doe',
    registerNumber: 'CS2026001',
    department: 'Computer Science & Engineering',
    projectTitle: 'AI Based Disease Prediction System',
    projectType: 'Main Project',
    facultyName: 'Dr. Alan Smith',
    academicYear: '2025–2026',
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    collegeName: 'Prathyusha Engineering College',
  });

  useEffect(() => {
    injectFonts();
    fetchCertificateDetails();
  }, []);

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getStudentProjects();
      const projectList = projectData || [];

      const studentProject = projectList.find(p =>
        p.teamMembers?.some(m => m.studentName === user?.name || m.studentId === user?.id)
      );

      if (studentProject) {
        setProjectId(studentProject.id);
        const myMemberInfo = studentProject.teamMembers?.find(
          m => m.studentName === user?.name || m.studentId === user?.id
        );
        const regNum = myMemberInfo?.registerNumber || 'CS2026001';

        const formatProjectType = (type) => {
          if (!type) return 'Main Project';
          return type.replace(/_/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        };
        
        const getAcademicYear = (dateStr) => {
          const date = dateStr ? new Date(dateStr) : new Date();
          const year = date.getFullYear();
          return date.getMonth() >= 5 ? `${year}–${year + 1}` : `${year - 1}–${year}`;
        };

        setData({
          studentName: user?.name || 'John Doe',
          registerNumber: regNum,
          department: studentProject.departmentName || 'Computer Science & Engineering',
          projectTitle: studentProject.title,
          projectType: formatProjectType(studentProject.projectType),
          facultyName: studentProject.facultyGuideName || 'Dr. Alan Smith',
          academicYear: getAcademicYear(studentProject.createdAt),
          completionDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          }),
          collegeName: 'Prathyusha Engineering College',
        });
      } else {
        setAlert({ show: true, message: 'No project found. Showing demo certificate.', severity: 'info' });
      }
    } catch (err) {
      console.error('Failed to load certificate details', err);
      setAlert({ show: true, message: 'Could not fetch project details. Displaying demo.', severity: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  const generateClientSidePDF = async () => {
    const input = certificateRef.current;
    try {
      const canvas = await html2canvas(input, { scale: 3, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.studentName}_Certificate.pdf`);
      setAlert({ show: true, message: 'Certificate downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error('PDF generation error', error);
      setAlert({ show: true, message: 'Failed to generate PDF. Please try again.', severity: 'error' });
    }
  };

  const handleDownload = async () => {
    if (!projectId) { await generateClientSidePDF(); return; }
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
      setAlert({ show: true, message: 'Official certificate downloaded!', severity: 'success' });
    } catch (error) {
      console.warn('Server download failed, using client-side:', error);
      setAlert({ show: true, message: 'Generating PDF in-browser…', severity: 'info' });
      await generateClientSidePDF();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#b8973b' }} />
      </Box>
    );
  }

  /* ── inline styles (no MUI sx for the certificate itself so html2canvas renders correctly) ── */
  const S = {
    page: {
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      padding: '32px 24px',
      fontFamily: "'DM Sans', sans-serif",
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: 1100,
      margin: '0 auto 28px',
    },
    pageTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 26,
      fontWeight: 700,
      color: '#1a3a6b',
    },
    downloadBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 24px',
      background: '#1a3a6b',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontFamily: "'EB Garamond', serif",
      fontSize: 15,
      cursor: 'pointer',
      letterSpacing: '0.5px',
      transition: 'background 0.2s',
    },
    scrollWrapper: {
      overflowX: 'auto',
      paddingBottom: 16,
    },

    /* ── Certificate card ── */
    cert: {
      width: 1056,
      minHeight: 748,
      margin: '0 auto',
      backgroundColor: '#ffffff',
      border: '3px solid #b8973b',
      padding: 12,
      position: 'relative',
      boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    },
    certInner: {
      border: '1px solid #d4b96a',
      padding: '44px 64px 48px',
      position: 'relative',
      minHeight: 700,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundImage: `
        radial-gradient(ellipse 60% 50% at 15% 20%, rgba(184,151,59,0.04) 0%, transparent 60%),
        radial-gradient(ellipse 50% 60% at 85% 80%, rgba(26,58,107,0.04) 0%, transparent 60%)
      `,
    },
    collegeName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 22,
      fontWeight: 700,
      color: '#1a3a6b',
      letterSpacing: '0.5px',
      textAlign: 'center',
      marginBottom: 4,
    },
    deptName: {
      fontFamily: "'EB Garamond', serif",
      fontSize: 12,
      color: '#5a6a82',
      letterSpacing: '3px',
      textAlign: 'center',
      marginBottom: 2,
    },
    sealRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      margin: '10px 0 8px',
    },
    sealLine: { width: 160, height: 1, background: 'linear-gradient(to right, transparent, #b8973b)' },
    sealLineR: { width: 160, height: 1, background: 'linear-gradient(to left, transparent, #b8973b)' },
    sealCircle: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      border: '1.5px solid #b8973b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      flexShrink: 0,
    },
    sealInner: {
      position: 'absolute',
      inset: 5,
      borderRadius: '50%',
      border: '0.5px solid #d4b96a',
    },
    sealStar: {
      color: '#b8973b',
      fontSize: 22,
      fontFamily: 'serif',
      zIndex: 1,
      lineHeight: 1,
    },
    badge: {
      display: 'inline-block',
      background: '#f9f3e3',
      color: '#7a5a10',
      border: '0.5px solid #d4b96a',
      borderRadius: 4,
      fontFamily: "'EB Garamond', serif",
      fontSize: 11,
      letterSpacing: '2.5px',
      padding: '3px 14px',
      marginBottom: 8,
    },
    certTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 36,
      fontWeight: 700,
      color: '#1a3a6b',
      textAlign: 'center',
      letterSpacing: '1px',
      lineHeight: 1.15,
      marginBottom: 4,
    },
    certSubtitle: {
      fontFamily: "'EB Garamond', serif",
      fontSize: 13,
      color: '#9aabbf',
      letterSpacing: '3.5px',
      textAlign: 'center',
      marginBottom: 16,
    },
    certBody: {
      fontFamily: "'EB Garamond', serif",
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
      lineHeight: 2.1,
      maxWidth: 700,
    },
    studentName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 30,
      fontWeight: 600,
      color: '#1a3a6b',
      fontStyle: 'italic',
      display: 'block',
      marginBottom: 2,
    },
    regNo: {
      fontFamily: "'EB Garamond', serif",
      fontSize: 12,
      color: '#9aabbf',
      letterSpacing: '2px',
      display: 'block',
      marginBottom: 12,
    },
    projectTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 18,
      fontWeight: 600,
      color: '#b8973b',
      fontStyle: 'italic',
      display: 'block',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      width: '100%',
      marginTop: 'auto',
      paddingTop: 20,
      borderTop: '0.5px solid #e8d9b0',
    },
    sigBlock: {
      textAlign: 'center',
      minWidth: 150,
    },
    sigLine: {
      width: 150,
      height: 1,
      background: '#555',
      margin: '0 auto 6px',
    },
    sigLabel: {
      fontFamily: "'EB Garamond', serif",
      fontSize: 12,
      color: '#5a6a82',
      letterSpacing: '1.5px',
    },
    dateBlock: { textAlign: 'center' },
    dateLabel: {
      fontFamily: "'EB Garamond', serif",
      fontSize: 10,
      color: '#9aabbf',
      letterSpacing: '2px',
      display: 'block',
      marginBottom: 4,
    },
    dateVal: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 14,
      color: '#333',
    },
    officialSeal: {
      textAlign: 'center',
    },
    officialSealCircle: {
      width: 52,
      height: 52,
      border: '1px solid #d4b96a',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 4px',
    },
    officialSealLabel: {
      fontFamily: "'EB Garamond', serif",
      fontSize: 9,
      color: '#b8973b',
      letterSpacing: '1.5px',
    },
  };

  return (
    <div style={S.page}>
      {/* Top bar */}
      <div style={S.topBar}>
        <div style={S.pageTitle}>Project Completion Certificate</div>
        <button
          style={S.downloadBtn}
          onClick={handleDownload}
          disabled={downloading}
          onMouseEnter={e => (e.currentTarget.style.background = '#0f2650')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1a3a6b')}
        >
          {downloading
            ? <><CircularProgress size={16} sx={{ color: '#fff' }} /> Downloading…</>
            : <><DownloadIcon sx={{ fontSize: 18 }} /> Download PDF</>
          }
        </button>
      </div>

      {/* Scroll wrapper for wide certificate */}
      <div style={S.scrollWrapper}>
        {/* ══ CERTIFICATE ══ */}
        <div ref={certificateRef} style={S.cert}>
          <div style={S.certInner}>

            {/* Corners */}
            <Corner style={{ top: 8, left: 8 }} />
            <Corner style={{ top: 8, right: 8, transform: 'scaleX(-1)' }} />
            <Corner style={{ bottom: 8, left: 8, transform: 'scaleY(-1)' }} />
            <Corner style={{ bottom: 8, right: 8, transform: 'scale(-1)' }} />

            {/* College header */}
            <div style={S.collegeName}>{data.collegeName}</div>
            <div style={S.deptName}>DEPARTMENT OF {data.department.toUpperCase()}</div>

            {/* Seal row */}
            <div style={S.sealRow}>
              <div style={S.sealLine} />
              <div style={S.sealCircle}>
                <div style={S.sealInner} />
                <span style={S.sealStar}>✦</span>
              </div>
              <div style={S.sealLineR} />
            </div>

            <Divider />

            {/* Title block */}
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <span style={S.badge}>CERTIFICATE OF COMPLETION</span>
            </div>
            <div style={S.certTitle}>Certificate of Completion</div>
            <div style={S.certSubtitle}>THIS IS TO CERTIFY THAT</div>

            {/* Student info */}
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <span style={S.studentName}>{data.studentName}</span>
              <span style={S.regNo}>REGISTER NO: {data.registerNumber}</span>
            </div>

            {/* Body text */}
            <div style={S.certBody}>
              has successfully completed the{' '}
              <em style={{ fontWeight: 500 }}>{data.projectType}</em> titled
              <br />
              <span style={S.projectTitle}>"{data.projectTitle}"</span>
              <br />
              under the guidance of{' '}
              <strong style={{ color: '#1a3a6b' }}>{data.facultyName}</strong>
              <br />
              Department of {data.department}
              <br />
              during the academic year{' '}
              <strong style={{ color: '#1a3a6b' }}>{data.academicYear}</strong>
            </div>

            <Divider />

            {/* Footer row */}
            <div style={S.footer}>
              {/* Date */}
              <div style={S.dateBlock}>
                <span style={S.dateLabel}>DATE OF COMPLETION</span>
                <span style={S.dateVal}>{data.completionDate}</span>
              </div>

              {/* Official seal centre */}
              <div style={S.officialSeal}>
                <div style={S.officialSealCircle}>
                  <span style={{ color: '#b8973b', fontSize: 24 }}>⊕</span>
                </div>
                <div style={S.officialSealLabel}>OFFICIAL SEAL</div>
              </div>

              {/* Guide signature */}
              <div style={S.sigBlock}>
                <div style={S.sigLine} />
                <div style={S.sigLabel}>PROJECT GUIDE</div>
              </div>

              {/* HOD signature */}
              <div style={S.sigBlock}>
                <div style={S.sigLine} />
                <div style={S.sigLabel}>HEAD OF DEPARTMENT</div>
              </div>
            </div>

          </div>
        </div>
        {/* ══ END CERTIFICATE ══ */}
      </div>

      <Snackbar
        open={alert.show}
        autoHideDuration={6000}
        onClose={() => setAlert(a => ({ ...a, show: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlert(a => ({ ...a, show: false }))}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CertificatePreview;