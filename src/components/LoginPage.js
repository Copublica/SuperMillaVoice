
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const setCookie = (name, value, days) => {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!validateEmail(email)) {
      toast.error("Invalid Email Address...");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters...");
      return;
    }

    try {
      const response = await axios.post("https://backend.supermilla.com/login", formData);

      console.log(response.data);
      if (response.data.message === 'Login successful') {
        setCookie('name', response.data.user.username, 7);
        setCookie('email', response.data.user.email, 7);
        navigate("/MainPage"); 
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('There was an error!', error);
      toast.error('Incorrect Email Address or Password...');
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decodedCredential = jwtDecode(credentialResponse.credential);
    const user = {
      email: decodedCredential.email,
      username: decodedCredential.name,
    };

    try {
      const response = await axios.post('https://backend.supermilla.com/auth/google-login', user);
      console.log('Google login response:', response.data);
      setCookie('name', user.username, 7); 
      setCookie('email', user.email, 7);
      navigate('/MainPage'); 
    } catch (error) {
      console.error('Error during Google login:', error);
      toast.error("Google Login Failed");
    }
  };

  return (
    <div className="container px-4" id="loginpage">
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

      <div className="container px-4 mt-5 py-5">
        <p className="title-text text-center font-weight-bold text-secondary">
          Let’s get
          <br />
          <span className="text-dark">started</span> 
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="email" className="form-control" id="email" placeholder="Email address" onChange={handleChange} />
            <i className="far fa-envelope"></i>
          </div>
          <div className="form-group position-relative">
            <input type={showPassword ? "text" : "password"} className="form-control" id="password" placeholder="Password" onChange={handleChange} />
            <i className={showPassword ? "fa-solid fa-eye" : "fa-regular fa-eye-slash"} onClick={togglePasswordVisibility} style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }}></i>
          </div>
          <div className="form-group">
            <button type="submit" className="btn-login btn btn-primary py-1 border-0">Login</button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <div className="social-media text-center mt-4">
          <span className="fw-bold"/>Or
          <div className="social-media-icons">
            <div className="s-col-4">
              <GoogleOAuthProvider clientId="338976857027-7eaird3188j265pb2vf0ltmt7m53o01c.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => {
                    console.log('Login Failed');
                    toast.error("Login Failed");
                  }}
                />
                <CustomButton />
              </GoogleOAuthProvider>
            </div>
          </div>
        </div>
        <div className="switch-login mt-2">
          <p className="text-center mt-2 h6">Don’t have an account? <Link to="/SignUp">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

export const CustomButton = () => {
  const navigate = useNavigate();
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      const { access_token } = tokenResponse;
      const options = { 
        method: 'GET',
        headers: { Authorization: `Bearer ${access_token}` },
      };
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', options)
        .then((response) => response.json())
        .then(async (data) => {
          console.log(data);

          const user = {
            email: data.email,
            username: data.given_name,
          };

          // Send data to your backend to store in MongoDB
          try {
            const response = await axios.post('https://backend.supermilla.com/auth/google-login', user);
            console.log('Google login response:', response.data);
            setCookie('name', user.username, 7); // Expires in 7 days
            setCookie('email', user.email, 7);
            navigate('/MainPage'); // Redirect to the main page
          } catch (error) {
            console.error('Error during Google login:', error);
            toast.error("Google Login Failed");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error("Google Login Failed");
    },
  });

  return (
    <button onClick={login} className="w-custom-google-btn">
      <img src="assets/images/search.png" alt="Google icon" className="w-google-icon" /> 
      <span className='w-google-text'>Sign in with Google</span> 
    </button>
  );
};
