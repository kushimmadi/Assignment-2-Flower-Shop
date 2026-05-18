export const API_BASE_URL = 'http://127.0.0.1:8000';

// Automatically fetch the JWT token and log the user out if the session has expired
export async function authFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.replace('/login');
    return null;
  }

  return response;
}

// Clears the user session and redirects to the login page
export function logout(navigate) {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  navigate('/login', { replace: true });
}
