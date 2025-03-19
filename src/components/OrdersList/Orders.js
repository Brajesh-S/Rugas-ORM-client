import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Orders.css';

function bufferToBase64(bufferData) {
  const binary = new Uint8Array(bufferData.data).reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binary);
}

function OrdersPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    customerName: '',
    category: '',
  });
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => {
    return localStorage.getItem('token'); 
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`https://rugas-orm-server.onrender.com/api/orders?${queryParams}`, {
          headers: {
           'Authorization': `Bearer ${getAuthToken()}`, 
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!orderId) fetchOrders();
  }, [filters, orderId]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`https://rugas-orm-server.onrender.com/api/orders/${orderId}`, {
         
          headers: {
           'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setSelectedOrder(data);
      } catch (error) {
        console.error('Error:', error);
        navigate('/dashboard/orders');
      }
    };

    if (orderId) fetchOrderDetails();
  }, [orderId, navigate]);

  const handleStatusUpdate = async (newStatus, orderId) => {
    try {
      const response = await fetch(`https://rugas-orm-server.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
  
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder);
      setOrders(prev =>
        prev.map(order => (order._id === updatedOrder._id ? updatedOrder : order))
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="orders-container">
      {!orderId ? (
        <div className="order-list">
          <div className="header">
            <h2>Orders</h2>
          </div>

          <div className="filters">
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="text"
              name="customerName"
              placeholder="Search customer..."
              value={filters.customerName}
              onChange={handleFilterChange}
            />

            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
            </select>
          </div>

          <div className="orders-table">
            <div className="table-header">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Total</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {orders.map(order => (
              <div key={order._id} className="order-row">
                <span>{order._id}</span>
                <span>{order.customerName}</span>
                <span>${order.totalPrice?.toFixed(2)}</span>
                <span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(e.target.value, order._id)}
                    className={`status-indicator ${order.status}`}
                  >
                    <option value="placed">Placed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </span>
                <span>
                  <button onClick={() => navigate(`/dashboard/orders/${order._id}`)} className="view-details-btn">
                    View
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        selectedOrder && (
          <div className="order-detail">
            <button onClick={() => navigate('/dashboard/orders')} className="back-button">
              ← Back to Orders
            </button>

            <div className="order-header">
              <h2>Order #{selectedOrder.orderNumber}</h2>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusUpdate(e.target.value, selectedOrder._id)}
                className={`status-select ${selectedOrder.status}`}
              >
                <option value="placed">Placed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="customer-info">
              <h3>Customer Information</h3>
              <p>Name: {selectedOrder.customer?.name}</p>
              <p>Email: {selectedOrder.customer?.email}</p>
              <p>Phone: {selectedOrder.customer?.phone}</p>
            </div>

            <div className="order-items">
              <h3>Order Items</h3>
              {selectedOrder.products?.map(item => (
                <div key={item._id} className="order-item">
                  <img
                    src={`data:${item.product.image.contentType};base64,${bufferToBase64(item.product.image.data)}`}
                    alt={item.product.name}
                  />
                  <div className="item-info">
                    <h4>{item.product.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price?.toFixed(2)}</p>
                    <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default OrdersPage;
