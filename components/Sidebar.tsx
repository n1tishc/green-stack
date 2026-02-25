"use client";

import Link from "next/link";
import { Leaf, DollarSign, Zap, Upload, BarChart3, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "#upload", label: "Upload Data", icon: Upload },
  { href: "#carbon", label: "Carbon", icon: Leaf },
  { href: "#cost", label: "Cost", icon: DollarSign },
  { href: "#advisor", label: "AI Advisor", icon: Zap },
];

export default function Sidebar() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <aside className="w-64 hidden lg:flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-4 gap-2 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <Leaf className="text-emerald-500 w-7 h-7" />
        <span className="text-xl font-bold text-gray-900 dark:text-white">GreenStack</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-sm font-medium"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm"
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        {dark ? "Light Mode" : "Dark Mode"}
      </button>
    </aside>
  );
}
