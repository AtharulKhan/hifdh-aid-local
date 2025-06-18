
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import Index from "./pages/Index";
import Stats from "./pages/Stats";
import PageView from "./pages/PageView";
import Test from "./pages/Test";
import WeakSpotsHub from "./pages/WeakSpotsHub";
import Murajah from "./pages/Murajah";
import Tajweed from "./pages/Tajweed";
import QuranSystem from "./pages/QuranSystem";
import { AuthPage } from "./components/auth/AuthPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
            <div className="flex">
              <Navigation />
              <main className="flex-1 transition-all duration-300">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/page-view" element={<PageView />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/weak-spots" element={<WeakSpotsHub />} />
                  <Route path="/murajah" element={<Murajah />} />
                  <Route path="/tajweed" element={<Tajweed />} />
                  <Route path="/quran-system" element={<QuranSystem />} />
                  <Route path="/auth" element={<AuthPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
