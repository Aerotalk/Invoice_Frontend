import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuthStore } from '../store/authStore';

// Root level smart redirect component
const RootRouteRedirect = () => {
  const { isAuthenticated } = useAuthStore();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

// Loading Fallback spinner
const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 select-none shrink-0">
    <div className="flex items-center justify-between shrink-0 mb-4 animate-bounce-slow">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>
    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Loading GrivetyGlobal workspace...</span>
    <div className="h-1 w-32 bg-slate-800 rounded-full mt-3.5 overflow-hidden">
      <div className="h-full bg-indigo-500 rounded-full animate-shimmer w-1/2" />
    </div>
  </div>
);

// Lazy Loaded Pages
const Login = lazy(() => import('../features/auth/pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../features/auth/pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../features/auth/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));

const DashboardOverview = lazy(() => import('../features/dashboard/pages/DashboardOverview').then(m => ({ default: m.DashboardOverview })));

const ClientsList = lazy(() => import('../features/clients/pages/ClientsList').then(m => ({ default: m.ClientsList })));
const ClientDetails = lazy(() => import('../features/clients/pages/ClientDetails').then(m => ({ default: m.ClientDetails })));

const VendorsList = lazy(() => import('../features/vendors/pages/VendorsList').then(m => ({ default: m.VendorsList })));
const VendorDetails = lazy(() => import('../features/vendors/pages/VendorDetails').then(m => ({ default: m.VendorDetails })));

const ProductsList = lazy(() => import('../features/products/pages/ProductsList').then(m => ({ default: m.ProductsList })));

const QuotationsList = lazy(() => import('../features/quotes/pages/QuotationsList').then(m => ({ default: m.QuotationsList })));

const DeliveryChallansList = lazy(() => import('../features/challans/pages/DeliveryChallansList').then(m => ({ default: m.DeliveryChallansList })));

const InvoicesList = lazy(() => import('../features/invoices/pages/InvoicesList').then(m => ({ default: m.InvoicesList })));
const InvoiceBuilder = lazy(() => import('../features/invoices/pages/InvoiceBuilder').then(m => ({ default: m.InvoiceBuilder })));
const InvoiceDetails = lazy(() => import('../features/invoices/pages/InvoiceDetails').then(m => ({ default: m.InvoiceDetails })));

const PaymentsDashboard = lazy(() => import('../features/payments/pages/PaymentsDashboard').then(m => ({ default: m.PaymentsDashboard })));
const ExpensesDashboard = lazy(() => import('../features/expenses/pages/ExpensesDashboard').then(m => ({ default: m.ExpensesDashboard })));

const PurchaseOrderList = lazy(() => import('../features/purchase-orders/pages/PurchaseOrderList').then(m => ({ default: m.PurchaseOrderList })));
const PurchaseOrderDetails = lazy(() => import('../features/purchase-orders/pages/PurchaseOrderDetails').then(m => ({ default: m.PurchaseOrderDetails })));

const ProjectsList = lazy(() => import('../features/projects/pages/ProjectsList').then(m => ({ default: m.ProjectsList })));
const ProjectDetails = lazy(() => import('../features/projects/pages/ProjectDetails').then(m => ({ default: m.ProjectDetails })));

const ReportsOverview = lazy(() => import('../features/reports/pages/ReportsOverview').then(m => ({ default: m.ReportsOverview })));
const TeamDashboard = lazy(() => import('../features/team/pages/TeamDashboard').then(m => ({ default: m.TeamDashboard })));

const SettingsOverview = lazy(() => import('../features/settings/pages/SettingsOverview').then(m => ({ default: m.SettingsOverview })));
const UserProfilePage = lazy(() => import('../features/settings/pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<RootRouteRedirect />} />
        {/* Public Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Dashboard shell */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          
          {/* Clients */}
          <Route path="clients" element={<ClientsList />} />
          <Route path="clients/:id" element={<ClientDetails />} />

          {/* Vendors */}
          <Route path="vendors" element={<VendorsList />} />
          <Route path="vendors/:id" element={<VendorDetails />} />

          {/* Products */}
          <Route path="products" element={<ProductsList />} />

          {/* Quotes / Quotations */}
          <Route path="quotes" element={<QuotationsList />} />

          {/* Delivery Challans */}
          <Route path="challans" element={<DeliveryChallansList />} />

          {/* Invoices & proposals */}
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="invoices/create" element={<InvoiceBuilder />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="invoices/:id/edit" element={<InvoiceBuilder />} />

          {/* Payments & Expenditures */}
          <Route path="payments" element={<PaymentsDashboard />} />
          <Route path="expenses" element={<ExpensesDashboard />} />

          {/* Purchase Orders */}
          <Route path="purchase-orders" element={<PurchaseOrderList />} />
          <Route path="purchase-orders/:id" element={<PurchaseOrderDetails />} />

          {/* Sprints Projects & Kanban */}
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/:id" element={<ProjectDetails />} />

          {/* Core Analytics & Reports */}
          <Route path="reports" element={<ReportsOverview />} />
          
          {/* Members invitations logs */}
          <Route path="team" element={<TeamDashboard />} />

          {/* Configurations preferences */}
          <Route path="settings" element={<SettingsOverview />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
