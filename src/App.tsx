import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DashboardClients from "./pages/DashboardClients.tsx";
import DashboardProjects from "./pages/DashboardProjects.tsx";
import DashboardMilestones from "./pages/DashboardMilestones.tsx";
import DashboardInquiries from "./pages/DashboardInquiries.tsx";
import DashboardSubmissions from "./pages/DashboardSubmissions.tsx";
import DashboardPayments from "./pages/DashboardPayments.tsx";
import DashboardProjectDetail from "./pages/DashboardProjectDetail.tsx";
import ClientPortal from "./pages/ClientPortal.tsx";
import SubmitProject from "./pages/SubmitProject.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/clients" element={<DashboardClients />} />
            <Route path="/dashboard/projects" element={<DashboardProjects />} />
            <Route path="/dashboard/milestones" element={<DashboardMilestones />} />
            <Route path="/dashboard/inquiries" element={<DashboardInquiries />} />
            <Route path="/dashboard/submissions" element={<DashboardSubmissions />} />
            <Route path="/dashboard/payments" element={<DashboardPayments />} />
            <Route path="/dashboard/project/:id" element={<DashboardProjectDetail />} />
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/portal/submit" element={<SubmitProject />} />
            <Route path="/portal/project/:id" element={<DashboardProjectDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
