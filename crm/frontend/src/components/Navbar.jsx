import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LifeBuoy, LayoutDashboard, Ticket, PlusCircle, Sun, Moon, LogOut, LogIn } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FocusFrame from "./FocusFrame";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast("Logged out successfully", "success");
    navigate("/login");
  };

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { label: "Create Ticket", path: "/tickets/create", icon: PlusCircle }
      ];
    }
    if (isAdmin) {
      return [
        { label: "Dashboard", path: "/", icon: LayoutDashboard },
        { label: "Tickets", path: "/tickets", icon: Ticket },
      ];
    } else {
      return [
        { label: "Tickets", path: "/tickets", icon: Ticket },
        { label: "Create Ticket", path: "/tickets/create", icon: PlusCircle },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <nav className="fixed top-0 left-0 bottom-0 z-40 hidden md:flex flex-col w-64 border-r-3 border-slate-900 dark:border-white bg-white dark:bg-slate-950 p-6 justify-between transition-colors duration-200">
        {/* Top Branding and Main Links */}
        <div className="space-y-8">
          <Link to="/" className="flex items-center gap-3 font-black text-2xl text-slate-900 dark:text-white group">
            <div className="p-2.5 bg-violet-600 text-white border-2 border-slate-900 dark:border-white rounded-xl shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <LifeBuoy className="w-6 h-6 animate-pulse" />
            </div>
            <span className="tracking-tight hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              <FocusFrame text="SupportCRM" />
            </span>
          </Link>

          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                item.path === "/" 
                   ? location.pathname === "/" 
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-black transition-all duration-150 border-2 ${
                    isActive
                      ? "bg-violet-600 text-white border-slate-900 dark:border-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Theme & User Profile Actions */}
        <div className="space-y-6">
          <button
            onClick={toggleTheme}
            className="neo-btn-secondary w-full text-base font-black flex items-center justify-center gap-3"
          >
            {isDark ? (
              <>
                <Sun className="w-5 h-5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center justify-between p-4 bg-violet-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-white rounded-xl shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm font-black text-slate-900 dark:text-white truncate leading-tight">
                  {user?.full_name}
                </span>
                <span className="inline-flex self-start px-2 py-0.5 mt-1.5 text-[10px] font-black uppercase border-1.5 border-slate-900 dark:border-white bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded">
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white border-2 border-transparent hover:border-slate-900 dark:hover:border-white rounded-lg transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="neo-btn-primary w-full text-base font-black"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* MOBILE TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors duration-200 px-4 py-3 flex md:hidden items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black text-lg text-violet-600 dark:text-violet-400">
          <LifeBuoy className="w-5 h-5 animate-pulse" />
          <span className="flex items-center">
            <FocusFrame text="SupportCRM" />
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400"
          >
            {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* MOBILE BOTTOM TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            item.path === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full text-sm font-bold transition-colors ${
                isActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Navbar;
