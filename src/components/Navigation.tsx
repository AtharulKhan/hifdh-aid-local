
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navItems = [
  { path: "/", icon: Home, label: "Quran Review" },
  { path: "/page-view", icon: BookOpen, label: "Quran Review (Page)" }
];

export const Navigation = () => {
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="h-10 w-10"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="ml-3 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Quran Hifz Aid
        </h1>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={cn(
        "transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-xl border-r border-gray-100 min-h-screen shadow-sm animate-fadeIn",
        // Desktop styles
        "hidden md:block",
        isMinimized ? "w-16" : "w-64",
        // Mobile styles
        "md:relative fixed top-0 left-0 z-50",
        isMobileOpen ? "block w-64" : "hidden md:block",
        // Mobile positioning
        "md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 flex justify-between items-center">
          <h1 className={cn(
            "text-xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent",
            isMinimized ? "hidden" : "block"
          )}>
            Quran Hifz Aid
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="space-y-2 p-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                "hover:bg-gray-50 hover:scale-105",
                location.pathname === path
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn(
                "font-medium",
                isMinimized ? "hidden" : "block"
              )}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};
