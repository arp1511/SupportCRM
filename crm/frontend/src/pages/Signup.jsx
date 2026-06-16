import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, UserPlus, LifeBuoy, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import FocusFrame from "../components/FocusFrame";

const Signup = () => {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      addToast("Please fill in all fields", "warning");
      return;
    }

    setIsSubmitting(true);
    const res = await signup(email, password, fullName, role);
    setIsSubmitting(false);

    if (res.success) {
      addToast("Account created successfully!", "success");
      navigate("/");
    } else {
      addToast(res.message || "Registration failed. Please try again.", "error");
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
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex justify-center">
            <FocusFrame text="Create Account" />
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 font-semibold">
            Sign up to manage and track your support inquiries.
          </p>
        </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-5">
            
            <div>
              <label htmlFor="fullName" className="block text-base font-black text-slate-800 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 dark:text-slate-400 z-10">
                  <User className="w-5.5 h-5.5" />
                </span>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="neo-input neo-input-icon text-base font-bold"
                />
              </div>
            </div>

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
                  className="neo-input neo-input-icon text-base font-bold"
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
                  className="neo-input neo-input-icon text-base font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-black text-slate-800 dark:text-slate-300 mb-2">
                Register As
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`py-2.5 px-4 rounded-xl text-base font-black border-2 cursor-pointer transition-all ${
                    role === "customer"
                      ? "bg-violet-600 border-slate-900 dark:border-white text-white shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff]"
                      : "bg-white dark:bg-slate-950 border-slate-900 dark:border-white text-slate-700 dark:text-slate-300 shadow-[1px_1px_0px_0px_#0f172a] dark:shadow-[1px_1px_0px_0px_#fff] hover:bg-slate-50"
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2.5 px-4 rounded-xl text-base font-black border-2 cursor-pointer transition-all ${
                    role === "admin"
                      ? "bg-violet-600 border-slate-900 dark:border-white text-white shadow-[3px_3px_0px_0px_#0f172a] dark:shadow-[3px_3px_0px_0px_#fff]"
                      : "bg-white dark:bg-slate-950 border-slate-900 dark:border-white text-slate-700 dark:text-slate-300 shadow-[1px_1px_0px_0px_#0f172a] dark:shadow-[1px_1px_0px_0px_#fff] hover:bg-slate-50"
                  }`}
                >
                  Support Agent
                </button>
              </div>
            </div>

          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="neo-btn-primary w-full text-base"
            >
              {isSubmitting ? (
                <span className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>

        {/* Navigation link to Login */}
        <div className="text-center pt-2">
          <p className="text-base text-slate-650 dark:text-slate-400 font-bold">
            Already have an account?{" "}
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-black text-violet-600 dark:text-violet-400 hover:text-violet-750 dark:hover:text-violet-300 transition-colors underline decoration-2 decoration-violet-500/30 hover:decoration-violet-500"
            >
              <ArrowLeft className="w-4 h-4 mr-0.5" />
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
