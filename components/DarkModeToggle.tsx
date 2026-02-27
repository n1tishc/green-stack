"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
    >
      {/* Toggle track */}
      <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 dark:bg-emerald-500 transition-colors duration-300 flex-shrink-0">
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-300 ${
            dark ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </span>
      {dark ? (
        <Sun className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      )}
    </button>
  );
}
