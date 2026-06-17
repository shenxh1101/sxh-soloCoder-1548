import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Inventory from '@/pages/Inventory';
import Statistics from '@/pages/Statistics';
import Suppliers from '@/pages/Suppliers';
import Promotions from '@/pages/Promotions';
import { useStore } from '@/store';

function AppRoutes() {
  const initData = useStore((state) => state.initData);

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
