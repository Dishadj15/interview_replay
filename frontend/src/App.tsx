import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { useAuth } from "./hooks/useAuth";
import { AnalyticsPage } from "./pages/Analytics";
import { DashboardPage } from "./pages/Dashboard";
import { FeedbackPage } from "./pages/Feedback";
import { HistoryPage } from "./pages/History";
import { InterviewDetailPage } from "./pages/InterviewDetail";
import { LoginPage } from "./pages/Login";
import { ProgressPage } from "./pages/Progress";
import { SignupPage } from "./pages/Signup";
import { UploadPage } from "./pages/Upload";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/interviews/:id" element={<InterviewDetailPage />} />
        <Route path="/interviews/:id/analytics" element={<AnalyticsPage />} />
        <Route path="/interviews/:id/feedback" element={<FeedbackPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
