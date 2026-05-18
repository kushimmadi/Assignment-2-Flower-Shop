import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const LOGIN_URL = 'http://127.0.0.1:8000/token';

const Login = () => {
  // State to hold user credentials. Here, we use one state object to manage both username and password for simplicity.
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  // The hook function you can use to navigate to different routes programmatically.
  const navigate = useNavigate();

  // Function to handle the login process when the form is submitted. It sends a POST request to the server with the user's credentials and processes the response.
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // FastAPI requries a FormData object for the login endpoint (must use FormData for POST requests to /token)
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        body: formData,
      });

      // Parse the JSON response from the login_for_access_token endpoint of the server. This will contain the access token and user information if the login is successful. 
      const data = await response.json();
      if (response.ok) {
        // Store the access token and user information in localStorage for later use. This allows the application to maintain the user's session across different pages and browser refreshes.
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        navigate('/'); // Navigate to the home page upon successful login
      } else {
        alert(data.detail || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      alert("Server connection error.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back 🌸</h2>
        <p>Log in to browse our beautiful flower bouquets</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
        </div>
      </div>
    </div>
  );
};

export default Login;