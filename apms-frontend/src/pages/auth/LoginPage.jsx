import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0a098" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0a098" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c0b8b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
  </svg>
);

const ROLES = [
  { id: 'STUDENT', label: 'Student', desc: 'Access your academic records & attendance' },
  { id: 'FACULTY', label: 'Faculty', desc: 'Manage marks, attendance & class reports' },
  { id: 'HOD', label: 'HOD', desc: 'Department overview & faculty performance' },
  { id: 'PRINCIPAL', label: 'Principal', desc: 'Institution-wide analytics & governance' },
  { id: 'ADMIN', label: 'Admin', desc: 'System management & user administration' },
];

const PLACEHOLDERS = {
  STUDENT:   'student@pec.edu.in',
  FACULTY:   'faculty@pec.edu.in',
  HOD:       'hod.dept@pec.edu.in',
  PRINCIPAL: 'principal@pec.edu.in',
  ADMIN:     'admin@pec.edu.in',
};

const LoginPage = () => {
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await login({ ...data, role });
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const currentRole = ROLES.find(r => r.id === role);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root { height: 100%; width: 100%; overflow: hidden; }

        .pec-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #f5f0eb;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .pec-left {
          flex: 1;
          background: #8b1a1a;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(2rem, 4vw, 3.5rem);
        }

        .pec-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        .pec-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .pec-r1 { width: 60vw; height: 60vw; max-width: 650px; max-height: 650px; top: -18%; right: -12%; border: 1px solid rgba(255,255,255,0.07); }
        .pec-r2 { width: 32vw; height: 32vw; max-width: 340px; max-height: 340px; bottom: 3%; left: -9%; border: 1px solid rgba(255,255,255,0.05); }
        .pec-r3 { width: 18vw; height: 18vw; max-width: 200px; max-height: 200px; bottom: -4%; right: 14%; border: 1px solid rgba(255,255,255,0.06); }
        .pec-r4 { width: 8vw; height: 8vw; max-width: 90px; max-height: 90px; top: 22%; left: 12%; border: 1px solid rgba(212,160,23,0.15); }

        .pec-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 2;
        }

        .pec-logo {
          width: clamp(46px, 4vw, 58px);
          height: clamp(46px, 4vw, 58px);
          // background: rgba(255,255,255,0.1);
          // border: 1.5px solid rgba(255,255,255,0.22);
          // border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 19px; font-weight: 700;
          // color: #fff; flex-shrink: 0;
        }

        .pec-college-name {
          font-size: clamp(13px, 1.4vw, 16px);
          font-weight: 500; color: #fff; line-height: 1.3;
        }

        .pec-college-type {
          font-size: 10px; color: rgba(255,255,255,0.4);
          letter-spacing: 2px; text-transform: uppercase; margin-top: 3px;
        }

        .pec-hero { position: relative; z-index: 2; }

        .pec-gold-bar {
          width: 50px; height: 3px;
          background: #d4a017; border-radius: 2px;
          margin-bottom: 1.4rem;
        }

        .pec-tagline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 5.5vw, 66px);
          font-weight: 700; color: #fff;
          line-height: 1.12; margin-bottom: 1.2rem;
        }

        .pec-tagline em { color: #d4a017; font-style: italic; }

        .pec-tagline-desc {
          font-size: clamp(13px, 1.2vw, 15px);
          color: rgba(255,255,255,0.46);
          font-weight: 300; line-height: 1.8;
          max-width: 380px;
        }

        .pec-stats {
          display: flex; gap: 10px;
          flex-wrap: wrap; position: relative; z-index: 2;
        }

        .pec-stat {
          background: rgba(255,255,255,0.08);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: clamp(9px, 1vw, 13px) clamp(14px, 1.5vw, 20px);
          transition: background 0.2s;
          cursor: default;
        }

        .pec-stat:hover { background: rgba(255,255,255,0.13); }

        .pec-stat-n {
          font-size: clamp(16px, 1.8vw, 22px);
          font-weight: 600; color: #fff;
          line-height: 1; margin-bottom: 4px;
        }

        .pec-stat-l {
          font-size: 10px; color: rgba(255,255,255,0.36); letter-spacing: 0.5px;
        }

        /* ── RIGHT PANEL ── */
        .pec-right {
          width: clamp(360px, 36vw, 460px);
          flex-shrink: 0;
          background: #fff;
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(2rem, 4vw, 3.5rem) clamp(2rem, 3.5vw, 3.25rem);
          position: relative; overflow-y: auto; overflow-x: hidden;
        }

        .pec-right-deco {
          position: absolute;
          bottom: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(139,26,26,0.03);
          pointer-events: none;
        }

        .pec-portal-lbl {
          font-size: 10px; font-weight: 600;
          color: #d4a017; letter-spacing: 2.5px;
          text-transform: uppercase; margin-bottom: 0.5rem;
        }

        .pec-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 2.8vw, 32px);
          font-weight: 700; color: #1a0a0a;
          margin-bottom: 0.3rem; line-height: 1.2;
        }

        .pec-h2 {
          font-size: 13.5px; color: #999;
          font-weight: 300; margin-bottom: 1.75rem;
        }

        /* Role picker */
        .pec-role-lbl {
          font-size: 11px; color: #c0b8b0;
          letter-spacing: 1.2px; text-transform: uppercase;
          margin-bottom: 8px;
        }

        .pec-roles {
          display: flex; gap: 6px;
          flex-wrap: wrap; margin-bottom: 10px;
        }

        .pec-role {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12.5px; font-weight: 400;
          cursor: pointer;
          border: 1px solid #ede8e0;
          background: #faf8f5; color: #888;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.18s; white-space: nowrap;
        }

        .pec-role:hover { border-color: #c09090; color: #8b1a1a; background: #fdf5f5; }

        .pec-role.on {
          background: #8b1a1a; color: #fff;
          border-color: #8b1a1a; font-weight: 500;
        }

        .pec-role-badge {
          font-size: 12px; color: #8b1a1a;
          background: #fdf5f5;
          border: 0.5px solid rgba(139,26,26,0.14);
          border-radius: 7px;
          padding: 7px 12px;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }

        /* Fields */
        .pec-field { margin-bottom: 14px; }

        .pec-flbl {
          font-size: 12px; color: #aaa;
          display: block; margin-bottom: 6px;
        }

        .pec-iw { position: relative; }

        .pec-iico {
          position: absolute; left: 14px;
          top: 50%; transform: translateY(-50%);
          display: flex; align-items: center;
          pointer-events: none;
        }

        .pec-inp {
          width: 100%; height: 46px;
          border: 1.5px solid #ede8e0;
          border-radius: 11px;
          padding: 0 44px;
          font-size: 14px;
          background: #faf8f5; color: #1a0a0a;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .pec-inp::placeholder { color: #c8bdb8; }

        .pec-inp:focus {
          border-color: #8b1a1a; background: #fff;
          box-shadow: 0 0 0 3px rgba(139,26,26,0.09);
        }

        .pec-inp.err { border-color: #c0392b; }

        .pec-eye {
          position: absolute; right: 13px;
          top: 50%; transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #c0b0a8;
          padding: 4px; display: flex; align-items: center;
          transition: color 0.15s;
        }

        .pec-eye:hover { color: #8b1a1a; }

        .pec-emsg {
          font-size: 11.5px; color: #c0392b;
          margin-top: 5px; padding-left: 2px;
        }

        /* Remember row */
        .pec-midrow {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 1.4rem;
        }

        .pec-rem {
          display: flex; align-items: center;
          gap: 8px; font-size: 13px; color: #888;
          cursor: pointer; user-select: none;
        }

        .pec-rem input { accent-color: #8b1a1a; width: 14px; height: 14px; cursor: pointer; }

        .pec-forgot {
          font-size: 13px; color: #8b1a1a;
          text-decoration: none; font-weight: 500;
        }

        .pec-forgot:hover { text-decoration: underline; }

        /* Submit btn */
        .pec-btn {
          width: 100%; height: 48px;
          background: #8b1a1a; color: #fff;
          border: none; border-radius: 11px;
          font-size: 15px; font-weight: 500;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, transform 0.1s;
        }

        .pec-btn:hover:not(:disabled) { background: #a01f1f; }
        .pec-btn:active:not(:disabled) { transform: scale(0.985); }
        .pec-btn:disabled { background: #c09090; cursor: not-allowed; }

        /* Alert */
        .pec-alert {
          background: #fdf0f0;
          border: 1px solid #f5c6c6;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px; color: #c0392b;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }

        /* Divider */
        .pec-div {
          display: flex; align-items: center;
          gap: 12px; margin: 1.3rem 0 0.9rem;
        }

        .pec-dline { flex: 1; height: 0.5px; background: #ede8e0; }
        .pec-dtxt { font-size: 11px; color: #ccc; letter-spacing: 0.8px; }

        .pec-ssl {
          display: flex; align-items: center;
          justify-content: center; gap: 7px;
          font-size: 12px; color: #c0b8b0;
        }

        .pec-url {
          text-align: center; font-size: 11px;
          color: #d0c8c0; margin-top: 0.8rem; letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .pec-page { flex-direction: column; overflow-y: auto; height: auto; min-height: 100vh; }
          .pec-left { min-height: 260px; flex: none; padding: 1.75rem; }
          .pec-right { width: 100%; padding: 2rem 1.75rem; }
          html, body, #root { overflow: auto; }
        }
      `}</style>

      <div className="pec-page">

        {/* LEFT */}
        <div className="pec-left">
          <div className="pec-dots" />
          <div className="pec-ring pec-r1" />
          <div className="pec-ring pec-r2" />
          <div className="pec-ring pec-r3" />
          <div className="pec-ring pec-r4" />

<div className="pec-brand">
  <img src={logo} alt="College Logo" className="pec-logo" />

  <div>
              <div className="pec-college-name">Prathyusha Engineering College</div>
              <div className="pec-college-type">Autonomous Institution</div>
            </div>
          </div>

          <div className="pec-hero">
            <div className="pec-gold-bar" />
            <div className="pec-tagline">
              Academic<br /><em>Project Management</em><br />System
            </div>
            <div className="pec-tagline-desc">
              Attendance, marks, and academic performance — managed seamlessly in one unified portal.
            </div>
          </div>

          <div className="pec-stats">
            {[
              { n: '5000+', l: 'Students'   },
              { n: '200+',  l: 'Faculty'    },
              { n: 'NAAC A+', l: 'Accredited' },
              { n: 'NBA',   l: 'Certified'  },
              { n: 'AICTE', l: 'Approved'   },
            ].map(s => (
              <div className="pec-stat" key={s.l}>
                <div className="pec-stat-n">{s.n}</div>
                <div className="pec-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="pec-right">
          <div className="pec-right-deco" />

          <div className="pec-portal-lbl">APMS Portal</div>
          <div className="pec-h1">Welcome back</div>
          <div className="pec-h2">Sign in to continue</div>

          <div className="pec-role-lbl">Sign in as</div>
          <div className="pec-roles">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                className={`pec-role${role === r.id ? ' on' : ''}`}
                onClick={() => setRole(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="pec-role-badge">{currentRole?.desc}</div>

          {error && (
            <div className="pec-alert"><span>⚠</span> {error}</div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
            noValidate
          >
            <div className="pec-field">
              <label className="pec-flbl">Email address</label>
              <div className="pec-iw">
                <span className="pec-iico"><MailIcon /></span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder={PLACEHOLDERS[role]}
                  className={`pec-inp${errors.email ? ' err' : ''}`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && <div className="pec-emsg">{errors.email.message}</div>}
            </div>

            <div className="pec-field">
              <label className="pec-flbl">Password</label>
              <div className="pec-iw">
                <span className="pec-iico"><LockIcon /></span>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`pec-inp${errors.password ? ' err' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pec-eye"
                  onClick={() => setShowPass(p => !p)}
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <div className="pec-emsg">{errors.password.message}</div>}
            </div>

            <div className="pec-midrow">
              <label className="pec-rem">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="pec-forgot">Forgot password?</a>
            </div>

            <button type="submit" className="pec-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : <><span>Sign in</span><ArrowIcon /></>}
            </button>
          </form>

          <div className="pec-div">
            <div className="pec-dline" />
            <span className="pec-dtxt">secure access</span>
            <div className="pec-dline" />
          </div>

          <div className="pec-ssl"><ShieldIcon /> Protected by SSL encryption</div>
          <div className="pec-url">prathyusha.edu.in</div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;