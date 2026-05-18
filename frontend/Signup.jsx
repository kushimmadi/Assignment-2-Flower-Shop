import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const REGISTER_URL = 'http://127.0.0.1:8000/register';

const Signup = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '', confirmPassword: '' });
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (credentials.password !== credentials.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Send registration request
        try {
            const response = await fetch(REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password,
                }),
            });

            // Handle server response
            const data = await response.json();

            if (response.ok) {
                alert("Account created successfully! Please sign in.");
                navigate('/login');
            } else {
                alert(data.detail || "Registration failed.");
            }
        } catch (error) {
            alert("Server connection error.");
        }
    };



    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Create Account 🌷</h2>
                <p>Sign up to start shopping for beautiful bouquets</p>

                <form onSubmit={handleSignup}>

                    {/* Email input */}
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

                    {/* Password input */}
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Confirm password input */}
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={credentials.confirmPassword}
                            onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="login-button">
                        Create Account
                    </button>
                </form>

                <div className="login-footer">
                    <span>Already have an account? <Link to="/login">Sign In</Link></span>
                </div>
            </div>
        </div>
    );
};

export default Signup;