
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Toaster } from "./components/ui/toaster";
import { AudioProvider } from "./contexts/AudioContext";
import { AuthProvider } from "./contexts/AuthContext";
import { WeakSpotsProvider } from "./contexts/WeakSpotsContext";
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
import { AuthPage } from "./components/auth/AuthPage";
import WeakSpotsHub from "./pages/WeakSpotsHub";
import ConsolidationView from "./pages/ConsolidationView";

function App() {
  const isMobile = useIsMobile();

  return (
    <Router>
      <AuthProvider>
        <WeakSpotsProvider>
          <AudioProvider>
            <div className="flex min-h-screen bg-background w-full">
              <Navigation />
              <main className={`flex-1 ${isMobile ? 'pt-16' : 'ml-0'}`}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/auth" element={<AuthPage />} />
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
                  <Route path="/weak-spots" element={<WeakSpotsHub />} />
                  <Route path="/consolidation-view/:surah_number/:ayah_number" element={<ConsolidationView />} />
                </Routes>
              </main>
            </div>
            <Toaster />
          </AudioProvider>
        </WeakSpotsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
