import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, X, LogOut } from 'lucide-react';
import './FlowerShop.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function FlowerShop() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role'); // Used to show admin-only navigation
  const navigate = useNavigate();

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Fetch products and cart when first loaded
  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  // Update page title to show in brackets the number of items in the cart currently
  useEffect(() => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    document.title = count > 0 ? `Flower Shop (${count})` : 'Flower Shop';
  }, [cartItems]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role'); // Clear role so stale admin access doesn't persist
    navigate('/login', { replace: true });
  };

  const handleAuthError = (response) => {
    if (response.status === 401) {
      handleLogout();
      return true;
    }
    return false;
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

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: authHeaders,
      });
      if (handleAuthError(response)) return;
      if (!response.ok) throw new Error('Failed to fetch cart');
      setCartItems(await response.json());
    } catch (error) {
      console.error('Fetch error', error);
    }
  };

  // Display a toast notification for 2 seconds
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 2000);
  };

  // Add a product to the cart
  const addToCart = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (handleAuthError(response)) return;
      if (response.ok) {
        await fetchCart();
        const product = products.find(p => p.id === productId);
        showToast(`${product.name} added to cart!`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cartItems.find(i => i.id === itemId);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ ...item, quantity: newQuantity }),
      });
      if (handleAuthError(response)) return;
      if (response.ok) await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (handleAuthError(response)) return;
      if (response.ok) {
        await fetchCart();
        showToast('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Helper: look up product by ID
  const getProduct = (productId) => products.find(p => p.id === productId);

  // Cart totals
  const cartTotal = cartItems.reduce((sum, item) => {
    const product = getProduct(item.product_id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="shop-container">
      {/* Navbar */}
      <nav className="shop-navbar">
        <div className="navbar-inner">
          <div className="logo">
            <span className="logo-icon">🌸</span>
            <div>
              <h1 className="shop-title">Flower Shop</h1>
            </div>
          </div>
          <div className="navbar-right">
            <span className="navbar-user">👤 {username}</span>
            {role === 'admin' && (
              // Only rendered for admin users — navigates to the admin cart view
              <button className="btn-admin-nav" onClick={() => navigate('/admin')} aria-label="View all carts">
                View All Carts
              </button>
            )}
            <button className="btn-logout" onClick={handleLogout} aria-label="Logout">
              <LogOut size={18} />
              Logout
            </button>
            <button
              className="cart-toggle"
              onClick={() => setCartOpen(true)}
              aria-label="Open shopping cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* Toast */}
      <div className={`toast ${notification ? 'toast-show' : ''}`}>
        {notification}
      </div>

      {/* Product Grid */}
      <main className="main-content">
        <h2 className="section-heading">Flower Bouquets</h2>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img className="card-image" src={product.image_url} alt={product.name} />
              <div className="card-body">
                <h3 className="card-name">{product.name}</h3>
                <p className="card-desc">{product.description}</p>
                <div className="card-footer">
                  <span className="card-price">${product.price.toFixed(2)}</span>
                  <button
                    className="btn-add"
                    onClick={() => addToCart(product.id)}
                  >
                    <Plus size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Overlay */}
      <div
        className={`overlay ${cartOpen ? 'overlay-visible' : ''}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <aside className={`cart-sidebar ${cartOpen ? 'cart-open' : ''}`}>
        <div className="cart-top">
          <h2 className="cart-heading">Your Cart</h2>
          <button
            className="btn-close"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-icon">🛒</span>
            <p className="empty-text">Your cart is empty</p>
            <p className="empty-hint">Add some pretty flower bouquets!</p>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map((item) => {
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
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-num">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="cart-bottom">
              <div className="cart-total-row">
                <span>Total</span>
                <span className="total-amount">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
