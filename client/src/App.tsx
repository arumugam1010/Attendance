import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/components/Login";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import Employees from "@/pages/Employees";
import Departments from "@/pages/Departments";
import Attendance from "@/pages/Attendance";
import Reports from "@/pages/Reports";
import Sites from "@/pages/Sites";
import NotFound from "@/pages/not-found";
import RoleManagement from "@/components/RoleManagement";
import WorkAssignment from "@/components/WorkAssignment";
import Profile from "@/pages/Profile";
import AssignedWork from "@/pages/AssignedWork";

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="*" component={Login} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/departments" component={Departments} />
        <Route path="/admin/work-assignments" component={WorkAssignment} />
        <Route path="/employee/dashboard" component={EmployeeDashboard} />
        <Route path="/employee/assigned-work" component={AssignedWork} />
        <Route path="/employee/profile" component={Profile} />
        <Route path="/admin/employees" component={Employees} />
        <Route path="/admin/attendance" component={Attendance} />
        <Route path="/admin/sites" component={Sites} />
        <Route path="/admin/reports" component={Reports} />
        <Route path="/employee/attendance" component={Attendance} />
        <Route path="/employee/history" component={Attendance} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
