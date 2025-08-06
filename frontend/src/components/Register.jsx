import React, { useState, useEffect, useContext } from 'react';
import './css/Regsiter.css';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const GOOGLE_CLIENT_ID = '947940324164-otntqkg63sr421g1qqr25pel3rso4ec9.apps.googleusercontent.com';

const Register = () => {
  const { handleUserLogin } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [registrationType, setRegistrationType] = useState('email'); // 'email' or 'google'

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleRegister,
        auto_select: false,
        cancel_on_tap_outside: false
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          renderGoogleButton();
        }
      });

      renderGoogleButton();
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    } else if (resendTimer === 0 && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const renderGoogleButton = () => {
    const buttonContainer = document.getElementById('google-register-btn');
    if (buttonContainer && !showVerification) {
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        type: 'standard',
        text: 'signup_with'
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccessMessage('');
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
    setError('');
  };

  const handleGoogleRegister = async (response) => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('http://localhost:5000/api/auth/google-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // Set up verification flow for Google
        setRegistrationType('google');
        setFormData(prev => ({ ...prev, email: data.email }));
        setShowVerification(true);
        setResendTimer(60);
        setSuccessMessage('Verification code sent to your Google email!');
      } else {
        setError(data.message || 'Google registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const sendVerificationCode = async (email) => {
    const response = await fetch('http://localhost:5000/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification code');
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await sendVerificationCode(formData.email);
      setRegistrationType('email');
      setShowVerification(true);
      setResendTimer(60);
      setSuccessMessage('Verification code sent to your email!');
    } catch (error) {
      setError(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = registrationType === 'google' 
        ? 'http://localhost:5000/api/auth/verify-google-registration'
        : 'http://localhost:5000/api/auth/register';

      const requestBody = registrationType === 'google'
        ? { 
            email: formData.email, 
            verificationCode: verificationCode 
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            verificationCode: verificationCode
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // For both registration types, redirect to login page
        setSuccessMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError('');

    try {
      if (registrationType === 'google') {
        // For Google, we need to restart the registration process
        setError('Please restart the Google registration process to get a new code.');
        setTimeout(() => {
          handleBackToForm();
        }, 3000);
      } else {
        // Regular email resend
        await sendVerificationCode(formData.email);
        setResendTimer(60);
        setSuccessMessage('Verification code resent successfully!');
      }
    } catch (error) {
      setError(error.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowVerification(false);
    setVerificationCode('');
    setError('');
    setSuccessMessage('');
    setResendTimer(0);
    setRegistrationType('email');
    
    // Clear form data only if it was Google registration
    if (registrationType === 'google') {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }
    
    // Re-render Google button after going back
    setTimeout(() => {
      renderGoogleButton();
    }, 100);
  };

  // Render Verification UI
  if (showVerification) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verify Your Email</h2>
          <p className="auth-subtitle">
            We've sent a verification code to <strong>{formData.email}</strong>
            {registrationType === 'google' && <span> (from your Google account)</span>}
          </p>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <form onSubmit={handleVerificationSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="verificationCode">Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
                disabled={loading}
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
              />
            </div>

            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
          </form>

          <div className="verification-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Didn't receive the code?</p>
            <button
              type="button"
              className="link-btn"
              onClick={handleResendCode}
              disabled={resendLoading || resendTimer > 0}
              style={{ marginRight: '10px', opacity: (resendLoading || resendTimer > 0) ? 0.6 : 1 }}
            >
              {resendLoading ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 
               registrationType === 'google' ? 'Restart Google Registration' : 'Resend Code'}
            </button>

            <span style={{ margin: '0 10px' }}>|</span>

            <button type="button" className="link-btn" onClick={handleBackToForm}>
              {registrationType === 'google' ? 'Try Different Method' : 'Change Email'}
            </button>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="link-btn">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // Render Registration UI
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join Sthaniya</h2>
        <p className="auth-subtitle">Create your account</p>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div id="google-register-btn" className="google-btn-container" style={{ marginBottom: '20px' }}></div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Sending Verification...' : 'Send Verification Code'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="link-btn">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;