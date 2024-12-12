import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Component for rendering a Google login button.
 * @param {{Function}} setError - Function to set an error state.
 * @param {{Function}} setLoading - Function to set a loading state.
 * @returns A Google login button component.
 */
const GoogleLoginButton = ({ setError, setLoading }) => {
  const navigate = useNavigate();

  /**
   * Handles the success response from a Google sign-in authentication.
   * @param {{Object}} res - The response object containing the authentication credential.
   * @returns None
   */
  const handleSuccess = async (res) => {
    const token = res.credential;

    try {
      setLoading(true);
      const response = await axios.post(
        "https://project-3-team-0g-backend.onrender.com/google-login",
        {
          token,
        }
      );
      //   console.log("Google user logged: ", response.data);
      const userData = {
        id: response.data.id,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        // email: response.data.email,
        // phone_number: response.data.phone_number,
        is_manager: response.data.is_manager,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/employee-order");
      setError(null);
    } catch (err) {
      setError("Google user is not registered");
      console.error("Error:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles errors that occur during Google login process.
   * Sets an error message and logs the error to the console.
   * @returns None
   */
  const handleError = () => {
    setError("Google login failed. Please try again.");
    console.error("Google login failed.");
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
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
