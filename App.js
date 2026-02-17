import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout components
import Layout from './components/Layout';

// Page components
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Refunds from './pages/Refunds';
import Settings from './pages/Settings';

// Admin page components
import AdminDashboard from './admin/pages/Dashboard';
import AdminUsers from './admin/pages/Users';
import AdminAnalytics from './admin/pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public/User Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/app" element={<Layout admin />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="refunds" element={<Refunds />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<div className="p-8 text-center text-gray-400">Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
