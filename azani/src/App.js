import { useState } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import InstitutionPortal from './InstitutionPortal';

const API = 'https://azani-server.onrender.com/api/auth';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [institution, setInstitution] = useState(JSON.parse(localStorage.getItem('institution') || 'null'));
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ institutionName: '', institutionType: '', contactPersonName: '', email: '', phoneNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);

  const pwdRules = [
    { label: 'At least 8 characters', test: p => p.length >= 8 },
    { label: 'One uppercase letter (A–Z)', test: p => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a–z)', test: p => /[a-z]/.test(p) },
    { label: 'One number (0–9)', test: p => /[0-9]/.test(p) },
    { label: 'One special character (!@#$%^&*)', test: p => /[!@#$%^&*]/.test(p) },
  ];

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const body = isLogin ? { email: form.email, password: form.password } : form;
      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('institution', JSON.stringify(data.institution));
      setToken(data.token);
      setInstitution(data.institution);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('institution');
    setToken(null);
    setInstitution(null);
  };

  if (token && institution?.role === 'admin') return <Dashboard institution={institution} onLogout={handleLogout} />;
  if (token && institution?.role === 'institution') return <InstitutionPortal user={institution} onLogout={handleLogout} />;

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${isLogin ? 'login-mode' : ''}`}>

        {/* Left teal panel */}
        <div className="auth-panel">
          <div className="company-logo">Azani ISP</div>
          {isLogin ? (
            <>
              <h2>New Here?</h2>
              <p>Sign up and start managing internet services for your institution</p>
              <button className="panel-btn" onClick={() => setIsLogin(false)}>SIGN UP</button>
            </>
          ) : (
            <>
              <h2>Welcome Back!</h2>
              <p>To keep connected with us please login with your personal info</p>
              <button className="panel-btn" onClick={() => setIsLogin(true)}>SIGN IN</button>
            </>
          )}
          <div className="panel-illustration">
            <div className="phone-mock">
              <div className="phone-screen">
                <div className="toggle-icon"></div>
                <div className="lines">
                  <span></span><span></span><span></span>
                </div>
                <div className="small-bar"></div>
              </div>
            </div>
            <div className="person">🧍</div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form">
          {isLogin ? (
            <>
              <h1>Sign In</h1>
              <p className="or-text">use your account</p>
              <form onSubmit={submit} style={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:'0'}}>
                <div className="input-group">
                  <span>✉</span>
                  <input type="email" name="email" placeholder="Email" value={form.email} onChange={handle} required />
                </div>
                <div className="input-group">
                  <span>🔒</span>
                  <input type="password" name="password" placeholder="Password" value={form.password} onChange={handle} required />
                </div>

                {error && <p className="error-msg">{error}</p>}
                <button className="submit-btn" type="submit" disabled={loading}>{loading ? '...' : 'SIGN IN'}</button>
              </form>
            </>
          ) : (
            <>
              <h1>Register Institution</h1>
              <p className="or-text">Fill in institution details:</p>
              <form onSubmit={submit} style={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:'0'}}>
                <div className="input-group">
                  <span>🏫</span>
                  <input type="text" name="institutionName" placeholder="Institution Name" value={form.institutionName} onChange={handle} required />
                </div>
                <div className="input-group">
                  <span>📋</span>
                  <select name="institutionType" value={form.institutionType} onChange={handle} required>
                    <option value="">Institution Type</option>
                    <option value="primary">Primary School</option>
                    <option value="junior">Junior School</option>
                    <option value="senior">Senior School</option>
                    <option value="college">College</option>
                  </select>
                </div>
                <div className="input-group">
                  <span>👤</span>
                  <input type="text" name="contactPersonName" placeholder="Contact Person Name" value={form.contactPersonName} onChange={handle} required />
                </div>
                <div className="input-group">
                  <span>✉</span>
                  <input type="email" name="email" placeholder="Contact Email" value={form.email} onChange={handle} required />
                </div>
                <div className="input-group">
                  <span>📞</span>
                  <input type="tel" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handle} required />
                </div>
                <div className="input-group">
                  <span>🔒</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handle}
                    onFocus={() => setPwdFocused(true)}
                    onBlur={() => setPwdFocused(false)}
                    required
                  />
                </div>
                {pwdFocused && form.password.length > 0 && (
                  <div className="pwd-requirements">
                    <p className="pwd-title">Password must contain:</p>
                    {pwdRules.map((rule, i) => (
                      <div key={i} className={`pwd-rule ${rule.test(form.password) ? 'pass' : 'fail'}`}>
                        <span>{rule.test(form.password) ? '✓' : '✗'}</span>
                        {rule.label}
                      </div>
                    ))}
                  </div>
                )}
                {error && <p className="error-msg">{error}</p>}
                <button className="submit-btn" type="submit" disabled={loading}>{loading ? '...' : 'SIGN UP'}</button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
