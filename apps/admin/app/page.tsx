'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
type Overview = { users: number; gyms: number; trainers: number; activeMemberships: number; pendingVerifications: number; openReports: number };
type Verification = { id: string; subjectType: string; subjectId: string; status: string; submittedAt: string };

export default function AdminHome() {
  const [phone, setPhone] = useState('+919000000099');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState('');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [error, setError] = useState('');

  const request = async (path: string, options: RequestInit = {}, activeToken = token) => {
    const response = await fetch(API + path, { ...options, headers: { 'content-type': 'application/json', ...(activeToken ? { authorization: 'Bearer ' + activeToken } : {}), ...(options.headers ?? {}) } });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message ?? 'Request failed');
    return body.data;
  };
  const load = async (activeToken: string) => {
    const [nextOverview, nextVerifications] = await Promise.all([request('/admin/overview', {}, activeToken), request('/admin/verifications', {}, activeToken)]);
    setOverview(nextOverview);
    setVerifications(nextVerifications ?? []);
  };
  useEffect(() => { const stored = window.localStorage.getItem('kurn_admin_token'); if (stored) { setToken(stored); load(stored).catch(() => window.localStorage.removeItem('kurn_admin_token')); } }, []);
  const sendOtp = async () => { setError(''); try { await request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }, ''); setSent(true); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send OTP'); } };
  const signIn = async () => { setError(''); try { const data = await request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code }) }, ''); if (data.user.role !== 'ADMIN') throw new Error('This account is not an admin account'); window.localStorage.setItem('kurn_admin_token', data.token); setToken(data.token); await load(data.token); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in'); } };
  const decide = async (id: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED') => { try { await request('/admin/verifications/' + id + '/decision', { method: 'POST', body: JSON.stringify({ status }) }); await load(token); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save decision'); } };

  if (!token || !overview) return <main style={styles.auth}><div style={styles.authCard}><p style={styles.kicker}>KURN ADMIN</p><h1>Operate a trusted marketplace.</h1><p style={styles.muted}>Sign in with the platform admin account to review gyms, trainers and reports.</p><input style={styles.input} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 mobile number" /><>{sent && <input style={styles.input} value={code} onChange={(event) => setCode(event.target.value)} placeholder="6-digit OTP" />}</><button style={styles.button} onClick={sent ? signIn : sendOtp}>{sent ? 'Sign in' : 'Send OTP'}</button>{error && <p style={styles.error}>{error}</p>}<p style={styles.hint}>Local development admin: +91 90000 00099 · OTP: 123456</p></div></main>;
  return <main style={styles.page}><header style={styles.header}><div><p style={styles.kicker}>KURN ADMIN</p><h1>Platform overview</h1></div><button style={styles.secondary} onClick={() => { window.localStorage.removeItem('kurn_admin_token'); setToken(''); }}>Sign out</button></header><p style={styles.muted}>Review marketplace health and keep every listing trustworthy.</p><section style={styles.grid}>{[['Users', overview.users], ['Gyms', overview.gyms], ['Trainers', overview.trainers], ['Active memberships', overview.activeMemberships], ['Pending verification', overview.pendingVerifications], ['Open reports', overview.openReports]].map(([label, value]) => <div key={String(label)} style={styles.metric}><span style={styles.muted}>{label}</span><strong style={styles.number}>{value}</strong></div>)}</section><section style={styles.panel}><div style={styles.panelHeader}><div><h2>Verification queue</h2><p style={styles.muted}>Approve only after reviewing the submitted evidence.</p></div><span style={styles.pill}>{verifications.length} pending</span></div>{verifications.length === 0 ? <p style={styles.muted}>No verification requests.</p> : verifications.map((item) => <div key={item.id} style={styles.row}><div><strong>{item.subjectType}</strong><p style={styles.muted}>{item.subjectId}</p></div><span style={styles.status}>{item.status}</span><div style={styles.actions}><button style={styles.approve} onClick={() => decide(item.id, 'VERIFIED')}>Approve</button><button style={styles.reject} onClick={() => decide(item.id, 'REJECTED')}>Reject</button></div></div>)}</section>{error && <p style={styles.error}>{error}</p>}</main>;
}

const styles: Record<string, CSSProperties> = {
  auth: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f9f8', padding: 24 },
  authCard: { width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #e8ecea', borderRadius: 20, padding: 32, display: 'grid', gap: 14 },
  page: { maxWidth: 1180, margin: '0 auto', padding: '40px 24px', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' },
  kicker: { letterSpacing: 3, fontWeight: 800, fontSize: 12 },
  muted: { color: '#777e83', lineHeight: 1.5 },
  input: { height: 48, border: '1px solid #dfe6e2', borderRadius: 10, padding: '0 14px', fontSize: 16 },
  button: { height: 48, background: '#111315', color: '#fff', border: 0, borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  secondary: { height: 42, padding: '0 16px', border: '1px solid #dfe6e2', background: '#fff', borderRadius: 10, cursor: 'pointer' },
  hint: { color: '#777e83', fontSize: 12 },
  error: { color: '#b42318' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, margin: '30px 0' },
  metric: { background: '#fff', border: '1px solid #e8ecea', borderRadius: 16, padding: 20, display: 'grid', gap: 10 },
  number: { fontSize: 30 },
  panel: { background: '#fff', border: '1px solid #e8ecea', borderRadius: 16, padding: 24 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  pill: { background: '#d9f0e0', borderRadius: 99, padding: '6px 10px', fontSize: 12, fontWeight: 700 },
  row: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,auto)', alignItems: 'center', gap: 16, borderTop: '1px solid #edf1ef', padding: '16px 0', overflowWrap: 'anywhere' },
  status: { color: '#777e83', fontSize: 13 },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' },
  approve: { border: 0, background: '#d9f0e0', borderRadius: 8, padding: '9px 12px', cursor: 'pointer' },
  reject: { border: '1px solid #f1c7c4', color: '#b42318', background: '#fff', borderRadius: 8, padding: '9px 12px', cursor: 'pointer' },
};
