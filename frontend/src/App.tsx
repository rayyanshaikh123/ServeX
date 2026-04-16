import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { StaffManagementPage } from './pages/owner/StaffManagementPage';
import { RevenueStreamPage } from './pages/owner/RevenueStreamPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { InventoryPage } from './pages/admin/InventoryPage';
import { TablesPage } from './pages/admin/TablesPage';
import { BookingsPage } from './pages/admin/BookingsPage';
import { InvoicesPage } from './pages/admin/InvoicesPage';
import { AnalyticsPage } from './pages/common/AnalyticsPage';
import { RevenuePage } from './pages/common/RevenuePage';
import { SettingsPage } from './pages/common/SettingsPage';
import { ChatPage } from './pages/common/ChatPage';
import { LandingPage } from './pages/common/LandingPage';
import { PaymentsPage } from './pages/staff/PaymentsPage';
import { NewOrderPage } from './pages/staff/NewOrderPage';
import { CreateRestaurantPage } from './pages/owner/CreateRestaurantPage';
import { RestaurantIntelligencePage } from './pages/owner/RestaurantIntelligencePage';
import { Toaster } from './components/ui/sonner';

const DashboardRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role?.toUpperCase();
  
  switch (role) {
    case 'OWNER': return <Navigate to="/owner" replace />;
    case 'ADMIN': return <Navigate to="/admin" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] p-8 relative">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} />}>
          <Route path="/analytics" element={<Layout><AnalyticsPage /></Layout>} />
          <Route path="/revenue" element={<Layout><RevenuePage /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
          <Route path="/owner" element={<Layout><OwnerDashboard /></Layout>} />
          <Route path="/owner/users" element={<Layout><StaffManagementPage /></Layout>} />
          <Route path="/owner/revenue" element={<Layout><RevenueStreamPage /></Layout>} />
          <Route path="/owner/restaurants/new" element={<Layout><CreateRestaurantPage /></Layout>} />
          <Route path="/owner/intelligence" element={<Layout><RestaurantIntelligencePage /></Layout>} />
          <Route path="/owner/*" element={<Layout><OwnerDashboard /></Layout>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="/admin/inventory" element={<Layout><InventoryPage /></Layout>} />
          <Route path="/admin/tables" element={<Layout><TablesPage /></Layout>} />
          <Route path="/admin/bookings" element={<Layout><BookingsPage /></Layout>} />
          <Route path="/admin/invoices" element={<Layout><InvoicesPage /></Layout>} />
          <Route path="/admin/orders/new" element={<Layout><NewOrderPage /></Layout>} />
          <Route path="/admin/payments" element={<Layout><PaymentsPage /></Layout>} />
          <Route path="/admin/*" element={<Layout><AdminDashboard /></Layout>} />
        </Route>

        <Route path="/app" element={<DashboardRedirect />} />
        <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center font-bold text-2xl">Unauthorized Access</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
