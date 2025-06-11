import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZendeskSettings } from "@/components/ZendeskSettings";
import {
  BarChart3,
  Brain,
  Target,
  TrendingDown,
  Menu,
  Settings,
  Bell,
  User,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Ticket Analysis", href: "/analysis", icon: TrendingDown },
  { name: "CES Predictions", href: "/predictions", icon: Brain },
  { name: "Recommendations", href: "/recommendations", icon: Target },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Top header with navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ces-500 to-ces-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  CES Analyzer
                </h1>
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-ces-500 to-ces-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Right side - CES Target and Actions */}
          <div className="flex items-center space-x-4">
            {/* CES Target Badge */}
            <Card className="px-3 py-1 bg-gradient-to-br from-ces-50 to-ces-100 dark:from-ces-900/20 dark:to-ces-800/20 border-ces-200 dark:border-ces-700">
              <div className="flex items-center space-x-2 text-ces-700 dark:text-ces-300">
                <Target className="h-3 w-3" />
                <div className="text-xs">
                  <span className="font-medium">Target: ≥4.0</span>
                </div>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <ZendeskSettings />
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={cn(
            "fixed top-0 left-0 z-50 h-screen w-64 transform bg-white dark:bg-slate-900 shadow-strong transition-transform duration-300 ease-in-out md:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Menu
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                ×
              </Button>
            </div>
            <nav className="flex-1 space-y-2 p-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-ces-500 to-ces-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Page content - Full width */}
      <main className="p-6">
        <div className="mx-auto max-w-full">{children}</div>
      </main>
    </div>
  );
}
