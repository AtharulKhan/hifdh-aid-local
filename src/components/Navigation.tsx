import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  MessageCircle, 
  BookOpen, 
  Leaf, 
  Activity,
  Users,
  HelpCircle,
  Home,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <nav className="w-16 md:w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 min-h-screen shadow-lg animate-fadeIn">
      <div className="p-4">
        <h1 className="text-xl font-bold text-center hidden md:block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Mental Health Hub
        </h1>
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
            <span className="hidden md:inline font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}