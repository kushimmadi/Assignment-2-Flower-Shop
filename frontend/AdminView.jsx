import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import './FlowerShop.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Admin-only view: displays all users' shopping carts
export default function AdminView() {
  const [allCarts, setAllCarts] = useState([]);
  const [products, setProducts] = useState([]);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  // Auth header reused for all admin API calls
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    fetchAllCarts();
    fetchProducts();
  }, []);

  // Redirect to login on 401 so expired tokens are handled gracefully
  const handleAuthError = (response) => {
    if (response.status === 401) {
      handleLogout();
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  // Fetch all carts across all users from the admin endpoint
  const fetchAllCarts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/carts`, {
        headers: authHeaders,
      });
      if (handleAuthError(response)) return;
      if (!response.ok) throw new Error('Failed to fetch carts');
      setAllCarts(await response.json());
    } catch (error) {
      console.error('Error fetching carts:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      setProducts(await response.json());
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getProduct = (productId) => products.find(p => p.id === productId);

  // Group cart items by user_id so each user's cart is shown together
  const cartsByUser = allCarts.reduce((acc, item) => {
    if (!acc[item.user_id]) acc[item.user_id] = [];
    acc[item.user_id].push(item);
    return acc;
  }, {});

  // Sum price × quantity across all items for one user
  const getUserTotal = (items) =>
    items.reduce((sum, item) => {
      const product = getProduct(item.product_id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

  return (
    <div className="shop-container">
      <Navbar username={username} onLogout={handleLogout}>
        {/* Back to shop button replaces the admin nav button on this view */}
        <button className="btn-admin-nav" onClick={() => navigate('/')} aria-label="Back to shop">
          <ArrowLeft size={16} /> <span>Back to Shop</span>
        </button>
      </Navbar>

      {/* Main content */}
      <main className="main-content">
        <h2 className="section-heading">User Shopping Carts</h2>

        {Object.keys(cartsByUser).length === 0 ? (
          <div className="cart-empty" style={{ paddingTop: '4rem' }}>
            <span className="empty-icon">🛒</span>
            <p className="empty-text">No active shopping carts</p>
            <p className="empty-hint">No users have items in their carts yet</p>
          </div>
        ) : (
          // Render one card per user showing their items and cart total
          <div className="admin-carts">
            {Object.entries(cartsByUser).map(([userId, items]) => (
              <div key={userId} className="user-cart-card">
                <div className="user-cart-header">
                  <span className="user-cart-name">👤 {userId}</span>
                  <span className="user-cart-total">${getUserTotal(items).toFixed(2)}</span>
                </div>
                <ul className="cart-list">
                  {items.map((item) => {
                    const product = getProduct(item.product_id);
                    if (!product) return null;
                    return (
                      <li key={item.id} className="cart-item">
                        <img className="item-image" src={product.image_url} alt={product.name} />
                        <div className="item-info">
                          <h4 className="item-name">{product.name}</h4>
                          <p className="item-price">
                            ${(product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <span className="admin-qty">Qty: {item.quantity}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
