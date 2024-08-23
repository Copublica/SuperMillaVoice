import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import BeatLoader from "react-spinners/BeatLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOtpPopup, setShowOtpPopup] = useState(false); // Updated to show pop-up
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (showOtpPopup && timer > 0) { // Updated to showOtpPopup
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpPopup, timer]); // Updated to showOtpPopup

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleOtpChange = (element, index) => {
    if (/^\d*$/.test(element.value)) {
      let newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);

      // Automatically move to the next input box if a digit is entered
      if (element.value && index < 5) {
        document.getElementById(`otp${index + 1}`).focus();
      }
    }
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://backend.supermilla.com/resetPassword/request-reset', { email });
      setLoading(false);
      // setNotification('OTP has been sent to your email.');
      toast.success('OTP has been sent to your email.');

      setShowOtpPopup(true); // Show OTP pop-up
      setTimer(60); // Reset timer
      setIsResendDisabled(true); // Disable resend button
    } catch (error) {
      setLoading(false);
      // setNotification('Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP. Please try again.');
      console.error('There was an error!', error);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      const response = await axios.post('https://backend.supermilla.com/resetPassword/request-reset', { email });
      setLoading(false);
      // setNotification('OTP has been resent to your email.');
      toast.success('OTP has been resent to your email.'); // Updated to use toast library
      setTimer(60); // Reset timer
      setIsResendDisabled(true); // Disable resend button
    } catch (error) {
      setLoading(false);
      // setNotification('Failed to resend OTP. Please try again.');
      toast.error('Failed to resend OTP. Please try again.');
      console.error('There was an error!', error);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join(''); // Combine the OTP digits into a single string

    try {
      const response = await axios.post('https://backend.supermilla.com/resetPassword/verify-otp', { email, otp: enteredOtp });
      // setNotification('OTP verified successfully. Please enter your new password.');
      toast.success('OTP verified successfully. Please enter your new password')
      setShowPasswordInput(true);
      setShowOtpPopup(false); // Hide OTP pop-up
    } catch (error) {
      // setNotification('Invalid OTP. Please try again.');
      toast.error('Invalid OTP. Please try again.');
      console.error('There was an error!', error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 9) {
      toast.error('Password must be at least 9 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      // setNotification('Passwords do not match.');
      toast.error('Passwords do not match');

      return;
    }

    try {
      const response = await axios.post('https://backend.supermilla.com/resetPassword/reset-password', { email, newPassword });
      // setNotification('Password reset successfully. Redirecting to login page...');
      toast.success('Password reset successfully. Redirecting to login page...');
      setTimeout(() => {
        navigate('/LoginPage');
      }, 3000); // Redirect after 3 seconds
    } catch (error) {
      // setNotification('Failed to reset password. Please try again.');
      toast.error('Failed to reset password. Please try again');
      console.error('There was an error!', error);
    }
  };

  return (
    <>
      <div className="container text-center px-4" id="forgot-password">
      <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className='d-flex'>
          <div className="milaNav" style={{ zIndex: '99' }}>
            <div className="navbar-4">
              <Link to="/WelcomeLogin"><button className="back-button" type="button"><i className='fas fa-angle-left'></i> </button></Link>
            </div>
          </div>
        </div>

        <img src="assets/images/16191.jpg" id="registerImg" alt="Forgot Password" />
        <p className="title-text text-center font-weight-bold text-secondary">
          <span className="text-dark">Forgot Password</span>
        </p>
        {notification && <p className="text-center text-success">{notification}</p>}
        {loading && <div className="text-center"><BeatLoader color="#007bff" /></div>}

        {!showOtpPopup && !showPasswordInput ? ( // Updated to showOtpPopup
          <form onSubmit={handleRequestReset}>
            <div className="form-group">
              <input type="email" className="form-control" placeholder="Enter your email" value={email} onChange={handleEmailChange} required />
              <i className="far fa-envelope"></i>
            </div>
            <div className="form-group">
              <button type="submit" className="btn-login btn btn-primary py-1 border-0">Request OTP</button>
            </div>
          </form>
        ) : null}

      {showOtpPopup && ( // Show OTP pop-up when true
        <div className="otp-popup">
          <div className="otp-popup-content">
            <h2>OTP Verification</h2>
            <p>Enter the 6-digit OTP sent to your email:</p>
            <form className="otp-form" onSubmit={handleOtpSubmit}>
              {otp.map((digit, index) => (
                <input key={index} id={`otp${index}`} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(e.target, index)} />
              ))}
              <button type="submit" className="verify-button rounded-5 mt-3">Verify</button>
            </form>
            <div className="resend-otp mt-3">
              <p>
                Didn't receive the OTP?{' '}
                <button className="btn btn-link" onClick={handleResendOtp} disabled={isResendDisabled}>
                  Resend OTP {isResendDisabled && `in ${timer}s`}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

        {showPasswordInput ? (
          <form onSubmit={handleResetPassword}>
            <div className="form-group position-relative">
              <input type={showNewPassword ? "text" : "password"} className="form-control" placeholder="Enter new password" value={newPassword} onChange={handleNewPasswordChange} required />
              <i className={showNewPassword ? "fa-solid fa-eye" : "fa-regular fa-eye-slash"} onClick={toggleNewPasswordVisibility} style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }}></i>
            </div>
            <div className="form-group position-relative">
              <input type={showConfirmPassword ? "text" : "password"} className="form-control" placeholder="Confirm new password" value={confirmPassword} onChange={handleConfirmPasswordChange} required />
              <i className={showConfirmPassword ? "fa-solid fa-eye" : "fa-regular fa-eye-slash"} onClick={toggleConfirmPasswordVisibility} style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }}></i>
            </div>
            <div className="form-group">
              <button type="submit" className="btn-login btn btn-primary py-1 border-0">Reset Password</button>
            </div>
          </form>
        ) : null}
      </div>
    </>
  );
}

export default ForgotPassword;

