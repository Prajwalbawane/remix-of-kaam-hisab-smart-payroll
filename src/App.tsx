import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import WorkersPage from "./pages/WorkersPage";
import WorkerDetailPage from "./pages/WorkerDetailPage";
import ScanPage from "./pages/ScanPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AttendancePage from "./pages/AttendancePage";
import PaymentsPage from "./pages/PaymentsPage";
import AuthPage from "./pages/AuthPage";
import WorkerDashboard from "./pages/WorkerDashboard";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Protected route wrapper - must be inside AuthProvider
function ProtectedRoute({ children, ownerOnly = false }: { children: React.ReactNode; ownerOnly?: boolean }) {
  const { isLoggedIn, isOwner, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  
  if (ownerOnly && !isOwner) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Main app router - must be inside AuthProvider
function AppRoutes() {
  const { isLoggedIn, isWorker, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={isLoggedIn ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      
      {/* Root route - show different dashboard based on role */}
      <Route 
        path="/" 
        element={
          !isLoggedIn ? (
            <Navigate to="/auth" replace />
          ) : isWorker ? (
            <AppLayout><WorkerDashboard /></AppLayout>
          ) : (
            <Index />
          )
        } 
      />
      
      {/* Owner-only routes */}
      <Route path="/workers" element={<ProtectedRoute ownerOnly><AppLayout><WorkersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/worker/:id" element={<ProtectedRoute ownerOnly><AppLayout><WorkerDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute ownerOnly><AppLayout><AttendancePage /></AppLayout></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute ownerOnly><AppLayout><PaymentsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute ownerOnly><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
      
      {/* Shared routes */}
      <Route path="/scan" element={<ProtectedRoute><AppLayout><ScanPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// App content that requires AuthProvider
function AppContent() {
  return (
    <>
      <AppRoutes />
      <ConnectionStatus />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
