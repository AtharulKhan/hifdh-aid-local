import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Index from "./pages/Index";
import Journal from "./pages/Journal";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/journal" element={<Journal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;