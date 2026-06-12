import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, LifeBuoy, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please fill in all fields", "warning");
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      addToast("Successfully logged in", "success");
      // Check user role to navigate appropriately
      // (The context state updates asynchronously, but we redirect to "/")
      navigate("/");
    } else {
      addToast(res.message || "Invalid credentials", "error");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 neo-card p-10">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-violet-600/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 border-2 border-slate-900 dark:border-white rounded-2xl mb-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <LifeBuoy className="w-10 h-10 animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-base lg:text-lg text-slate-600 dark:text-slate-400 font-semibold">
            Sign in to access your dashboard and support tickets.
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-base font-black text-slate-800 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 dark:text-slate-400 z-10">
                  <Mail className="w-5.5 h-5.5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="neo-input pl-12 text-base font-bold"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-black text-slate-800 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 dark:text-slate-400 z-10">
                  <Lock className="w-5.5 h-5.5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="neo-input pl-12 text-base font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="neo-btn-primary w-full text-base"
            >
              {isSubmitting ? (
                <span className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials Info Card */}
        <div className="p-5 rounded-xl bg-violet-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-white shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff] text-sm text-slate-600 dark:text-slate-300 space-y-3">
          <p className="font-black text-slate-900 dark:text-white text-base">Demo Accounts:</p>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white min-w-20">Admin:</span>
              <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 font-semibold text-slate-700 dark:text-slate-300">
                <div>Email: <code className="text-violet-600 dark:text-violet-400 font-black">admin@crm.com</code></div>
                <div>Password: <code className="text-violet-600 dark:text-violet-400 font-black">admin123</code></div>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-900 dark:border-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_#fff] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white min-w-20">Customer:</span>
              <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 font-semibold text-slate-700 dark:text-slate-300">
                <div>Email: <code className="text-violet-600 dark:text-violet-400 font-black">sconnor@cyberdyne.com</code></div>
                <div>Password: <code className="text-violet-600 dark:text-violet-400 font-black">sconnor123</code></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation link to Sign up */}
        <div className="text-center pt-2">
          <p className="text-base text-slate-650 dark:text-slate-400 font-bold">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="inline-flex items-center gap-1 font-black text-violet-600 dark:text-violet-400 hover:text-violet-750 dark:hover:text-violet-300 transition-colors underline decoration-2 decoration-violet-500/30 hover:decoration-violet-500"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
