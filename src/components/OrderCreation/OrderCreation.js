import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderCreation.css'

function OrderCreation() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('https://rugas-orm-server.onrender.com/api/customers', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      setError('Error loading customers');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://rugas-orm-server.onrender.com/api/products', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        throw new Error('Please login to view products');
      }
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();

      const productsWithImages = data.map(product => ({
        ...product,
        image: product.image ? {
          ...product.image,
          data: product.image.data.toString('base64')
        } : null
      }));
      
      setProducts(productsWithImages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart(prev =>
      prev.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const handleSubmit = async () => {
    setError('');
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }
    if (cart.length === 0) {
      setError('Please add products to cart');
      return;
    }

    try {
      const response = await fetch('https://rugas-orm-server.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          customer: selectedCustomer,
          products: cart.map(item => ({
            product: item._id,
            quantity: item.quantity
          })),
          totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create order');
      }
      
      navigate('/dashboard/orders');
    } catch (error) {
      setError(error.message || 'Error creating order');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-creation">
      <h2>Create New Order</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="customer">Customer</label>
        <select
          id="customer"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="form-input"
        >
          <option value="">Select Customer</option>
          {customers.map(customer => (
            <option key={customer._id} value={customer._id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="products-section">
        <h3>Products</h3>
        <div className="grid">
          {products.map(product => (
            <div key={product._id} className="card">
              {product.image?.data && (
                <img
                  src={`data:${product.image.contentType};base64,${product.image.data}`}
                  alt={product.name}
                  className="product-image"
                />
              )}
              <h4>{product.name}</h4>
              <p>${product.price}</p>
              <button
                onClick={() => addToCart(product)}
                className="btn btn-primary"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="cart-section">
        <h3>Cart</h3>
        {cart.map(item => (
          <div key={item._id} className="cart-item">
            <span>{item.name}</span>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
              min="1"
              className="quantity-input"
            />
            <span>${(item.price * item.quantity).toFixed(2)}</span>
            <button
              onClick={() => removeFromCart(item._id)}
              className="btn btn-secondary"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={!selectedCustomer || cart.length === 0}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

export default OrderCreation;