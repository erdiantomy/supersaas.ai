import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-loaded dashboard pages (code-split)
const AdminOverview = lazy(() => import("./pages/AdminOverview"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardClients = lazy(() => import("./pages/DashboardClients"));
const DashboardProjects = lazy(() => import("./pages/DashboardProjects"));
const DashboardMilestones = lazy(() => import("./pages/DashboardMilestones"));
const DashboardInquiries = lazy(() => import("./pages/DashboardInquiries"));
const DashboardSubmissions = lazy(() => import("./pages/DashboardSubmissions"));
const DashboardPayments = lazy(() => import("./pages/DashboardPayments"));
const DashboardProjectDetail = lazy(() => import("./pages/DashboardProjectDetail"));
const ManagedAgents = lazy(() => import("./pages/ManagedAgents"));
const AgentNativeControls = lazy(() => import("./pages/AgentNativeControls"));

// Lazy-loaded client pages
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const NewProject = lazy(() => import("./pages/NewProject"));
const SubmitProject = lazy(() => import("./pages/SubmitProject"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      </div>
    </div>
  );
}

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Admin */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><AdminOverview /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/legacy" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><Dashboard /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/clients" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><DashboardClients /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/projects" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><DashboardProjects /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/milestones" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><DashboardMilestones /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/inquiries" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><DashboardInquiries /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/submissions" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><DashboardSubmissions /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><DashboardPayments /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/managed-agents" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><ManagedAgents /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/agent-native" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><AgentNativeControls /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/dashboard/project/:id" element={<ProtectedRoute allowedRoles={["admin"]}><SuspenseWrap><DashboardProjectDetail /></SuspenseWrap></ProtectedRoute>} />

            {/* Client */}
            <Route path="/portal" element={<ProtectedRoute allowedRoles={["client"]}><SuspenseWrap><ClientPortal /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/portal/new" element={<ProtectedRoute allowedRoles={["client"]}><SuspenseWrap><NewProject /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/portal/submit" element={<ProtectedRoute allowedRoles={["client"]}><SuspenseWrap><SubmitProject /></SuspenseWrap></ProtectedRoute>} />
            <Route path="/portal/project/:id" element={<ProtectedRoute allowedRoles={["client"]}><SuspenseWrap><DashboardProjectDetail /></SuspenseWrap></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
