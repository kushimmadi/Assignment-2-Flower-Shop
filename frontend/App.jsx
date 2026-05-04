import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import FlowerShop from './FlowerShop';

const ProtectedRoute = ({ children }) => {
  // Check if the user is authenticated (e.g., by checking localStorage). We choose to use localStorage because it allows the authentication state to persist across page refreshes, providing a better user experience.
  const username = localStorage.getItem('username');
  return !username ? <Navigate to="/login" replace /> : children;
};

const ProtectedLoginRoute = ({ children }) => {
  // use localStorage instead of sessionStorage, same reason as above.
  const username = localStorage.getItem('username');
  return username ? <Navigate to="/" replace /> : children;
}

function NoMatch() {
  return (
    <div style={{ padding: 20 }}>
      <h2>404: Page Not Found</h2>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><FlowerShop /></ProtectedRoute>} />
        <Route path="/login" element={<ProtectedLoginRoute><Login /></ProtectedLoginRoute>} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}