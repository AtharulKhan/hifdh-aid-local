import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Toaster } from "./components/ui/toaster";
import { AudioProvider } from "./contexts/AudioContext";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Mindfulness from "./pages/Mindfulness";

import { SettingsProvider } from '@/hooks/use-settings';

function App() {
  return (
    <SettingsProvider>
    <Router>
      <AudioProvider>
        <div className="flex min-h-screen bg-background">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
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
    </SettingsProvider>
  );
}

export default App;
