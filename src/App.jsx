import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Profile
import Profile from "./pages/profile/Profile";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Inquiries
import InquiryList from "./pages/inquiries/InquiryList";
import InquiryForm from "./pages/inquiries/InquiryForm";
import InquiryView from "./pages/inquiries/InquiryView";

// Clients
import ClientList from "./pages/clients/ClientList";
import ClientForm from "./pages/clients/ClientForm";
import ClientView from "./pages/clients/ClientView";

// Plans
import PlanList from "./pages/plans/PlanList";
import PlanForm from "./pages/plans/PlanForm";
import PlanView from "./pages/plans/PlanView";

// Payments
import PaymentList from "./pages/payments/PaymentList";
import PaymentForm from "./pages/payments/PaymentForm";
import PaymentView from "./pages/payments/PaymentView";

// Invoices
import InvoiceList from "./pages/invoices/InvoiceList";
import InvoiceForm from "./pages/invoices/InvoiceForm";
import InvoiceView from "./pages/invoices/InvoiceView";

// Activation
import ActivationList from "./pages/activation/ActivationList";
import ActivationForm from "./pages/activation/ActivationForm";
import ActivationView from "./pages/activation/ActivationView";

// Tickets
import TicketList from "./pages/tickets/TicketList";
import TicketForm from "./pages/tickets/TicketForm";
import TicketView from "./pages/tickets/TicketView";

// Renewals
import RenewalList from "./pages/renewals/RenewalList";
import RenewalForm from "./pages/renewals/RenewalForm";
import RenewalView from "./pages/renewals/RenewalView";

// Reports
import Reports from "./pages/reports/Reports";

// Users & Roles & Permissions
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import UserView from "./pages/users/UserView";
import RoleList from "./pages/roles/RoleList";
import RoleForm from "./pages/roles/RoleForm";
import RoleView from "./pages/roles/RoleView";
import PermissionList from "./pages/permissions/PermissionList";
import PermissionForm from "./pages/permissions/PermissionForm";

// Audit / Settings / Notifications
import AuditLogs from "./pages/audit/AuditLogs";
import Settings from "./pages/settings/Settings";
import Notifications from "./pages/notifications/Notifications";

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="profile" element={<Profile />} />


    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />

      <Route path="inquiries" element={<InquiryList />} />
      <Route path="inquiries/new" element={<InquiryForm />} />
      <Route path="inquiries/:id/edit" element={<InquiryForm />} />
      <Route path="inquiries/:id" element={<InquiryView />} />

      <Route path="clients" element={<ClientList />} />
      <Route path="clients/new" element={<ClientForm />} />
      <Route path="clients/:id/edit" element={<ClientForm />} />
      <Route path="clients/:id" element={<ClientView />} />

      <Route path="plans" element={<PlanList />} />
      <Route path="plans/new" element={<PlanForm />} />
      <Route path="plans/:id/edit" element={<PlanForm />} />
      <Route path="plans/:id" element={<PlanView />} />

      <Route path="payments" element={<PaymentList />} />
      <Route path="payments/new" element={<PaymentForm />} />
      <Route path="payments/:id/edit" element={<PaymentForm />} />
      <Route path="payments/:id" element={<PaymentView />} />

      <Route path="invoices" element={<InvoiceList />} />
      <Route path="invoices/new" element={<InvoiceForm />} />
      <Route path="invoices/:id/edit" element={<InvoiceForm />} />
      <Route path="invoices/:id" element={<InvoiceView />} />

      <Route path="activation" element={<ActivationList />} />
      <Route path="activation/new" element={<ActivationForm />} />
      <Route path="activation/:id/edit" element={<ActivationForm />} />
      <Route path="activation/:id" element={<ActivationView />} />

      <Route path="tickets" element={<TicketList />} />
      <Route path="tickets/new" element={<TicketForm />} />
      <Route path="tickets/:id/edit" element={<TicketForm />} />
      <Route path="tickets/:id" element={<TicketView />} />

      <Route path="renewals" element={<RenewalList />} />
      <Route path="renewals/new" element={<RenewalForm />} />
      <Route path="renewals/:id" element={<RenewalView />} />

      <Route path="reports" element={<Reports />} />

      <Route path="users" element={<UserList />} />
      <Route path="users/new" element={<UserForm />} />
      <Route path="users/:id/edit" element={<UserForm />} />
      <Route path="users/:id" element={<UserView />} />

      <Route path="roles" element={<RoleList />} />
      <Route path="roles/new" element={<RoleForm />} />
      <Route path="roles/:id/edit" element={<RoleForm />} />
      <Route path="roles/:id" element={<RoleView />} />

      <Route path="permissions" element={<PermissionList />} />
      <Route path="permissions/new" element={<PermissionForm />} />
      <Route path="permissions/:id/edit" element={<PermissionForm />} />

      <Route path="audit-logs" element={<AuditLogs />} />
      <Route path="settings" element={<Settings />} />
      <Route path="notifications" element={<Notifications />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;

