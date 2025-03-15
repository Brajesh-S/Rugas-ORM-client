
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobileMenuOpen &&
        !e.target.closest('.nav') &&
        !e.target.closest('.mobile-menu-button')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="dashboard-layout">
      <button className="mobile-menu-button" onClick={toggleMobileMenu}>
        ☰
      </button>
      
      <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-content">
          <ul className="nav-list">
            <li>
              <NavLink to="/dashboard/customers" className="nav-link">
                Customers
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/products" className="nav-link">
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/create-order" className="nav-link">
                Create Order
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/orders" className="nav-link">
                Orders
              </NavLink>
            </li>
          </ul>
          <button onClick={handleLogout} className=" btn-logout">
            Logout
          </button>
        </div>
      </nav>
      
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;