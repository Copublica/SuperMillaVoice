
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const username = document.cookie.split('; ').find(row => row.startsWith('name='));
  const email = document.cookie.split('; ').find(row => row.startsWith('email='));

  useEffect(() => {
    if (!username || !email) {
      // Display the toast notification
      toast.error('Please Login to access this page.');

      // Delay the navigation to allow the toast to show
      setTimeout(() => {
        navigate('/LoginPage');
      }, 2000); // Adjust the time as necessary
    }
  }, [navigate, username, email]);

  if (!username || !email) {
    return <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />;
  }

  return children;
};

export default PrivateRoute;
