
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Toaster } from "./components/ui/toaster";
import { AudioProvider } from "./contexts/AudioContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useIsMobile } from "./hooks/use-mobile";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Mindfulness from "./pages/Mindfulness";
import PageView from "./pages/PageView";
import Test from "./pages/Test";
import Tajweed from "./pages/Tajweed";
import Murajah from "./pages/Murajah";
import QuranSystem from "./pages/QuranSystem";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function AppContent() {
  const isMobile = useIsMobile();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background w-full">
        <Navigation />
        <main className={`flex-1 ${isMobile ? 'pt-16' : ''}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/page-view" element={<PageView />} />
            <Route path="/test" element={<Test />} />
            <Route path="/tajweed" element={<Tajweed />} />
            <Route path="/murajah" element={<Murajah />} />
            <Route path="/quran-system" element={<QuranSystem />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/mindfulness" element={<Mindfulness />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/index" element={<Index />} />
          </Routes>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AudioProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
          <Toaster />
        </AudioProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
