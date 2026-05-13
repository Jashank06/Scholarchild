'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import styles from './auth.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const ROLE_CONFIG = {
  student: {
    label: '🎓 Student',
    image: '/images/auth/login-hero.png',
    quote: 'Every scholarship is a step closer to your dreams. Start your journey today.',
    quoteAuthor: 'Kushaagra Student Hub',
    redirectPath: '/dashboard',
  },
  parent: {
    label: '👨‍👩‍👧 Parent',
    image: '/images/auth/signup-hero.png',
    quote: 'Guide your child towards the best opportunities India has to offer.',
    quoteAuthor: 'Kushaagra Parent Hub',
    redirectPath: '/parent',
  },
  school: {
    label: '🏫 School',
    image: '/images/auth/school-hero.png',
    quote: 'Empower your students with access to thousands of scholarships and competitions.',
    quoteAuthor: 'Kushaagra Institution Hub',
    redirectPath: '/institution',
  },
};

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Chandigarh','Puducherry'];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('student');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', name: '', otp: '', grade: '', board: '', state: '',
    phone: '', relationship: 'guardian',
    institutionName: '', institutionType: 'private', registrationNumber: '', principalName: '',
  });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  const config = ROLE_CONFIG[selectedRole];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (isLogin) {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await res.json();
        if (data.success) {
          setUserId(data.userId);
          setStep(2);
          setMessage({ text: `OTP Sent! (Dev: ${data.otp})`, type: 'success' });
        } else {
          setMessage({ text: data.message, type: 'error' });
        }
      } else {
        // Register with role-specific data
        const body = { email: formData.email, role: selectedRole };

        if (selectedRole === 'student') {
          body.firstName = formData.name.split(' ')[0];
          body.lastName = formData.name.split(' ').slice(1).join(' ') || '';
          body.grade = formData.grade;
          body.board = formData.board;
          body.state = formData.state;
        } else if (selectedRole === 'parent') {
          body.firstName = formData.name.split(' ')[0];
          body.lastName = formData.name.split(' ').slice(1).join(' ') || '';
          body.phone = formData.phone;
          body.state = formData.state;
        } else if (selectedRole === 'school') {
          body.institutionName = formData.institutionName;
          body.institutionType = formData.institutionType;
          body.registrationNumber = formData.registrationNumber;
          body.principalName = formData.principalName;
          body.board = formData.board;
          body.state = formData.state;
        }

        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          setUserId(data.user.id);
          setStep(2);
          setMessage({ text: `OTP Sent! (Dev: ${data.otp})`, type: 'success' });
        } else {
          setMessage({ text: data.message, type: 'error' });
        }
      }
    } catch (err) {
      setMessage({ text: 'Server connection error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: formData.otp }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('kushaagra_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ text: 'Login Successful! Redirecting...', type: 'success' });

        // Role-based redirect
        const role = data.user.role;
        const path = ROLE_CONFIG[role]?.redirectPath || '/dashboard';
        setTimeout(() => router.push(path), 1200);
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server connection error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStudentFields = () => (
    <>
      <div className={styles.inputGroup}>
        <label>Full Name</label>
        <input name="name" type="text" placeholder="Full Name" required value={formData.name} onChange={handleInputChange} />
      </div>
      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label>Grade</label>
          <select name="grade" value={formData.grade} onChange={handleInputChange} required>
            <option value="">Select</option>
            {[...Array(12)].map((_, i) => <option key={i} value={i+1}>Grade {i+1}</option>)}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Board</label>
          <select name="board" value={formData.board} onChange={handleInputChange} required>
            <option value="">Select</option>
            <option value="CBSE">CBSE</option><option value="ICSE">ICSE</option>
            <option value="State">State Board</option><option value="IB">IB</option><option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className={styles.inputGroup}>
        <label>State</label>
        <select name="state" value={formData.state} onChange={handleInputChange} required>
          <option value="">Select State</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </>
  );

  const renderParentFields = () => (
    <>
      <div className={styles.inputGroup}>
        <label>Full Name</label>
        <input name="name" type="text" placeholder="Full Name" required value={formData.name} onChange={handleInputChange} />
      </div>
      <div className={styles.inputGroup}>
        <label>Phone Number</label>
        <input name="phone" type="tel" placeholder="+91 9876543210" required value={formData.phone} onChange={handleInputChange} />
      </div>
      <div className={styles.inputGroup}>
        <label>State</label>
        <select name="state" value={formData.state} onChange={handleInputChange} required>
          <option value="">Select State</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </>
  );

  const renderSchoolFields = () => (
    <>
      <div className={styles.inputGroup}>
        <label>Institution Name</label>
        <input name="institutionName" type="text" placeholder="ABC Public School" required value={formData.institutionName} onChange={handleInputChange} />
      </div>
      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label>Type</label>
          <select name="institutionType" value={formData.institutionType} onChange={handleInputChange}>
            <option value="private">Private</option><option value="government">Government</option>
            <option value="aided">Aided</option><option value="autonomous">Autonomous</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Board</label>
          <select name="board" value={formData.board} onChange={handleInputChange} required>
            <option value="">Select</option>
            <option value="CBSE">CBSE</option><option value="ICSE">ICSE</option>
            <option value="State">State Board</option><option value="IB">IB</option>
          </select>
        </div>
      </div>
      <div className={styles.inputGroup}>
        <label>Registration Number</label>
        <input name="registrationNumber" type="text" placeholder="SCH/2024/XXXX" required value={formData.registrationNumber} onChange={handleInputChange} />
      </div>
      <div className={styles.inputGroup}>
        <label>Principal Name</label>
        <input name="principalName" type="text" placeholder="Dr. Example Name" value={formData.principalName} onChange={handleInputChange} />
      </div>
      <div className={styles.inputGroup}>
        <label>State</label>
        <select name="state" value={formData.state} onChange={handleInputChange} required>
          <option value="">Select State</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <div className={styles.authPage}>
      <Navbar />

      <main className={styles.container}>
        <div className={styles.authBox}>
          {/* Left Pane: Visual Impact */}
          <div className={styles.visualPane}>
            <div className={styles.imageWrapper}>
              <img src={config.image} alt="Kushaagra" className={styles.authImage} />
              <div className={styles.imageOverlay}>
                <div className={styles.quoteBox}>
                  <span className={styles.quoteIcon}>"</span>
                  <p className={styles.quoteText}>{config.quote}</p>
                  <span className={styles.quoteAuthor}>{config.quoteAuthor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Form */}
          <div className={styles.formPane}>
            <div className={styles.formContent}>

              {/* Role Tabs (only for signup) */}
              {!isLogin && step === 1 && (
                <div className={styles.roleTabs}>
                  {Object.entries(ROLE_CONFIG).map(([key, val]) => (
                    <button
                      key={key}
                      className={`${styles.roleTab} ${selectedRole === key ? styles.activeTab : ''}`}
                      onClick={() => setSelectedRole(key)}
                      type="button"
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.header}>
                <h1 className={styles.title}>
                  {step === 1 ? (isLogin ? 'Welcome' : 'Create') : 'Verify'}{' '}
                  <span className={styles.highlight}>
                    {step === 1 ? (isLogin ? 'Back' : 'Account') : 'Identity'}
                  </span>
                </h1>
                <p className={styles.subtitle}>
                  {step === 1
                    ? isLogin
                      ? 'Access your scholarship dashboard.'
                      : `Register as a ${selectedRole === 'school' ? 'School / Institution' : selectedRole}.`
                    : "We've sent a 6-digit secure code to your email."}
                </p>
              </div>

              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
              )}

              <form className={styles.form} onSubmit={step === 1 ? handleAuthStep1 : handleVerifyOTP}>
                {step === 1 ? (
                  <>
                    {/* Email (universal) */}
                    <div className={styles.inputGroup}>
                      <label>Email Address</label>
                      <input name="email" type="email" placeholder="you@example.com" required value={formData.email} onChange={handleInputChange} />
                    </div>

                    {/* Role-specific fields */}
                    {!isLogin && selectedRole === 'student' && renderStudentFields()}
                    {!isLogin && selectedRole === 'parent' && renderParentFields()}
                    {!isLogin && selectedRole === 'school' && renderSchoolFields()}
                  </>
                ) : (
                  <div className={styles.inputGroup}>
                    <label>Enter 6-Digit OTP</label>
                    <input
                      name="otp" type="text" placeholder="000000" maxLength="6" required
                      value={formData.otp} onChange={handleInputChange}
                      style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '24px' }}
                    />
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading
                    ? 'Processing...'
                    : step === 1
                      ? isLogin ? 'Send OTP 🚀' : 'Create Account ✨'
                      : 'Verify & Enter 🛡️'}
                </button>
              </form>

              <div className={styles.footer}>
                <p>
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={() => { setIsLogin(!isLogin); setStep(1); setMessage({ text: '', type: '' }); }}
                    className={styles.switchBtn}
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className={styles.backgroundEffects}>
        <div className={styles.orbOne}></div>
        <div className={styles.orbTwo}></div>
      </div>
    </div>
  );
}
