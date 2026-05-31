import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

// Form schema
const loginSchema = zod.object({
  email: zod.string().email({ message: "Invalid email address format" }),
  password: zod.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: zod.boolean().optional(),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "alex@invoiceiq.app",
      password: "password123",
      rememberMe: true
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const success = await login(values.email, values.password);
      if (success) {
        navigate("/dashboard");
      } else {
        setErrorMsg("Invalid email or password.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex select-none bg-background text-foreground transition-colors duration-300">
      
      {/* 1. LEFT SCREEN: Premium SaaS Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-12 select-none border-r">
        {/* Animated backdrop glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-800/20 via-indigo-900/10 to-emerald-950/10 z-0" />
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

        {/* Brand logo */}
        <div className="flex items-center gap-3 relative z-10 select-none">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white fill-white/10" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white select-none">
            Invoice<span className="text-primary-500">IQ</span>
          </span>
        </div>

        {/* Visual Mock Card Centerpieces */}
        <div className="relative z-10 my-auto flex flex-col gap-6 max-w-md select-none">
          <motion.div 
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold select-none">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              SaaS Business Management Platform
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise invoicing, built for high-performance scale.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Consolidate your client balances, track background projects billables, and log expenses with one unified premium Stripe-ready workflow dashboard.
            </p>
          </motion.div>

          {/* Floating graphic box */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl relative select-none"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Succeeded</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">INV-2026-001</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono">$9,350.00</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Acme Corporation</span>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 select-none">
          <span>© 2026 InvoiceIQ Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* 2. RIGHT SCREEN: Forms & Authentication Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 select-none relative">
        {/* Background glow for mobile */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 via-indigo-500/5 to-transparent pointer-events-none lg:hidden shrink-0" />
        
        <div className="w-full max-w-[420px] select-none z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground select-none">
              Sign In to InvoiceIQ
            </h2>
            <p className="text-sm text-muted-foreground">
              Welcome back! Please enter your details below.
            </p>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-rose-500/5 text-xs text-rose-500 font-semibold flex items-center gap-2 select-none animate-shake">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs font-semibold select-none">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-muted-foreground font-bold tracking-wide uppercase select-none">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors mt-2.5" />
                <input
                  id="email"
                  type="email"
                  placeholder="alex@invoiceiq.app"
                  {...register("email")}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all text-sm font-medium",
                    errors.email ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-rose-500 font-bold">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-muted-foreground font-bold tracking-wide uppercase select-none">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-primary hover:text-primary-700 transition-colors select-none">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors mt-2.5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(
                    "w-full pl-9 pr-10 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all text-sm font-medium",
                    errors.password ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[10px] text-rose-500 font-bold">{errors.password.message}</span>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between select-none">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground/80 select-none">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="rounded border bg-card/60 w-3.5 h-3.5 accent-indigo-500"
                />
                Remember my login sessions
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all duration-300 hover:shadow-premium select-none disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] mt-2 shrink-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>

          {/* Removed Social Sign In Mock UI */}

          {/* SignUp Switcher */}
          <p className="text-center text-xs text-muted-foreground select-none">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-700 transition-colors select-none">
              Register Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
