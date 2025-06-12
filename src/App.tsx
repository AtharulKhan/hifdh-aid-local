
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Toaster } from "./components/ui/toaster";
import { AudioProvider } from "./contexts/AudioContext";
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

function App() {
  const isMobile = useIsMobile();

  return (
    <Router>
      <AudioProvider>
        <div className="flex min-h-screen bg-background w-full">
          <Navigation />
          <main className={`flex-1 ${isMobile ? 'pt-16' : ''}`}>
            <Routes>
              <Route path="/" element={<Index />} />
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
            </Routes>
          </main>
        </div>
        <Toaster />
      </AudioProvider>
    </Router>
  );
}

export default App;
