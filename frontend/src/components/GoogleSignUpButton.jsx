import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

/**
 * Component for a Google sign-up button that triggers the handleSuccess function upon successful login.
 * @param {{Function}} setGoogleId - Function to set the Google ID after successful login.
 * @param {{Function}} setEmail - Function to set the email after successful login.
 * @returns JSX element for Google sign-up button.
 */
const GoogleSignUpButton = ({ setGoogleId, setEmail }) => {
  /**
   * Handles a successful response from an API call by extracting the necessary information from the response.
   * @param {{object}} response - The response object containing the credential token.
   * @returns None
   */
  const handleSuccess = (response) => {
    const token = response.credential;

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const googleId = decodedToken.sub;
    const email = decodedToken.email;

    setGoogleId(googleId); 
    setEmail(email); 
  };

  /**
   * Logs an error message indicating that Google sign-up has failed.
   * @returns None
   */
  const handleError = () => {
    console.error("Google sign-up failed.");
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}>
    <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          size="large"
          text="signup_with"
        />
      </div>
  </GoogleOAuthProvider>
  );
};

export default GoogleSignUpButton;
