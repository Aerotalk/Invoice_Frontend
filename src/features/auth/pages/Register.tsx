import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, User, Zap } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

// Form Schema
const registerSchema = zod.object({
  name: zod.string().min(2, { message: "Full Name must be at least 2 characters" }),
  email: zod.string().email({ message: "Invalid email address format" }),
  password: zod.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: zod.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Simulate real register and immediately auto-authenticate
      const success = await login(values.email, "admin");
      if (success) {
        alert("Registration Successful! Your 14-day free trial is now active.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex select-none bg-background text-foreground transition-colors duration-300">
      
      {/* 1. LEFT SIDE: Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-12 select-none border-r">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-800/20 via-indigo-900/10 to-emerald-950/10 z-0" />
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10 select-none">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white fill-white/10" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white select-none">
            Invoice<span className="text-primary-500">IQ</span>
          </span>
        </div>

        <div className="relative z-10 my-auto flex flex-col gap-6 max-w-md select-none">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold select-none">
              <Sparkles className="w-3.5 h-3.5" />
              14-Day Full Access Trial
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Start billing in seconds. No credit card required.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Activate your workspace sandbox and start designing invoices, logging time spent on contracts, and running advanced financial reports.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 select-none">
          <span>© 2026 InvoiceIQ Inc.</span>
        </div>
      </div>

      {/* 2. RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 select-none relative">
        <div className="w-full max-w-[420px] select-none z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground select-none">
              Create Free Trial Account
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign up today and streamline your invoicing workflows.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-rose-500/5 text-xs text-rose-500 font-semibold flex items-center gap-2 select-none">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs font-semibold select-none">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase select-none">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors mt-2.5" />
                <input
                  type="text"
                  placeholder="Alex Sterling"
                  {...register("name")}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all text-sm font-medium",
                    errors.name ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
              </div>
              {errors.name && <span className="text-[10px] text-rose-500 font-bold">{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase select-none">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors mt-2.5" />
                <input
                  type="email"
                  placeholder="alex@acme.com"
                  {...register("email")}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all text-sm font-medium",
                    errors.email ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-500 font-bold">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase select-none">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors mt-2.5" />
                <input
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
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] text-rose-500 font-bold">{errors.password.message}</span>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase select-none">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors mt-2.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all text-sm font-medium",
                    errors.confirmPassword ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-rose-500 font-bold">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all duration-300 hover:shadow-premium select-none disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] mt-2 shrink-0 flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Start Free Trial"}
            </button>
          </form>

          {/* SignIn Link */}
          <p className="text-center text-xs text-muted-foreground select-none">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-700 transition-colors select-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
