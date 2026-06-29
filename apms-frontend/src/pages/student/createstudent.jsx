import { useState, useEffect } from "react";
import { studentService } from "../../services/studentService";
import { projectService } from "../../services/projectService";

// ----- helpers ---------------------------------------------------------------
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

const DEPARTMENTS = [
  { id: 1, label: "Computer Science & Engineering" },
  { id: 2, label: "Electronics & Communication" },
  { id: 3, label: "Mechanical Engineering" },
  { id: 4, label: "Civil Engineering" },
  { id: 5, label: "Information Technology" },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  registerNumber: "",
  mobile: "",
  departmentId: "",
  projectId: "",
};

export default function CreateStudents() {
  const [students, setStudents]   = useState([]);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // Pagination & Search State
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(0);
  const [size]                    = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy]       = useState("id");
  const [sortDir, setSortDir]     = useState("desc");

  // Modals & Dialogs
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showResetDialog, setShowResetDialog]     = useState(false);
  const [showViewModal, setShowViewModal]         = useState(false);

  // Form State
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Credentials Display
  const [createdCredentials, setCreatedCredentials] = useState(null); // { username, password }
  const [resetPasswordText, setResetPasswordText]     = useState("");

  useEffect(() => {
    fetchStudents();
    fetchProjects();
  }, [page, search, sortBy, sortDir]);

  // ---------------------------------------------------------------------------
  async function fetchStudents() {
    setLoading(true);
    try {
      const data = await studentService.facultyGetStudents(search, page, size, sortBy, sortDir);
      if (data) {
        setStudents(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      setError("Failed to fetch students roster.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    try {
      const res = await projectService.getFacultyProjects();
      setProjects(res || []);
    } catch {
      // fallback or ignore if not faculty
      try {
        const res = await projectService.getAll();
        setProjects(res?.content || res || []);
      } catch {}
    }
  }

  function handleCreateChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: (name === "departmentId" || name === "projectId") && value !== "" ? Number(value) : value
    }));
    setError("");
  }

  // ---------------------------------------------------------------------------
  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.registerNumber || !form.departmentId) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        registerNumber: form.registerNumber,
        mobile: form.mobile || null,
        departmentId: form.departmentId,
        projectId: form.projectId || null,
      };

      const result = await studentService.facultyCreateStudent(payload);
      setCreatedCredentials({
        username: result.username,
        password: result.temporaryPassword,
        emailSent: result.emailSent,
        studentEmail: result.studentEmail
      });
      setShowCreateModal(false);
      setShowSuccessDialog(true);
      setForm(INITIAL_FORM);
      fetchStudents();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create student account.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.registerNumber || !form.departmentId) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        registerNumber: form.registerNumber,
        mobile: form.mobile || null,
        departmentId: form.departmentId,
        projectId: form.projectId || null,
      };

      await studentService.facultyUpdateStudent(selectedStudent.id, payload);
      setSuccess(`✅ Student "${form.name}" updated successfully.`);
      setShowEditModal(false);
      setForm(INITIAL_FORM);
      fetchStudents();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to update student account.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  async function handleDeactivate(student) {
    if (!window.confirm(`Are you sure you want to deactivate student "${student.name}"?`)) {
      return;
    }
    try {
      await studentService.facultyDeleteStudent(student.id);
      setSuccess(`✅ Student "${student.name}" deactivated successfully.`);
      fetchStudents();
    } catch (err) {
      setError("Failed to deactivate student account.");
    }
  }

  // ---------------------------------------------------------------------------
  async function handleResetPassword(student) {
    if (!window.confirm(`Reset password for "${student.name}"?`)) {
      return;
    }
    try {
      const tempPw = await studentService.facultyResetPassword(student.id);
      setResetPasswordText(tempPw);
      setSelectedStudent(student);
      setShowResetDialog(true);
    } catch (err) {
      setError("Failed to reset student password.");
    }
  }

  // ---------------------------------------------------------------------------
  async function handleResendCredentials(student) {
    if (!window.confirm(`Resend login credentials to "${student.name}" (${student.email})?`)) {
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await studentService.facultyResendCredentials(student.id);
      if (result.emailSent) {
        setSuccess(`✅ Credentials have been sent to: ${student.email}`);
      } else {
        setError("Student account created successfully. Email delivery failed. Please use Resend Credentials.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to resend credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEdit(student) {
    setSelectedStudent(student);
    setForm({
      name: student.name,
      email: student.email,
      registerNumber: student.registerNumber,
      mobile: student.mobile || "",
      departmentId: student.departmentId || "",
      projectId: student.projectId || "",
    });
    setError("");
    setShowEditModal(true);
  }

  function handleOpenView(student) {
    setSelectedStudent(student);
    setShowViewModal(true);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  const deptLabel = (id) =>
    DEPARTMENTS.find((d) => d.id === id)?.label ?? "—";

  // ===========================================================================
  return (
    <div style={s.page}>
      <style>{`
        .desktop-only {
          display: block;
        }
        .mobile-only {
          display: none;
        }
        .mobile-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .mobile-card-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
        }
        .mobile-card-row:last-of-type {
          border-bottom: none;
        }
        .mobile-card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        @media (max-width: 767px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Students</h1>
          <p style={s.sub}>
            {totalElements} student{totalElements !== 1 ? "s" : ""} registered in total
          </p>
        </div>
        <button
          style={s.primaryBtn}
          onClick={() => { setForm(INITIAL_FORM); setError(""); setShowCreateModal(true); }}
        >
          + Create Student
        </button>
      </div>

      {/* ── Alerts ─────────────────────────────────────────────────────────── */}
      {success && <div style={s.alertOk}>{success}</div>}
      {error   && <div style={s.alertErr}>{error}</div>}

      {/* ── Search & Filter ────────────────────────────────────────────────── */}
      <div style={s.searchBarContainer}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="Search by Name, Email or Register Number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {/* ── Students Table ──────────────────────────────────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Registered Students</h2>

        {loading ? (
          <div style={s.empty}>Loading students...</div>
        ) : students.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
            <p>No students found. Click <strong>+ Create Student</strong> to add one.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }} className="desktop-only">
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>S.No</th>
                    <th style={{ ...s.th, cursor: "pointer" }} onClick={() => { setSortBy("registerNumber"); setSortDir(p => p === "asc" ? "desc" : "asc"); }}>
                      Register No. {sortBy === "registerNumber" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th style={{ ...s.th, cursor: "pointer" }} onClick={() => { setSortBy("name"); setSortDir(p => p === "asc" ? "desc" : "asc"); }}>
                      Name {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th style={{ ...s.th, cursor: "pointer" }} onClick={() => { setSortBy("email"); setSortDir(p => p === "asc" ? "desc" : "asc"); }}>
                      Email {sortBy === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th style={s.th}>Department</th>
                    <th style={s.th}>Project</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, i) => {
                    const sNo = page * size + i + 1;
                    return (
                      <tr key={st.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={s.td}>{sNo}</td>
                        <td style={s.td}>
                          <span style={s.badge}>{st.registerNumber}</span>
                        </td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{st.name}</td>
                        <td style={s.td}>{st.email}</td>
                        <td style={s.td}>{st.departmentName || deptLabel(st.departmentId)}</td>
                        <td style={s.td}>{st.projectTitle || "—"}</td>
                        <td style={s.td}>
                          <span style={{
                            ...s.statusBadge,
                            background: st.enabled ? "#e6f4ea" : "#fce8e6",
                            color: st.enabled ? "#137333" : "#c5221f"
                          }}>
                            {st.enabled ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={s.actionsContainer}>
                            <button style={s.btnView} onClick={() => handleOpenView(st)}>View</button>
                            <button style={s.btnEdit} onClick={() => handleOpenEdit(st)}>Edit</button>
                            <button style={s.btnReset} onClick={() => handleResetPassword(st)}>Reset Password</button>
                            {st.enabled && (
                              <button style={s.btnResend} onClick={() => handleResendCredentials(st)}>Resend Credentials</button>
                            )}
                            {st.enabled && (
                              <button style={s.btnDeactivate} onClick={() => handleDeactivate(st)}>Deactivate</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mobile-only" style={{ display: "none" }}>
              {students.map((st, i) => (
                <div key={st.id} className="mobile-card">
                  <div className="mobile-card-row">
                    <strong>Register No:</strong>
                    <span style={s.badge}>{st.registerNumber}</span>
                  </div>
                  <div className="mobile-card-row">
                    <strong>Student Name:</strong>
                    <span style={{ fontWeight: 600 }}>{st.name}</span>
                  </div>
                  <div className="mobile-card-row">
                    <strong>Email:</strong>
                    <span>{st.email}</span>
                  </div>
                  <div className="mobile-card-row">
                    <strong>Department:</strong>
                    <span>{st.departmentName || deptLabel(st.departmentId)}</span>
                  </div>
                  <div className="mobile-card-row">
                    <strong>Status:</strong>
                    <span style={{
                      ...s.statusBadge,
                      background: st.enabled ? "#e6f4ea" : "#fce8e6",
                      color: st.enabled ? "#137333" : "#c5221f"
                    }}>
                      {st.enabled ? "Active" : "Deactivated"}
                    </span>
                  </div>
                  <div className="mobile-card-actions">
                    <button style={s.btnView} onClick={() => handleOpenView(st)}>View</button>
                    <button style={s.btnEdit} onClick={() => handleOpenEdit(st)}>Edit</button>
                    <button style={s.btnReset} onClick={() => handleResetPassword(st)}>Reset Password</button>
                    {st.enabled && (
                      <button style={s.btnResend} onClick={() => handleResendCredentials(st)}>Resend Credentials</button>
                    )}
                    {st.enabled && (
                      <button style={s.btnDeactivate} onClick={() => handleDeactivate(st)}>Deactivate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div style={s.pagination}>
              <button
                style={page === 0 ? s.pagBtnOff : s.pagBtn}
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span style={s.pagText}>
                Page {page + 1} of {Math.max(1, totalPages)} (Total: {totalElements})
              </span>
              <button
                style={page >= totalPages - 1 ? s.pagBtnOff : s.pagBtn}
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Create Modal ────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <h2 style={s.modalTitle}>Create Student Account</h2>
            <form onSubmit={handleCreateSubmit}>
              <div style={s.grid}>
                <div style={s.field}>
                  <label style={s.lbl}>Student Name <Req /></label>
                  <input
                    style={s.input} name="name" value={form.name}
                    onChange={handleCreateChange} placeholder="e.g. Arjun Sharma" required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Email <Req /></label>
                  <input
                    style={s.input} name="email" type="email" value={form.email}
                    onChange={handleCreateChange} placeholder="student@college.edu" required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Register Number <Req /></label>
                  <input
                    style={s.input} name="registerNumber" value={form.registerNumber}
                    onChange={handleCreateChange} placeholder="e.g. 21CS001" required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Mobile Number</label>
                  <input
                    style={s.input} name="mobile" value={form.mobile}
                    onChange={handleCreateChange} placeholder="e.g. 9876543210"
                  />
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Department <Req /></label>
                  <select
                    style={s.input} name="departmentId"
                    value={form.departmentId} onChange={handleCreateChange} required
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Project Assignment</label>
                  <select
                    style={s.input} name="projectId"
                    value={form.projectId} onChange={handleCreateChange}
                  >
                    <option value="">No Project Assigned</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={s.formActions}>
                <button type="button" style={s.secondaryBtn} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={submitting ? s.primaryBtnOff : s.primaryBtn} disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {showEditModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <h2 style={s.modalTitle}>Edit Student Details</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={s.grid}>
                <div style={s.field}>
                  <label style={s.lbl}>Student Name <Req /></label>
                  <input
                    style={s.input} name="name" value={form.name}
                    onChange={handleCreateChange} required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Email <Req /></label>
                  <input
                    style={s.input} name="email" type="email" value={form.email}
                    onChange={handleCreateChange} required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Register Number <Req /></label>
                  <input
                    style={s.input} name="registerNumber" value={form.registerNumber}
                    onChange={handleCreateChange} required
                  />
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Mobile Number</label>
                  <input
                    style={s.input} name="mobile" value={form.mobile}
                    onChange={handleCreateChange}
                  />
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Department <Req /></label>
                  <select
                    style={s.input} name="departmentId"
                    value={form.departmentId} onChange={handleCreateChange} required
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.lbl}>Project Assignment</label>
                  <select
                    style={s.input} name="projectId"
                    value={form.projectId} onChange={handleCreateChange}
                  >
                    <option value="">No Project Assigned</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={s.formActions}>
                <button type="button" style={s.secondaryBtn} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={submitting ? s.primaryBtnOff : s.primaryBtn} disabled={submitting}>
                  {submitting ? "Updating..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Modal ──────────────────────────────────────────────────────── */}
      {showViewModal && selectedStudent && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <h2 style={s.modalTitle}>Student Profile Info</h2>
            <div style={s.profileDetails}>
              <div style={s.detailRow}><strong>Register Number:</strong> {selectedStudent.registerNumber}</div>
              <div style={s.detailRow}><strong>Name:</strong> {selectedStudent.name}</div>
              <div style={s.detailRow}><strong>Email:</strong> {selectedStudent.email}</div>
              <div style={s.detailRow}><strong>Mobile:</strong> {selectedStudent.mobile || "—"}</div>
              <div style={s.detailRow}><strong>Department:</strong> {selectedStudent.departmentName || deptLabel(selectedStudent.departmentId)}</div>
              <div style={s.detailRow}><strong>Assigned Project:</strong> {selectedStudent.projectTitle || "No project assigned"}</div>
              <div style={s.detailRow}><strong>Status:</strong> {selectedStudent.enabled ? "Active" : "Deactivated"}</div>
              <div style={s.detailRow}>
                <strong>Email Delivery Status:</strong>{" "}
                {selectedStudent.emailDeliveryStatus === "SUCCESS" ? (
                  <span style={{ color: "#137333", fontWeight: 600, background: "#e6f4ea", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>Email Sent</span>
                ) : selectedStudent.emailDeliveryStatus === "FAILED" ? (
                  <span style={{ color: "#c5221f", fontWeight: 600, background: "#fce8e6", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>Email Failed</span>
                ) : (
                  <span style={{ color: "#5f6368", fontWeight: 600, background: "#f1f3f4", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>Pending</span>
                )}
              </div>
              <div style={s.detailRow}>
                <strong>Last Email Sent Date:</strong>{" "}
                {selectedStudent.lastCredentialEmailSent ? (
                  new Date(selectedStudent.lastCredentialEmailSent).toLocaleString()
                ) : (
                  "—"
                )}
              </div>
            </div>
            <div style={s.formActions}>
              <button style={s.secondaryBtn} onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Credentials Dialog ─────────────────────────────────────────── */}
      {showSuccessDialog && createdCredentials && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, borderTop: createdCredentials.emailSent ? "4px solid #137333" : "4px solid #ea4335" }}>
            <h2 style={{ ...s.modalTitle, color: createdCredentials.emailSent ? "#137333" : "#ea4335" }}>
              {createdCredentials.emailSent ? "🎉 Student Created Successfully" : "⚠ Email Delivery Failed"}
            </h2>
            
            {createdCredentials.emailSent ? (
              <>
                <p style={{ fontSize: 14, color: "#3c4043", marginBottom: 8, fontWeight: 500 }}>
                  Student account created successfully.
                </p>
                <p style={{ fontSize: 14, color: "#3c4043", marginBottom: 16 }}>
                  Credentials have been sent to the student's email address.
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: "#ea4335", fontWeight: "bold", marginBottom: 8 }}>
                  Student account created.
                </p>
                <p style={{ fontSize: 14, color: "#ea4335", fontWeight: "bold", marginBottom: 16 }}>
                  Email delivery failed.
                </p>
              </>
            )}

            <div style={s.formActions}>
              {!createdCredentials.emailSent && (
                <button
                  style={s.primaryBtn}
                  onClick={async () => {
                    setShowSuccessDialog(false);
                    await handleResendCredentials({ id: createdCredentials.studentId, name: createdCredentials.username, email: createdCredentials.studentEmail });
                  }}
                >
                  Resend Credentials
                </button>
              )}
              <button style={s.secondaryBtn} onClick={() => setShowSuccessDialog(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Dialog ────────────────────────────────────────────── */}
      {showResetDialog && selectedStudent && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, borderTop: "4px solid #b91c1c" }}>
            <h2 style={{ ...s.modalTitle, color: "#b91c1c" }}>🔒 Password Reset Successful</h2>
            <p style={{ fontSize: 13, color: "#5f6368", marginBottom: 16 }}>
              Temporary password regenerated for student <strong>{selectedStudent.name}</strong>:
            </p>
            <div style={s.credentialsCard}>
              <div style={s.credField}>
                <strong>New Password:</strong>
                <code style={s.codeBlock}>{resetPasswordText}</code>
              </div>
            </div>
            <div style={s.formActions}>
              <button style={s.primaryBtn} onClick={() => copyToClipboard(resetPasswordText)}>
                Copy Password
              </button>
              <button style={s.secondaryBtn} onClick={() => setShowResetDialog(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Small sub-components ──────────────────────────────────────────────────────
function Req() {
  return <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { padding: "28px 32px", fontFamily: "'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  title:  { fontSize: 26, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.5px" },
  sub:    { fontSize: 13, color: "#64748b", margin: "4px 0 0" },

  card:      { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,.05)" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#334155", marginTop: 0, marginBottom: 20 },

  searchBarContainer: { marginBottom: 20 },
  searchInput: { width: "100%", padding: "11px 16px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#1e293b", background: "#fff", outline: "none", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)" },

  grid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 16 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  lbl:   { fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#1e293b", background: "#fff", outline: "none" },

  formActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 },

  primaryBtn:    { background: "#b91c1c", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  primaryBtnOff: { background: "#fca5a5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "not-allowed" },
  secondaryBtn:  { background: "#fff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },

  alertOk:  { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14 },
  alertErr: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14 },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th:    { textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" },
  td:    { padding: "12px 14px", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  badge: { background: "#fef2f2", color: "#b91c1c", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600 },
  statusBadge: { display: "inline-block", borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: 600, textTransform: "uppercase" },

  actionsContainer: { display: "flex", gap: 10, flexWrap: "wrap" },
  actionLink: { background: "none", border: "none", color: "#0056b3", textDecoration: "underline", cursor: "pointer", fontSize: 13, padding: 0 },
  btnView: { background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  btnEdit: { background: "#e0f2fe", color: "#0369a1", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  btnReset: { background: "#fef3c7", color: "#b45309", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  btnResend: { background: "#f0fdf4", color: "#15803d", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  btnDeactivate: { background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },

  empty: { textAlign: "center", padding: "48px 20px", color: "#64748b", fontSize: 14 },

  // Pagination Styles
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 15, marginTop: 20 },
  pagBtn: { background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer" },
  pagBtnOff: { background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 12px", fontSize: 13, color: "#94a3b8", cursor: "not-allowed" },
  pagText: { fontSize: 13, color: "#475569" },

  // Modal Styles
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: "600px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", position: "relative" },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#1e293b", marginTop: 0, marginBottom: 20 },

  profileDetails: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 20, fontSize: 14 },
  detailRow: { borderBottom: "1px solid #f1f5f9", paddingBottom: 8 },

  // Credentials Styling
  credentialsCard: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 20 },
  credField: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 },
  codeBlock: { padding: "8px 12px", background: "#e2e8f0", borderRadius: 6, fontFamily: "monospace", fontSize: 14, color: "#0f172a", marginTop: 4, display: "block" }
};