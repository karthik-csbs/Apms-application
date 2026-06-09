import api from "./api";

const REPORT_TYPES = {
  PROJECT: "project",
  REVIEW: "review",
  FACULTY_LOAD: "faculty-load",
  SUBMISSION: "submission",
};

const EXPORT_FORMATS = {
  PDF: "pdf",
  EXCEL: "excel",
  CSV: "csv",
};

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const reportService = {
  REPORT_TYPES,
  EXPORT_FORMATS,

  getProjectReport: (params = {}) => api.get("/reports/project", { params }).then(unwrapData),
  getReviewReport: (params = {}) => api.get("/reports/review", { params }).then(unwrapData),
  getFacultyLoadReport: (params = {}) => api.get("/reports/faculty-load", { params }).then(unwrapData),
  getSubmissionReport: (params = {}) => api.get("/reports/submission", { params }).then(unwrapData),

  exportReport: async (type, format, params) => {
    if (!Object.values(REPORT_TYPES).includes(type)) {
      throw new Error(`Unsupported report type: ${type}`);
    }

    if (!Object.values(EXPORT_FORMATS).includes(format)) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    return api.get(`/reports/${type}/export/${format}`, {
      params: params || {},
      responseType: "blob",
    });
  },

  getDashboardSummary: () => api.get("/reports/dashboard-summary").then(unwrapData),
};
