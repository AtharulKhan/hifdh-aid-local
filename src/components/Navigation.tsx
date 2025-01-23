import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  MessageCircle, 
  BookOpen, 
  Leaf, 
  Activity,
  Users,
  HelpCircle,
  Home,
  Settings,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/chat", icon: MessageCircle, label: "AI Therapist" },
  { path: "/journal", icon: BookOpen, label: "Mood Journal" },
  { path: "/mindfulness", icon: Leaf, label: "Mindfulness" },
  { path: "/progress", icon: Activity, label: "Progress" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/help", icon: HelpCircle, label: "Get Help" },
  { path: "/settings", icon: Settings, label: "Settings" }
];

export const Navigation = () => {
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <nav className={cn(
      "fixed md:relative transition-all duration-300 ease-in-out z-50",
      "bg-white/80 backdrop-blur-xl border-r border-gray-200 min-h-screen shadow-lg animate-fadeIn",
      isMinimized ? "w-0 md:w-16 -translate-x-full md:translate-x-0" : "w-64 md:w-64 translate-x-0"
    )}>
      <div className="p-4 flex justify-between items-center">
        <h1 className={cn(
          "text-xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
          isMinimized ? "hidden" : "block"
        )}>
          Mental Health Hub
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-4 md:hidden"
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
            className={cn(
              "flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200",
              "hover:bg-primary/5 hover:scale-105",
              location.pathname === path
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                : "text-gray-600"
            )}
          >
            <Icon className="h-5 w-5" />
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
  );
}