import { useState, useEffect } from 'react';
import { API_BASE_URL, authFetch } from './api';

// Shared hook for fetching and caching the product list
export function useProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        setProducts(await response.json());
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    })();
  }, []);

  const getProduct = (productId) => products.find(p => p.id === productId);

  return { products, getProduct };
}

// Shared hook for fetching the current user's cart
export function useCart() {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const response = await authFetch('/cart');
      if (!response) return;
      if (!response.ok) throw new Error('Failed to fetch cart');
      setCartItems(await response.json());
    } catch (error) {
      console.error('Fetch error', error);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  return { cartItems, fetchCart };
}
