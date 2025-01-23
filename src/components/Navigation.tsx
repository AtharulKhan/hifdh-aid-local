import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Menu as MenuIcon, ClipboardList, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Accueil" },
  { path: "/menu", icon: MenuIcon, label: "Menu" },
  { path: "/orders", icon: ClipboardList, label: "Commandes" },
  { path: "/settings", icon: SettingsIcon, label: "Paramètres" }
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="w-16 md:w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 min-h-screen shadow-lg animate-fadeIn">
      <div className="p-4">
        <h1 className="text-xl font-bold text-center hidden md:block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Restaurant POS
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
};