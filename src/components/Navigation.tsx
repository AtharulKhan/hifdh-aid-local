import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home,
  PanelLeftClose,
  PanelLeft,
  BookOpen
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

  return (
    <nav className={cn(
      "transition-all duration-300 ease-in-out",
      "bg-white/95 backdrop-blur-xl border-r border-gray-100 min-h-screen shadow-sm animate-fadeIn",
      isMinimized ? "w-16" : "w-16 md:w-64"
    )}>
      <div className="p-4 flex justify-between items-center">
        <h1 className={cn(
          "text-xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent",
          isMinimized ? "hidden" : "hidden md:block"
        )}>
          Quran Hifz Aid
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
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
              "hover:bg-gray-50 hover:scale-105",
              location.pathname === path
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className={cn(
              "font-medium",
              isMinimized ? "hidden" : "hidden md:inline"
            )}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
