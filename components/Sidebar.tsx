"use client";

import Link from "next/link";
import { Leaf, DollarSign, Zap, Upload, BarChart3, Moon, Sun, Sliders, Code2 } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: BarChart3, id: "dashboard" },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "#upload", label: "Upload Data", icon: Upload, id: "upload" },
      { href: "#upload", label: "IaC Audit", icon: Code2, id: "iac" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "#carbon", label: "Carbon", icon: Leaf, id: "carbon" },
      { href: "#cost", label: "Cost", icon: DollarSign, id: "cost" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "#simulator", label: "Simulator", icon: Sliders, id: "simulator" },
      { href: "#advisor", label: "AI Advisor", icon: Zap, id: "advisor" },
    ],
  },
];

export default function Sidebar() {
  const [dark, setDark] = useState(false);
  const [activeId, setActiveId] = useState("dashboard");

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
    <aside className="w-64 hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 min-h-screen">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-emerald-900/40 flex-shrink-0">
            <Leaf className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="block text-[15px] font-bold text-gray-900 dark:text-white">GreenStack</span>
            <span className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
              Carbon Command Center
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label} className="mb-5">
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-600">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, label: itemLabel, icon: Icon, id }) => {
                const isActive = activeId === id;
                return (
                  <Link
                    key={id}
                    href={href}
                    onClick={() => setActiveId(id)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300"
                        : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/50"
                          : "bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-700"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    {itemLabel}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={toggleDark}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-slate-200 transition-all"
        >
          <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-700 flex items-center justify-center transition-colors">
            {dark ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-gray-500" />
            )}
          </div>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
