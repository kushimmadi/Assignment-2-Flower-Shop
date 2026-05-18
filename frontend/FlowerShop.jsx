// Kushi
// Michelle
// Nikita
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, X, LayoutList } from 'lucide-react';
import Navbar from './Navbar';
import { authFetch, logout } from './api';
import { useProducts, useCart } from './hooks';
import './FlowerShop.css';

export default function FlowerShop() {
  const { products, getProduct } = useProducts();
  const { cartItems, fetchCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [pendingRemove, setPendingRemove] = useState(null); //holds the cart item awaiting delete confirmation
  const [searchQuery, setSearchQuery] = useState('');

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const handleLogout = () => logout(navigate);

  // Update page title to show in brackets the number of items in the cart currently
  useEffect(() => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    document.title = count > 0 ? `Flower Shop (${count})` : 'Flower Shop';
  }, [cartItems]);

  // Display a toast notification for 2 seconds
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 2000);
  };

  // Add a product to the cart
  const addToCart = async (productId) => {
    try {
      const response = await authFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (response?.ok) {
        await fetchCart();
        const product = getProduct(productId);
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
      const response = await authFetch(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, quantity: newQuantity }),
      });
      if (response?.ok) await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Open the confirmation dialog before removing an item
  const confirmRemove = (item) => setPendingRemove(item);

  // Confirmed removal from cart
  const removeFromCart = async () => {
    if (!pendingRemove) return;
    const itemId = pendingRemove.id;
    setPendingRemove(null);
    try {
      const response = await authFetch(`/cart/${itemId}`, { method: 'DELETE' });
      if (response?.ok) {
        await fetchCart();
        showToast('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Cart totals
  const cartTotal = cartItems.reduce((sum, item) => {
    const product = getProduct(item.product_id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="shop-container">
      <Navbar username={username} onLogout={handleLogout}>
        {role === 'admin' && (
          // Only for admin users
          <button className="btn-admin-nav" onClick={() => navigate('/admin')} aria-label="View all carts">
            <LayoutList size={16} /> <span>View All Carts</span>
          </button>
        )}
        <button
          className="cart-toggle"
          onClick={() => setCartOpen(true)}
          aria-label="Open shopping cart"
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </Navbar>

      {/* Toast */}
      <div className={`toast ${notification ? 'toast-show' : ''}`}>
        {notification}
      </div>

      {/* Product Grid */}
      <main className="main-content">
        <h2 className="section-heading">Flower Bouquets</h2>
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search bouquets by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search flower bouquets by name"
          />
        </div>
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <p className="no-products">No bouquets match your search.</p>
          ) : (
            filteredProducts.map((product) => (
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
            ))
          )}
        </div>
      </main>

      {/* Confirm-remove dialog */}
      {pendingRemove && (() => {
        const product = getProduct(pendingRemove.product_id);
        return (
          <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Remove item confirmation">
            <div className="dialog-card">
              <p className="dialog-message">
                Remove <strong>{product?.name}</strong> from your cart?
              </p>
              <div className="dialog-actions">
                <button className="btn-dialog-cancel" onClick={() => setPendingRemove(null)}>Keep</button>
                <button className="btn-dialog-confirm" onClick={removeFromCart}>Remove</button>
              </div>
            </div>
          </div>
        );
      })()}

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
                      onClick={() => confirmRemove(item)}
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