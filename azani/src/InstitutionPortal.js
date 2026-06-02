import { useState, useEffect } from 'react';
import './InstitutionPortal.css';

const API = 'https://azani-server.onrender.com/api/institution';

const BW_PRICES = { '4': 1200, '10': 2000, '20': 3500, '25': 4000, '50': 7000 };
const BW_OPTIONS = [
  { mbps: '4', price: 1200 }, { mbps: '10', price: 2000 },
  { mbps: '20', price: 3500 }, { mbps: '25', price: 4000 }, { mbps: '50', price: 7000 },
];

const navItems = [
  { icon: '🏠', label: 'My Dashboard', id: 'home' },
  { icon: '📡', label: 'My Service', id: 'service' },
  { icon: '💳', label: 'Payments', id: 'payments' },
  { icon: '🖥️', label: 'Infrastructure', id: 'infrastructure' },
  { icon: '👤', label: 'My Profile', id: 'profile' },
  { icon: '🆘', label: 'Support', id: 'support' },
];

function Pulse({ color }) {
  return (
    <span className="pulse-wrap">
      <span className="pulse-ring" style={{ borderColor: color }} />
      <span className="pulse-dot" style={{ background: color }} />
    </span>
  );
}

function AnimatedCounter({ target, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function InfrastructureSection({ inst, token, onSave }) {
  const [form, setForm] = useState({
    numberOfUsers: inst?.numberOfUsers || '',
    computersPurchased: inst?.computersPurchased || '',
    lanNodesPurchased: inst?.lanNodesPurchased || '',
    hasLAN: inst?.hasLAN || false,
    isReadyForConnectivity: inst?.isReadyForConnectivity || false,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handle = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch('https://azani-server.onrender.com/api/institution/infrastructure', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) { onSave(data); setSaved(true); setDirty(false); }
    setSaving(false);
  };

  const LAN_COST = { 2: 10000, 11: 20000, 21: 30000, 41: 40000 };
  const getLANCost = (nodes) => {
    const n = parseInt(nodes);
    if (!n) return 0;
    if (n <= 10) return 10000;
    if (n <= 20) return 20000;
    if (n <= 40) return 30000;
    if (n <= 100) return 40000;
    return 0;
  };

  const computerCost = (parseInt(form.computersPurchased) || 0) * 40000;
  const lanCost = getLANCost(form.lanNodesPurchased);
  const totalInfra = computerCost + lanCost;

  return (
    <div className="ip-section">
      <div className="ip-panel">
        <h3 className="ip-panel-title">🖥️ Infrastructure Details
          <span className="ip-infra-badge">Editable — Admin can view this</span>
        </h3>

        <div className="ip-infra-form-grid">

          <div className="ip-field">
            <label>👥 Number of Users</label>
            <input type="number" name="numberOfUsers" value={form.numberOfUsers} onChange={handle} placeholder="e.g. 50" min="0" />
            <small>Total users who will access the internet</small>
          </div>

          <div className="ip-field">
            <label>🖥️ Computers to Purchase from Azani</label>
            <input type="number" name="computersPurchased" value={form.computersPurchased} onChange={handle} placeholder="e.g. 10" min="0" />
            <small>@ KSh 40,000 each — Total: <strong>KSh {computerCost.toLocaleString()}</strong></small>
          </div>

          <div className="ip-field">
            <label>🔗 LAN Nodes Required</label>
            <input type="number" name="lanNodesPurchased" value={form.lanNodesPurchased} onChange={handle} placeholder="2–100 nodes" min="2" max="100" />
            <small>
              2–10: KSh 10,000 &nbsp;|&nbsp; 11–20: KSh 20,000 &nbsp;|&nbsp; 21–40: KSh 30,000 &nbsp;|&nbsp; 41–100: KSh 40,000
              <br />Estimated: <strong>KSh {lanCost.toLocaleString()}</strong>
            </small>
          </div>

          <div className="ip-field ip-field-check">
            <label>🔌 Does your institution have an existing LAN?</label>
            <div className="ip-toggle-wrap">
              <label className="ip-toggle">
                <input type="checkbox" name="hasLAN" checked={form.hasLAN} onChange={handle} />
                <span className="ip-toggle-slider" />
              </label>
              <span className={form.hasLAN ? 'ip-yes' : 'ip-no'}>{form.hasLAN ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="ip-field ip-field-check">
            <label>✅ Is your institution ready for connectivity?</label>
            <div className="ip-toggle-wrap">
              <label className="ip-toggle">
                <input type="checkbox" name="isReadyForConnectivity" checked={form.isReadyForConnectivity} onChange={handle} />
                <span className="ip-toggle-slider" />
              </label>
              <span className={form.isReadyForConnectivity ? 'ip-yes' : 'ip-no'}>{form.isReadyForConnectivity ? 'Ready' : 'Not Ready'}</span>
            </div>
            <small>Ready institutions pay KSh 10,000 installation fee</small>
          </div>

        </div>

        {/* Cost Summary */}
        <div className="ip-infra-summary">
          <div className="ip-summary-row">
            <span>Computers ({form.computersPurchased || 0} × KSh 40,000)</span>
            <span>KSh {computerCost.toLocaleString()}</span>
          </div>
          <div className="ip-summary-row">
            <span>LAN Nodes ({form.lanNodesPurchased || 0} nodes)</span>
            <span>KSh {lanCost.toLocaleString()}</span>
          </div>
          {form.isReadyForConnectivity && (
            <div className="ip-summary-row">
              <span>Installation Fee</span>
              <span>KSh 10,000</span>
            </div>
          )}
          <div className="ip-summary-row ip-summary-total">
            <span>Total Infrastructure Cost</span>
            <span>KSh {(totalInfra + (form.isReadyForConnectivity ? 10000 : 0)).toLocaleString()}</span>
          </div>
        </div>

        {/* Save Button */}
        {dirty && (
          <button className={`ip-save-btn ${saving ? 'ip-saving' : ''}`} onClick={save} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Infrastructure Details'}
          </button>
        )}
        {saved && <div className="ip-saved-msg">✅ Details saved successfully!</div>}
      </div>
    </div>
  );
}

function RegistrationModal({ onClose, onSuccess, token }) {
  const [step, setStep] = useState('options'); // options | cash | mpesa | done
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [mpesaCode, setMpesaCode] = useState('');
  const [mpesaError, setMpesaError] = useState('');

  const handleCash = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    const res = await fetch('https://azani-server.onrender.com/api/institution/pay-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ method: 'cash' })
    });
    if (res.ok) { setStep('done'); }
    setProcessing(false);
  };

  const handleMpesa = async () => {
    if (!phone || phone.length < 9) return;
    setProcessing(true);
    try {
      const res = await fetch('https://azani-server.onrender.com/api/institution/pay-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ method: 'mpesa', phone })
      });
      const data = await res.json();
      if (res.ok && data.pending) {
        setStep('pin');
      } else if (res.ok) {
        setStep('done');
      } else {
        setMpesaError(data.message || 'Payment failed. Try again.');
      }
    } catch (err) {
      setMpesaError('Network error. Check your connection.');
    }
    setProcessing(false);
  };

  const confirmPin = async () => {
    setProcessing(true);
    const res = await fetch('https://azani-server.onrender.com/api/institution/mpesa/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) { setStep('done'); }
    setProcessing(false);
  };

  return (
    <div className="reg-overlay" onClick={e => e.target.classList.contains('reg-overlay') && onClose()}>
      <div className="reg-modal">

        {/* Header */}
        <div className="reg-modal-header">
          <div className="reg-modal-icon">🎓</div>
          <div>
            <h2>Activate Your Account</h2>
            <p>Registration Fee: <strong>KSh 8,500</strong></p>
          </div>
          <button className="reg-close" onClick={onClose}>✕</button>
        </div>

        {/* Step: options */}
        {step === 'options' && (
          <div className="reg-options">
            <p className="reg-sub">Choose your preferred payment method:</p>
            <div className="reg-payment-cards">

              <button className="reg-pay-card reg-cash" onClick={() => setStep('cash')}>
                <div className="reg-pay-icon">💵</div>
                <div className="reg-pay-label">Pay in Cash</div>
                <div className="reg-pay-desc">Visit our office and pay in person</div>
                <div className="reg-pay-arrow">→</div>
              </button>

              <button className="reg-pay-card reg-mpesa" onClick={() => setStep('mpesa')}>
                <div className="reg-pay-icon">📱</div>
                <div className="reg-pay-label">Pay with M-Pesa</div>
                <div className="reg-pay-desc">Instant payment via M-Pesa STK push</div>
                <div className="reg-pay-arrow">→</div>
              </button>

            </div>
          </div>
        )}

        {/* Step: cash */}
        {step === 'cash' && (
          <div className="reg-step">
            <div className="reg-step-icon">💵</div>
            <h3>Cash Payment</h3>
            <div className="reg-cash-info">
              <div className="reg-cash-row"><span>Amount</span><strong>KSh 8,500</strong></div>
              <div className="reg-cash-row"><span>Payable To</span><strong>Azani ISP Ltd</strong></div>
              <div className="reg-cash-row"><span>Office</span><strong>Nairobi CBD, Kenya</strong></div>
              <div className="reg-cash-row"><span>Working Hours</span><strong>Mon–Fri, 8AM–5PM</strong></div>
            </div>
            <div className="reg-notice-warn">⚠️ Bring your institution registration confirmation email.</div>
            <div className="reg-step-btns">
              <button className="reg-back-btn" onClick={() => setStep('options')}>← Back</button>
              <button className="reg-confirm-btn" onClick={handleCash} disabled={processing}>
                {processing ? <span className="reg-spin" /> : '✅ Confirm Cash Payment'}
              </button>
            </div>
          </div>
        )}

        {/* Step: mpesa */}
        {step === 'mpesa' && (
          <div className="reg-step">
            <div className="reg-step-icon">📱</div>
            <h3>M-Pesa Payment</h3>
            <div className="reg-mpesa-logo">M-PESA</div>
            <div className="reg-mpesa-amount">KSh 8,500</div>
            <p className="reg-mpesa-sub">Enter your M-Pesa registered phone number to receive an STK push</p>
            <div className="reg-phone-wrap">
              <span className="reg-phone-prefix">+254</span>
              <input
                type="tel"
                placeholder="7XX XXX XXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={10}
              />
            </div>
            <div className="reg-step-btns">
              <button className="reg-back-btn" onClick={() => setStep('options')}>← Back</button>
              <button className="reg-mpesa-btn" onClick={handleMpesa} disabled={processing || phone.length < 9}>
                {processing ? (
                  <><span className="reg-spin" /> Processing...</>
                ) : '📲 Send STK Push'}
              </button>
            </div>
            {mpesaError && <div className="reg-notice-warn" style={{marginTop:8}}>⚠️ {mpesaError}</div>}
          </div>
        )}

        {/* Step: pin — waiting for user to enter PIN on phone */}
        {step === 'pin' && (
          <div className="reg-step">
            <div className="reg-pin-anim">
              <div className="reg-phone-icon">📲</div>
              <div className="reg-ping" />
            </div>
            <h3>Check Your Phone</h3>
            <p className="reg-mpesa-sub">An STK push has been sent to <strong>+254{phone}</strong>.<br />Enter your M-Pesa PIN to complete the payment.</p>
            <div className="reg-pin-amount">KSh 8,500</div>
            <div className="reg-step-btns">
              <button className="reg-back-btn" onClick={() => setStep('mpesa')}>← Back</button>
              <button className="reg-confirm-btn" onClick={confirmPin} disabled={processing}>
                {processing ? <><span className="reg-spin" /> Verifying...</> : '✅ I\'ve Entered My PIN'}
              </button>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div className="reg-done">
            <div className="reg-done-circle">✓</div>
            <h3>Payment Received!</h3>
            <p>Thank you for your payment.</p>
            <div className="reg-review-box">
              <span className="reg-review-icon">🔍</span>
              <div>
                <strong>Under Review</strong>
                <p>Your account is going to be reviewed and activated within the next <strong>24 hours</strong> by our Agents.</p>
              </div>
            </div>
            <button className="reg-confirm-btn" onClick={onClose}>Got it →</button>
          </div>
        )}

      </div>
    </div>
  );
}

function BandwidthModal({ selected, inst, token, onClose }) {
  const [step, setStep] = useState('details'); // details | confirm | done
  const [ordering, setOrdering] = useState(false);

  const currentBw = inst?.currentBandwidth;
  const isUpgrade = !currentBw || parseInt(selected.mbps) > parseInt(currentBw);
  const discountedPrice = isUpgrade ? Math.round(selected.price * 0.9) : selected.price;
  const users = inst?.numberOfUsers || 0;
  const nodes = inst?.lanNodesPurchased || 0;
  const computers = inst?.computersPurchased || 0;
  const hasLAN = inst?.hasLAN;

  // Suitability analysis
  const analysis = [];
  let suitabilityScore = 0;

  const mbps = parseInt(selected.mbps);
  const perUser = users > 0 ? (mbps / users).toFixed(2) : null;

  if (users > 0) {
    if (mbps / users >= 0.5) { analysis.push({ ok: true, text: `${selected.mbps} MBPS is sufficient for your ${users} users (${perUser} MBPS/user)` }); suitabilityScore += 2; }
    else if (mbps / users >= 0.2) { analysis.push({ ok: true, text: `${selected.mbps} MBPS is manageable for ${users} users (${perUser} MBPS/user — moderate usage)` }); suitabilityScore += 1; }
    else { analysis.push({ ok: false, text: `${selected.mbps} MBPS may be low for ${users} users (only ${perUser} MBPS/user)` }); }
  }

  if (nodes > 0) {
    if (mbps >= 20) { analysis.push({ ok: true, text: `Good bandwidth for your ${nodes}-node LAN network` }); suitabilityScore += 1; }
    else { analysis.push({ ok: false, text: `Consider higher bandwidth to support your ${nodes}-node LAN effectively` }); }
  }

  if (computers > 0) {
    if (mbps / computers >= 0.3) { analysis.push({ ok: true, text: `Adequate for your ${computers} computers` }); suitabilityScore += 1; }
    else { analysis.push({ ok: false, text: `${computers} computers may strain ${selected.mbps} MBPS bandwidth` }); }
  }

  if (!hasLAN && nodes === 0) analysis.push({ ok: false, text: 'No LAN detected — internet will be limited to direct connections' });
  if (currentBw && parseInt(currentBw) >= mbps) analysis.push({ ok: false, text: `You currently have ${currentBw} MBPS — this is not an upgrade` });
  else if (currentBw) analysis.push({ ok: true, text: `Upgrade from ${currentBw} MBPS → ${selected.mbps} MBPS (10% discount applied)` });

  const suitable = suitabilityScore >= 2;

  const handleOrder = async () => {
    setOrdering(true);
    await fetch('https://azani-server.onrender.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        bandwidth: selected.mbps,
        monthlyFee: selected.price,
        discountedFee: discountedPrice,
        currentBandwidth: inst?.currentBandwidth,
      })
    });
    setOrdering(false);
    setStep('done');
  };

  return (
    <div className="bw-overlay" onClick={e => e.target.classList.contains('bw-overlay') && onClose()}>
      <div className="bw-modal">

        {/* Header */}
        <div className="bw-modal-header">
          <div className="bw-header-signal">
            {[1,2,3,4].map(b => <div key={b} className="bw-sig" style={{ height: `${b * 25}%`, opacity: b <= Math.ceil(mbps / 15) ? 1 : 0.3 }} />)}
          </div>
          <div>
            <h2>{selected.mbps} MBPS Package</h2>
            <p>KSh {discountedPrice.toLocaleString()}/month {isUpgrade && <span className="bw-discount-tag">10% OFF</span>}</p>
          </div>
          <button className="reg-close" onClick={onClose}>✕</button>
        </div>

        {step === 'details' && (
          <div className="bw-body">

            {/* Price breakdown */}
            <div className="bw-price-box">
              <div className="bw-price-row"><span>Standard Price</span><span className={isUpgrade ? 'bw-strike' : ''}>KSh {selected.price.toLocaleString()}/mo</span></div>
              {isUpgrade && (
                <div className="bw-price-row"><span>Upgrade Discount (10%)</span><span className="bw-save">− KSh {(selected.price - discountedPrice).toLocaleString()}</span></div>
              )}
              <div className="bw-price-row bw-price-total"><span>You Pay</span><span>KSh {discountedPrice.toLocaleString()}/month</span></div>
            </div>

            {/* Suitability */}
            <div className="bw-suit-title">
              <span>{suitable ? '✅' : '⚠️'}</span>
              <h4>{suitable ? 'Good fit for your institution' : 'Review before ordering'}</h4>
            </div>
            <div className="bw-analysis">
              {analysis.length === 0 ? (
                <div className="bw-analysis-row"><span className="bw-ok">ℹ️</span><p>Fill in your infrastructure details for a full suitability check.</p></div>
              ) : analysis.map((a, i) => (
                <div className="bw-analysis-row" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className={a.ok ? 'bw-ok' : 'bw-warn'}>{a.ok ? '✅' : '⚠️'}</span>
                  <p>{a.text}</p>
                </div>
              ))}
            </div>

            <div className="bw-modal-btns">
              <button className="reg-back-btn" onClick={onClose}>← Cancel</button>
              <button className="bw-order-btn" onClick={() => setStep('confirm')}>
                📋 Review & Order →
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="bw-body">
            <h3 className="bw-confirm-title">Confirm Your Order</h3>
            <div className="bw-confirm-summary">
              <div className="bw-confirm-row"><span>📡 Bandwidth</span><strong>{selected.mbps} MBPS</strong></div>
              <div className="bw-confirm-row"><span>💰 Monthly Fee</span><strong>KSh {discountedPrice.toLocaleString()}</strong></div>
              <div className="bw-confirm-row"><span>🏫 Institution</span><strong>{inst?.institutionName}</strong></div>
              <div className="bw-confirm-row"><span>📍 Type</span><strong style={{textTransform:'capitalize'}}>{inst?.institutionType}</strong></div>
              <div className="bw-confirm-row"><span>👥 Users</span><strong>{inst?.numberOfUsers || '—'}</strong></div>
              <div className="bw-confirm-row"><span>🔗 LAN Nodes</span><strong>{inst?.lanNodesPurchased || '—'}</strong></div>
            </div>
            <div className="ip-notice ip-notice-info" style={{margin:'12px 0'}}>
              <span>ℹ️</span><p>By clicking <strong>Order Purchase</strong>, one of our agents will contact you to schedule a school visit.</p>
            </div>
            <div className="bw-modal-btns">
              <button className="reg-back-btn" onClick={() => setStep('details')}>← Back</button>
              <button className="bw-order-btn bw-order-final" onClick={handleOrder} disabled={ordering}>
                {ordering ? <><span className="reg-spin" /> Processing...</> : '🛒 Order Purchase'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="bw-done">
            <div className="bw-done-rings">
              <div className="bw-done-ring r1" />
              <div className="bw-done-ring r2" />
              <div className="bw-done-ring r3" />
              <div className="bw-done-check">✓</div>
            </div>
            <h2>Order Placed!</h2>
            <p className="bw-done-sub">Thank you, <strong>{inst?.institutionName}</strong>.</p>
            <div className="bw-done-card">
              <div className="bw-done-agent">
                <div className="bw-agent-avatar">👨‍💼</div>
                <div>
                  <strong>Agent Visit Scheduled</strong>
                  <p>One of our professional agents will be calling you shortly to schedule a school visit and complete the installation process for your <strong>{selected.mbps} MBPS</strong> package.</p>
                </div>
              </div>
              <div className="bw-done-timeline">
                {[
                  { icon: '📞', label: 'Agent Call', desc: 'Within 24 hours' },
                  { icon: '🏫', label: 'School Visit', desc: 'Within 3–5 days' },
                  { icon: '🔧', label: 'Installation', desc: 'Same day as visit' },
                  { icon: '📡', label: 'Go Live', desc: 'Immediately after install' },
                ].map((t, i) => (
                  <div className="bw-timeline-step" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="bw-tl-icon">{t.icon}</div>
                    <div className="bw-tl-line" />
                    <div className="bw-tl-text"><strong>{t.label}</strong><span>{t.desc}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <button className="bw-order-btn" style={{width:'100%',marginTop:8}} onClick={onClose}>Back to Dashboard →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentsTab({ inst, token, onUpdate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null); // 'monthly' | 'installation' | 'reconnection'
  const [method, setMethod] = useState('cash');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');

  const monthlyFee = inst?.currentBandwidth ? BW_PRICES[inst.currentBandwidth] : 0;
  const overdueFine = !inst?.monthlyFeePaid && inst?.serviceActive ? parseFloat((monthlyFee * 0.15).toFixed(2)) : 0;
  const totalMonthlyDue = monthlyFee + overdueFine + (inst?.needsReconnection ? 1000 : 0);

  useEffect(() => {
    fetch('https://azani-server.onrender.com/api/payments/history', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => { setHistory(Array.isArray(data) ? data : []); setLoading(false); });
  }, [token]);

  const handlePay = async (type) => {
    setPaying(type);
    setMsg('');
    const res = await fetch(`https://azani-server.onrender.com/api/payments/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ method, phone })
    });
    const data = await res.json();
    if (res.ok && data.pending) {
      setMsg('📲 STK push sent — enter your M-Pesa PIN to complete.');
    } else if (res.ok) {
      setMsg('✅ Payment recorded successfully!');
      onUpdate(data.institution);
      // Refresh history
      fetch('https://azani-server.onrender.com/api/payments/history', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(d => setHistory(Array.isArray(d) ? d : []));
    } else {
      setMsg(`❌ ${data.message}`);
    }
    setPaying(null);
  };

  const TYPE_COLORS = { registration: '#3fc6aa', installation: '#27ae60', monthly: '#1abc9c', reconnection: '#e67e22' };

  return (
    <div className="ip-section">
      {/* Summary Cards */}
      <div className="ip-cards" style={{ marginBottom: 24 }}>
        {[
          { icon: '📝', label: 'Registration Fee', value: 'KSh 8,500', paid: inst?.registrationFeePaid, color: '#3fc6aa' },
          { icon: '🔧', label: 'Installation Fee', value: 'KSh 10,000', paid: inst?.installationFeePaid, color: '#27ae60', show: inst?.isReadyForConnectivity },
          { icon: '📅', label: 'Monthly Fee', value: `KSh ${monthlyFee.toLocaleString()}`, paid: inst?.monthlyFeePaid, color: '#1abc9c', show: inst?.serviceActive },
          { icon: '⚠️', label: 'Overdue Fine (15%)', value: `KSh ${overdueFine.toLocaleString()}`, paid: overdueFine === 0, color: '#e67e22', show: overdueFine > 0 },
          { icon: '🔁', label: 'Reconnection Fee', value: 'KSh 1,000', paid: !inst?.needsReconnection, color: '#e74c3c', show: inst?.needsReconnection },
        ].filter(c => c.show !== false).map((c, i) => (
          <div className="ip-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="ip-card-icon" style={{ background: c.color + '22', color: c.color }}>{c.icon}</div>
            <div className="ip-card-info">
              <h3>{c.value}</h3>
              <p>{c.label} <span style={{ color: c.paid ? '#2ecc71' : '#e74c3c', fontWeight: 700 }}>{c.paid ? '✅' : '❌'}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Actions */}
      {inst?.serviceActive && (
        <div className="ip-panel" style={{ marginBottom: 24 }}>
          <h3 className="ip-panel-title">💳 Make a Payment</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" value="cash" checked={method === 'cash'} onChange={() => setMethod('cash')} /> Cash
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" value="mpesa" checked={method === 'mpesa'} onChange={() => setMethod('mpesa')} /> M-Pesa
            </label>
          </div>
          {method === 'mpesa' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ alignSelf: 'center', color: '#888' }}>+254</span>
              <input className="ip-input" type="tel" placeholder="7XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} style={{ maxWidth: 200 }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!inst?.monthlyFeePaid && (
              <button className="ip-save-btn" onClick={() => handlePay('monthly')} disabled={paying === 'monthly'}>
                {paying === 'monthly' ? '⏳...' : `💰 Pay Monthly (KSh ${totalMonthlyDue.toLocaleString()})`}
              </button>
            )}
            {inst?.isReadyForConnectivity && !inst?.installationFeePaid && (
              <button className="ip-save-btn" onClick={() => handlePay('installation')} disabled={paying === 'installation'}
                style={{ background: 'linear-gradient(135deg,#27ae60,#1abc9c)' }}>
                {paying === 'installation' ? '⏳...' : '🔧 Pay Installation (KSh 10,000)'}
              </button>
            )}
            {inst?.needsReconnection && (
              <button className="ip-save-btn" onClick={() => handlePay('reconnection')} disabled={paying === 'reconnection'}
                style={{ background: 'linear-gradient(135deg,#e67e22,#e74c3c)' }}>
                {paying === 'reconnection' ? '⏳...' : '🔁 Pay Reconnection (KSh 1,000)'}
              </button>
            )}
          </div>
          {msg && <div style={{ marginTop: 12, padding: '8px 14px', background: '#f0f9f5', borderRadius: 8, color: '#27ae60', fontSize: '0.9rem' }}>{msg}</div>}
        </div>
      )}

      {/* Payment History Ledger */}
      <div className="ip-panel">
        <h3 className="ip-panel-title">📋 Payment History</h3>
        {loading ? <p>Loading...</p> : history.length === 0 ? (
          <div className="ip-notice ip-notice-info"><span>ℹ️</span><p>No payment records yet.</p></div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr><th>#</th><th>Type</th><th>Amount</th><th>Method</th><th>Month</th><th>Date</th></tr>
            </thead>
            <tbody>
              {history.map((p, i) => (
                <tr key={p._id}>
                  <td>{i + 1}</td>
                  <td><span className="badge" style={{ background: (TYPE_COLORS[p.type] || '#888') + '22', color: TYPE_COLORS[p.type] || '#888', border: `1px solid ${TYPE_COLORS[p.type] || '#888'}`, textTransform: 'capitalize' }}>{p.reference === 'overdue-fine' ? 'Overdue Fine' : p.type}</span></td>
                  <td><strong>KSh {p.amount.toLocaleString()}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{p.method}</td>
                  <td>{p.month || '—'}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function InstitutionPortal({ user, onLogout }) {
  const [active, setActive] = useState('home');
  const [inst, setInst] = useState(null);
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedBw, setSelectedBw] = useState(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(data => { setInst(data); setLoading(false); });
  }, []);

  const monthlyFee = inst?.currentBandwidth ? BW_PRICES[inst.currentBandwidth] : 0;
  const overdueFine = monthlyFee * 0.15;
  const statusColor = inst?.serviceActive ? '#2ecc71' : '#e74c3c';
  const statusLabel = inst?.serviceActive ? 'Active' : 'Inactive';

  return (
    <div className={`ip-wrapper ${visible ? 'ip-visible' : ''}`}>

      {/* Sidebar */}
      <aside className={`ip-sidebar ${collapsed ? 'ip-collapsed' : ''}`}>
        <div className="ip-logo">
          <div className="ip-logo-circle">🌐</div>
          {!collapsed && <div className="ip-logo-text"><span>Azani</span><small>ISP Portal</small></div>}
        </div>
        <button className="ip-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>
        <nav className="ip-nav">
          {navItems.map(item => (
            <button key={item.id}
              className={`ip-nav-item ${active === item.id ? 'ip-nav-active' : ''}`}
              onClick={() => setActive(item.id)}>
              <span className="ip-nav-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {active === item.id && !collapsed && <span className="ip-nav-pip" />}
            </button>
          ))}
        </nav>
        <button className="ip-logout" onClick={onLogout}>
          <span>🚪</span>{!collapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main */}
      <main className="ip-main">

        {/* Topbar */}
        <header className="ip-topbar">
          <div>
            <h2 className="ip-page-title">{navItems.find(n => n.id === active)?.icon} {navItems.find(n => n.id === active)?.label}</h2>
            <p className="ip-page-sub">{inst?.institutionName || '...'} &mdash; <span style={{ textTransform: 'capitalize' }}>{inst?.institutionType}</span></p>
          </div>
          <div className="ip-topbar-right">
            <div className="ip-status-pill" style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}` }}>
              <Pulse color={statusColor} /> {statusLabel}
            </div>
            <div className="ip-avatar">{inst?.institutionName?.[0] || '?'}</div>
          </div>
        </header>

        <div className="ip-content">
          {loading ? (
            <div className="ip-loading"><div className="ip-spinner" /><p>Loading your portal...</p></div>
          ) : (
            <>
              {/* HOME */}
              {active === 'home' && (
                <div className="ip-home">

                  {/* Activate Account Banner */}
                  {!inst?.registrationFeePaid && (
                    <div className="reg-activate-banner">
                      <div className="reg-banner-left">
                        <span className="reg-banner-icon">🔔</span>
                        <div>
                          <h3>Your account is not yet activated</h3>
                          <p>Pay the registration fee of <strong>KSh 8,500</strong> to activate your account and access all services.</p>
                        </div>
                      </div>
                      <button className="reg-activate-btn" onClick={() => setShowRegModal(true)}>
                        🎓 Register to Activate Account
                      </button>
                    </div>
                  )}

                  {/* Hero Banner */}
                  <div className="ip-hero">
                    <div className="ip-hero-text">
                      <h1>Welcome back, <span>{inst?.institutionName}!</span></h1>
                      <p>Here's a snapshot of your internet service account.</p>
                    </div>
                    <div className="ip-hero-graphic">
                      <div className="ip-signal">
                        <div className="sig-bar s1" /><div className="sig-bar s2" />
                        <div className="sig-bar s3" /><div className="sig-bar s4" />
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="ip-cards">
                    {[
                      { icon: '📡', label: 'Bandwidth', value: inst?.currentBandwidth ? `${inst.currentBandwidth} MBPS` : 'Not Set', color: '#3fc6aa' },
                      { icon: '💰', label: 'Monthly Fee', value: monthlyFee ? `KSh ${monthlyFee.toLocaleString()}` : 'N/A', color: '#27ae60' },
                      { icon: '🖥️', label: 'Computers', value: inst?.computersPurchased || 0, color: '#1abc9c' },
                      { icon: '🔗', label: 'LAN Nodes', value: inst?.lanNodesPurchased || 0, color: '#16a085' },
                    ].map((c, i) => (
                      <div className="ip-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="ip-card-icon" style={{ background: c.color + '22', color: c.color }}>{c.icon}</div>
                        <div className="ip-card-info">
                          <h3>{c.value}</h3>
                          <p>{c.label}</p>
                        </div>
                        <div className="ip-card-glow" style={{ background: c.color }} />
                      </div>
                    ))}
                  </div>

                  {/* Account Status Panel */}
                  <div className="ip-row">
                    <div className="ip-panel ip-status-panel">
                      <h3 className="ip-panel-title">📋 Account Status</h3>
                      <div className="ip-status-list">
                        {[
                          ['Registration Fee', inst?.registrationFeePaid ? '✅ Paid' : '❌ Unpaid', inst?.registrationFeePaid ? '#2ecc71' : '#e74c3c'],
                          ['Installation Fee', inst?.installationFeePaid ? '✅ Paid' : '❌ Unpaid', inst?.installationFeePaid ? '#2ecc71' : '#e74c3c'],
                          ['Internet Service', inst?.serviceActive ? '🟢 Active' : '🔴 Inactive', inst?.serviceActive ? '#2ecc71' : '#e74c3c'],
                          ['Current Bandwidth', inst?.currentBandwidth ? `${inst.currentBandwidth} MBPS` : 'None', '#3fc6aa'],
                          ['Monthly Charge', `KSh ${monthlyFee.toLocaleString()}`, '#27ae60'],
                        ].map(([label, val, color]) => (
                          <div className="ip-status-row" key={label}>
                            <span className="ip-status-label">{label}</span>
                            <span className="ip-status-val" style={{ color }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ip-panel ip-notice-panel">
                      <h3 className="ip-panel-title">🔔 Important Notices</h3>
                      <div className="ip-notices">
                        <div className="ip-notice ip-notice-info">
                          <span>📅</span>
                          <p>Monthly payments are due by the <strong>end of every month</strong>.</p>
                        </div>
                        <div className="ip-notice ip-notice-warn">
                          <span>⚠️</span>
                          <p>Unpaid bills attract a <strong>15% overdue fine</strong> (KSh {overdueFine.toLocaleString()}).</p>
                        </div>
                        <div className="ip-notice ip-notice-danger">
                          <span>🔌</span>
                          <p>Services are disconnected if unpaid by the <strong>10th of next month</strong>.</p>
                        </div>
                        <div className="ip-notice ip-notice-info">
                          <span>🔁</span>
                          <p>Reconnection after payment requires a <strong>KSh 1,000 fee</strong>.</p>
                        </div>
                      </div>
                    </div>

                    <div className="ip-panel ip-upgrade-panel">
                      <h3 className="ip-panel-title">⚡ Upgrade Bandwidth</h3>
                      {!inst?.registrationFeePaid ? (
                        <div className="ip-upgrade-locked">
                          <div className="ip-lock-icon">🔒</div>
                          <p>Activate your account to unlock bandwidth upgrades.</p>
                        </div>
                      ) : (
                        <>
                          <p className="ip-upgrade-sub">Get <strong>10% off</strong> when upgrading!</p>
                          <div className="ip-bw-options">
                            {BW_OPTIONS.filter(b => b.mbps !== inst?.currentBandwidth).map(b => {
                              const discounted = Math.round(b.price * 0.9);
                              const isUpgrade = !inst?.currentBandwidth || parseInt(b.mbps) > parseInt(inst.currentBandwidth);
                              return (
                          <div className={`ip-bw-option ${isUpgrade ? '' : 'ip-bw-downgrade'}`} key={b.mbps}>
                                  <div className="ip-bw-mbps">{b.mbps} <small>MBPS</small></div>
                                  <div className="ip-bw-price">
                                    {isUpgrade ? (
                                      <>
                                        <span className="ip-bw-old">KSh {b.price.toLocaleString()}</span>
                                        <span className="ip-bw-new">KSh {Math.round(b.price * 0.9).toLocaleString()}</span>
                                      </>
                                    ) : (
                                      <span className="ip-bw-new">KSh {b.price.toLocaleString()}</span>
                                    )}
                                  </div>
                                  <button className="ip-bw-btn" onClick={() => setSelectedBw(b)}>Select</button>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICE */}
              {active === 'service' && (
                <div className="ip-section">
                  <div className="ip-panel" style={{ maxWidth: 600 }}>
                    <h3 className="ip-panel-title">📡 My Internet Service</h3>
                    <div className="ip-service-hero" style={{ borderColor: statusColor }}>
                      <div className="ip-service-status" style={{ color: statusColor }}>{statusLabel}</div>
                      <div className="ip-service-bw">{inst?.currentBandwidth || '—'} <small>MBPS</small></div>
                      <div className="ip-service-fee">KSh {monthlyFee.toLocaleString()} / month</div>
                    </div>
                    <div className="ip-status-list" style={{ marginTop: 20 }}>
                      {[
                        ['Users', inst?.numberOfUsers || 0],
                        ['LAN Nodes', inst?.lanNodesPurchased || 0],
                        ['Computers', inst?.computersPurchased || 0],
                        ['Registration Fee', inst?.registrationFeePaid ? 'Paid' : 'Unpaid'],
                        ['Installation Fee', inst?.installationFeePaid ? 'Paid' : 'Unpaid'],
                      ].map(([l, v]) => (
                        <div className="ip-status-row" key={l}>
                          <span className="ip-status-label">{l}</span>
                          <span className="ip-status-val">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENTS */}
              {active === 'payments' && (
                <PaymentsTab inst={inst} token={localStorage.getItem('token')} onUpdate={setInst} />
              )}

              {/* INFRASTRUCTURE */}
              {active === 'infrastructure' && (
                <InfrastructureSection inst={inst} token={localStorage.getItem('token')} onSave={setInst} />
              )}

              {/* PROFILE */}
              {active === 'profile' && (
                <div className="ip-section">
                  <div className="ip-panel" style={{ maxWidth: 500 }}>
                    <h3 className="ip-panel-title">👤 Institution Profile</h3>
                    <div className="ip-profile-avatar">{inst?.institutionName?.[0]}</div>
                    <div className="ip-status-list" style={{ marginTop: 20 }}>
                      {[
                        ['Institution Name', inst?.institutionName],
                        ['Type', inst?.institutionType],
                        ['Contact Person', inst?.contactPersonName],
                        ['Email', inst?.email],
                        ['Phone', inst?.phoneNumber],
                        ['Registered On', new Date(inst?.createdAt).toLocaleDateString()],
                      ].map(([l, v]) => (
                        <div className="ip-status-row" key={l}>
                          <span className="ip-status-label">{l}</span>
                          <span className="ip-status-val" style={{ textTransform: 'capitalize' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUPPORT */}
              {active === 'support' && (
                <div className="ip-section">
                  <div className="ip-panel" style={{ maxWidth: 500 }}>
                    <h3 className="ip-panel-title">🆘 Support & Contact</h3>
                    <div className="ip-notices">
                      <div className="ip-notice ip-notice-info"><span>📞</span><p>Call us: <strong>+254 700 000 000</strong></p></div>
                      <div className="ip-notice ip-notice-info"><span>✉️</span><p>Email: <strong>support@azani.co.ke</strong></p></div>
                      <div className="ip-notice ip-notice-info"><span>🕐</span><p>Working Hours: <strong>Mon–Fri, 8AM–6PM</strong></p></div>
                      <div className="ip-notice ip-notice-warn"><span>🚨</span><p>For emergencies, call our 24/7 hotline: <strong>+254 722 000 000</strong></p></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showRegModal && (
        <RegistrationModal
          token={localStorage.getItem('token')}
          onClose={() => setShowRegModal(false)}
          onSuccess={data => { setInst(data); setShowRegModal(false); }}
        />
      )}

      {selectedBw && (
        <BandwidthModal
          selected={selectedBw}
          inst={inst}
          token={localStorage.getItem('token')}
          onClose={() => setSelectedBw(null)}
        />
      )}
    </div>
  );
}
