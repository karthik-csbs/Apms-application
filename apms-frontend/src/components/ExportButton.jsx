import { useContext, useMemo, useState } from "react";
import { Alert, Button, ButtonGroup, CircularProgress, Snackbar } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { AuthContext } from "../context/AuthContext";
import { reportService } from "../services/reportService";

const DEFAULT_ALLOWED_ROLES = ["ADMIN", "PRINCIPAL", "HOD", "FACULTY"];

const EXPORT_OPTIONS = [
  { label: "PDF", format: "pdf", extension: "pdf" },
  { label: "Excel", format: "excel", extension: "xlsx" },
  { label: "CSV", format: "csv", extension: "csv" },
];

const getFilenameFromDisposition = (contentDisposition) => {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
  }

  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return filenameMatch?.[1] || null;
};

const createFallbackFilename = (reportType, extension) => {
  const today = new Date().toISOString().slice(0, 10);
  return `${reportType}-report-${today}.${extension}`;
};

const getErrorMessage = (error, label) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.status === 403) {
    return "You do not have permission to export this report.";
  }

  if (error?.response?.status === 404) {
    return "Report export endpoint was not found.";
  }

  if (!error?.response) {
    return "Unable to reach the server. Please try again.";
  }

  return `Failed to export ${label} report.`;
};

const ExportButton = ({
  reportType,
  params = {},
  allowedRoles = DEFAULT_ALLOWED_ROLES,
  disabled = false,
  size = "small",
}) => {
  const { user } = useContext(AuthContext);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const canExport = useMemo(() => {
    return Boolean(user?.role && allowedRoles.includes(user.role));
  }, [allowedRoles, user?.role]);

  if (!canExport) {
    return null;
  }

  const closeAlert = () => {
    setAlert((current) => ({ ...current, open: false }));
  };

  const handleDownload = async ({ label, format, extension }) => {
    try {
      setLoadingFormat(format);
      const exportUrl = `/reports/${reportType}/export/${format}`;
      console.log(exportUrl);

      const response = await reportService.exportReport(reportType, format, params);
      const contentType = response.headers?.["content-type"] || "application/octet-stream";
      const contentDisposition = response.headers?.["content-disposition"];
      const filename =
        getFilenameFromDisposition(contentDisposition) ||
        createFallbackFilename(reportType, extension);

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      setAlert({
        open: true,
        message: `${label} report export started.`,
        severity: "success",
      });
    } catch (error) {
      console.error(`Failed to export ${reportType} report as ${format}`, error);
      setAlert({
        open: true,
        message: getErrorMessage(error, label),
        severity: "error",
      });
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <>
      <ButtonGroup variant="contained" size={size} aria-label={`${reportType} report exports`}>
        {EXPORT_OPTIONS.map((option) => {
          const isLoading = loadingFormat === option.format;

          return (
            <Button
              key={option.format}
              onClick={() => handleDownload(option)}
              disabled={disabled || loadingFormat !== null}
              startIcon={
                isLoading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <DownloadIcon fontSize="small" />
                )
              }
            >
              {option.label}
            </Button>
          );
        })}
      </ButtonGroup>

      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportButton;
