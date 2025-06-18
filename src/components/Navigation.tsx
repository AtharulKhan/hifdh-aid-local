
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, PanelLeftClose, PanelLeft, BookOpen, Menu, X, ClipboardCheck, BookText, RotateCcw, Book, BarChart3, LogIn, ListChecks, ChevronDown, ChevronRight, GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "./auth/UserMenu";

const navItems = [{
  path: "/",
  icon: BarChart3,
  label: "Dashboard"
}, {
  path: "/page-view",
  icon: BookOpen,
  label: "Qur'an & Tafsir"
}, {
  path: "/test",
  icon: ClipboardCheck,
  label: "Memorization Test"
}, {
  path: "/weak-spots",
  icon: ListChecks,
  label: "Weak Spots"
}, {
  path: "/murajah",
  icon: RotateCcw,
  label: "Schedule & Settings"
}];

const learnItems = [{
  path: "/tajweed",
  icon: BookText,
  label: "Tajweed Refresher"
}, {
  path: "/quran-system",
  icon: Book,
  label: "Qur'an System"
}];

export const Navigation = () => {
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLearnExpanded, setIsLearnExpanded] = useState(false);
  const isMobile = useIsMobile();
  const {
    user,
    loading
  } = useAuth();

  // Check if any learn item is active
  const isLearnActive = learnItems.some(item => location.pathname === item.path);

  // Don't show navigation on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  // Mobile Navigation
  if (isMobile) {
    return <>
        {/* Mobile Header with Hamburger */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between md:hidden">
          <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Quran Hifz Aid
          </h1>
          <div className="flex items-center gap-2">
            {!loading && (user ? <UserMenu /> : <Link to="/auth">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>)}
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

        {/* Mobile Sidebar */}
        <nav className={cn("fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-lg z-50 transform transition-transform duration-300 md:hidden", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Quran Hifz Aid
            </h1>
          </div>
          <div className="space-y-2 p-4">
            {navItems.map(({
            path,
            icon: Icon,
            label
          }) => <Link key={path} to={path} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200", "hover:bg-gray-50", location.pathname === path ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "text-gray-600 hover:text-gray-800")}>
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>)}
            
            {/* Mobile Learn Section */}
            <div className="space-y-1">
              <button
                onClick={() => setIsLearnExpanded(!isLearnExpanded)}
                className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200", "hover:bg-gray-50", isLearnActive ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "text-gray-600 hover:text-gray-800")}
              >
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-medium">Learn</span>
                </div>
                {isLearnExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {isLearnExpanded && (
                <div className="ml-4 space-y-1">
                  {learnItems.map(({
                  path,
                  icon: Icon,
                  label
                }) => <Link key={path} to={path} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200", "hover:bg-gray-50", location.pathname === path ? "bg-green-400 text-white" : "text-gray-600 hover:text-gray-800")}>
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>)}
                </div>
              )}
            </div>
          </div>
        </nav>
      </>;
  }

  // Desktop Navigation
  return <nav className={cn("transition-all duration-300 ease-in-out hidden md:flex", "bg-white/95 backdrop-blur-xl border-r border-gray-100 min-h-screen shadow-sm animate-fadeIn", isMinimized ? "w-16" : "w-64")}>
      <div className="w-full">
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <h1 className={cn("text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent transition-opacity duration-300", isMinimized ? "opacity-0 hidden" : "opacity-100")}>Qur'an Hifdh Aid</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-gray-100">
            {isMinimized ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        <div className="space-y-2 p-2">
          {navItems.map(({
          path,
          icon: Icon,
          label
        }) => <Link key={path} to={path} className={cn("flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200", "hover:bg-gray-50 hover:scale-105", location.pathname === path ? "bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600" : "text-gray-600 hover:text-gray-800")}>
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn("font-medium transition-opacity duration-300", isMinimized ? "opacity-0 hidden" : "opacity-100")}>
                {label}
              </span>
            </Link>)}
          
          {/* Desktop Learn Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsLearnExpanded(!isLearnExpanded)}
              className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200", "hover:bg-gray-50 hover:scale-105", isLearnActive ? "bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600" : "text-gray-600 hover:text-gray-800")}
            >
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 flex-shrink-0" />
                <span className={cn("font-medium transition-opacity duration-300", isMinimized ? "opacity-0 hidden" : "opacity-100")}>
                  Learn
                </span>
              </div>
              {!isMinimized && (isLearnExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
            </button>
            
            {isLearnExpanded && !isMinimized && (
              <div className="ml-4 space-y-1">
                {learnItems.map(({
                path,
                icon: Icon,
                label
              }) => <Link key={path} to={path} className={cn("flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200", "hover:bg-gray-50", location.pathname === path ? "bg-green-400 text-white" : "text-gray-600 hover:text-gray-800")}>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>)}
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop Auth Section */}
        <div className="mt-auto p-2 border-t border-gray-100">
          {!loading && (!isMinimized ? user ? <div className="flex items-center justify-between p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500">Signed in</p>
                  </div>
                  <UserMenu />
                </div> : <Link to="/auth">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link> : <div className="flex justify-center">
                {user ? <UserMenu /> : <Link to="/auth">
                    <Button variant="ghost" size="icon">
                      <LogIn className="h-4 w-4" />
                    </Button>
                  </Link>}
              </div>)}
        </div>
      </div>
    </nav>;
};
