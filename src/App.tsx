import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Toaster } from "./components/ui/toaster";
import { AudioProvider } from "./contexts/AudioContext";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import Mindfulness from "./pages/Mindfulness";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import Voice from "./pages/Voice";

function App() {
  return (
    <Router>
      <AudioProvider>
        <div className="flex min-h-screen bg-background">
          <Navigation />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/mindfulness" element={<Mindfulness />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/voice" element={<Voice />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </AudioProvider>
    </Router>
  );
}

export default App;