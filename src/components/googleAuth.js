import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
function googleAuth() {
const [user, setUser] = useState(null);
  
  return (
    <div>
      <div className='google-signUp' id='signInDiv'>
      <GoogleOAuthProvider clientId="338976857027-orhikrsb7037ussbjb5c083ksfu5679c.apps.googleusercontent.com">
        
        <GoogleLogin
          onSuccess={credentialResponse => {
            const decodedCredential = jwtDecode(credentialResponse.credential);
            console.log(decodedCredential);
            setUser(decodedCredential); // Set user state with decoded credential
            document.getElementById("signInDiv").hidden=true;  
              }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </GoogleOAuthProvider>
      </div>
      
      {user && // Render user information if user is available
        <div>
          <img src={user.picture} alt="User profile"></img>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      }
    </div>

  );
}

export default googleAuth;
