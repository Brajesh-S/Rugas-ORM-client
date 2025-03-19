import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/LoginPage/Login';
// import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import CustomerOnboarding from './components/CustomerOnboarding/CustomerOnboarding';
import ProductList from './components/ProductList/ProductList';
import OrderCreation from './components/OrderCreation/OrderCreation';
import Orders from './components/OrdersList/Orders';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            // <ProtectedRoute>
              
            // </ProtectedRoute>
            <Dashboard />
          }>
      
            <Route index element={<Navigate to="customers" replace />} />
            <Route path="customers" element={<CustomerOnboarding />} />
            <Route path="products" element={<ProductList />} />
            <Route path="create-order" element={<OrderCreation />} />
            <Route path="orders" element={<Orders />}>
                <Route path=":orderId" element={<Orders />} />
            </Route>
          </Route>


          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;