import { useState, useEffect } from "react";

const API_BASE = "/api/faculty";

// ----- helpers ---------------------------------------------------------------

/** Generates a password that satisfies @Size(min=8):
 *  at least 1 uppercase, 1 digit, 1 special char, total 12 chars */
function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;
  const rand = (set) => set[Math.floor(Math.random() * set.length)];
  const core = Array.from({ length: 8 }, () => rand(all)).join("");
  // guarantee at least one of each required class
  return (
    rand(upper) +
    rand(digits) +
    rand(special) +
    core
  ).split("").sort(() => Math.random() - 0.5).join("").slice(0, 12);
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

// ----- departments (replace IDs with your real DB values) --------------------
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
  departmentId: "",
};

// =============================================================================
export default function CreateStudents() {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [mailStatus, setMailStatus]   = useState({});   // id → "sending"|"sent"|"error"
  const [showForm, setShowForm]   = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  // ---------------------------------------------------------------------------
  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/students`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const body = await res.json();
      setStudents(body?.data || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "departmentId" ? Number(value) : value }));
    setError("");
  }

  // ---------------------------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.registerNumber || !form.departmentId) {
      setError("All fields are required.");
      return;
    }

    const plainPassword = generatePassword(); // generated on the front-end
    const payload = { ...form, password: plainPassword }; // matches DTO exactly

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/register/student`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Registration failed");
      }

      const resBody = await res.json();
      const saved = resBody.data;
      // stash plain password so Send Mail can forward it
      setStudents((prev) => [...prev, { ...saved, _plainPassword: plainPassword }]);
      setSuccess(`✅ "${form.name}" registered! Use Send Mail to share their credentials.`);
      setForm(INITIAL_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  async function handleSendMail(student) {
    const sid = student.id ?? student._id;
    if (!sid) return;

    setMailStatus((p) => ({ ...p, [sid]: "sending" }));

    try {
      const res = await fetch(`${API_BASE}/student/${sid}/send-credentials`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          email:    student.email,
          name:     student.name,
          password: student._plainPassword ?? "", // plain-text pw stored in state
        }),
      });
      if (!res.ok) throw new Error();
      setMailStatus((p) => ({ ...p, [sid]: "sent" }));
    } catch {
      setMailStatus((p) => ({ ...p, [sid]: "error" }));
    }
  }

  // ---------------------------------------------------------------------------
  const deptLabel = (id) =>
    DEPARTMENTS.find((d) => d.id === id)?.label ?? id ?? "—";

  // ===========================================================================
  return (
    <div style={s.page}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Students</h1>
          <p style={s.sub}>
            {students.length} student{students.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          style={s.primaryBtn}
          onClick={() => { setShowForm((v) => !v); setError(""); setSuccess(""); }}
        >
          {showForm ? "✕ Cancel" : "+ Create Student"}
        </button>
      </div>

      {/* ── Alerts ─────────────────────────────────────────────────────────── */}
      {success && <div style={s.alertOk}>{success}</div>}
      {error   && <div style={s.alertErr}>{error}</div>}

      {/* ── Create-student Form ─────────────────────────────────────────────── */}
      {showForm && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>New Student</h2>

          {/* password-generation notice */}
          <div style={s.notice}>
            <span>🔐</span>
            <span>
              A secure password will be <strong>auto-generated</strong> and stored.
              Click <em>Send Mail</em> in the table to deliver credentials to the student.
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={s.grid}>

              {/* Name */}
              <div style={s.field}>
                <label style={s.lbl}>Full Name <Req /></label>
                <input
                  style={s.input} name="name" value={form.name}
                  onChange={handleChange} placeholder="e.g. Arjun Sharma" required
                />
              </div>

              {/* Email */}
              <div style={s.field}>
                <label style={s.lbl}>Email <Req /></label>
                <input
                  style={s.input} name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder="student@college.edu" required
                />
              </div>

              {/* Register Number */}
              <div style={s.field}>
                <label style={s.lbl}>Register Number <Req /></label>
                <input
                  style={s.input} name="registerNumber" value={form.registerNumber}
                  onChange={handleChange} placeholder="e.g. 21CS001" required
                />
              </div>

              {/* Department */}
              <div style={s.field}>
                <label style={s.lbl}>Department <Req /></label>
                <select
                  style={s.input} name="departmentId"
                  value={form.departmentId} onChange={handleChange} required
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

            </div>

            <div style={s.formActions}>
              <button type="button" style={s.secondaryBtn}
                onClick={() => { setShowForm(false); setForm(INITIAL_FORM); setError(""); }}>
                Cancel
              </button>
              <button type="submit"
                style={submitting ? s.primaryBtnOff : s.primaryBtn}
                disabled={submitting}>
                {submitting ? "Registering…" : "Register Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Students Table ──────────────────────────────────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Registered Students</h2>

        {loading ? (
          <div style={s.empty}>Loading…</div>
        ) : students.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
            <p>No students yet. Click <strong>+ Create Student</strong> to add one.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["#", "Name", "Register No.", "Email", "Department", "Mail Credentials"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((st, i) => {
                  const sid    = st.id ?? st._id ?? i;
                  const status = mailStatus[sid];
                  return (
                    <tr key={sid} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={s.td}>{i + 1}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{st.name}</td>
                      <td style={s.td}>
                        <span style={s.badge}>{st.registerNumber}</span>
                      </td>
                      <td style={s.td}>{st.email}</td>
                      <td style={s.td}>{deptLabel(st.departmentId)}</td>
                      <td style={s.td}>
                        <MailButton
                          status={status}
                          onClick={() => handleSendMail(st)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// ── Small sub-components ──────────────────────────────────────────────────────

function Req() {
  return <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>;
}

function MailButton({ status, onClick }) {
  if (status === "sent")
    return <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 13 }}>✅ Sent</span>;

  if (status === "error")
    return (
      <button style={{ ...btnBase, background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }} onClick={onClick}>
        ⚠ Retry
      </button>
    );

  return (
    <button
      style={{ ...btnBase, background: status === "sending" ? "#fca5a5" : "#b91c1c", color: "#fff" }}
      onClick={onClick}
      disabled={status === "sending"}
    >
      {status === "sending" ? "Sending…" : "✉ Send Mail"}
    </button>
  );
}

const btnBase = {
  border: "none", borderRadius: 7, padding: "6px 14px",
  fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { padding: "28px 32px", fontFamily: "'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  title:  { fontSize: 26, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.5px" },
  sub:    { fontSize: 13, color: "#64748b", margin: "4px 0 0" },

  card:      { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,.05)" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#334155", marginTop: 0, marginBottom: 20 },

  notice: { display: "flex", gap: 8, alignItems: "flex-start", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b", marginBottom: 20, lineHeight: 1.5 },

  grid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 16 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  lbl:   { fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#1e293b", background: "#f8fafc", outline: "none" },

  formActions: { display: "flex", gap: 10, justifyContent: "flex-end" },

  primaryBtn:    { background: "#b91c1c", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  primaryBtnOff: { background: "#fca5a5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "not-allowed" },
  secondaryBtn:  { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },

  alertOk:  { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14 },
  alertErr: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14 },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th:    { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" },
  td:    { padding: "12px 14px", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  badge: { background: "#fef2f2", color: "#b91c1c", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600 },

  empty: { textAlign: "center", padding: "48px 20px", color: "#64748b", fontSize: 14 },
};