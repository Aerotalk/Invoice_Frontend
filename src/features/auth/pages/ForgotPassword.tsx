import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Mail, ShieldCheck, ShieldAlert, ArrowLeft, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';

const schema = zod.object({
  email: zod.string().email({ message: "Invalid email address format" }),
});

type FormValues = zod.infer<typeof schema>;

export const ForgotPassword: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground transition-colors duration-300 relative select-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 via-indigo-500/5 to-transparent pointer-events-none shrink-0" />
      
      <div className="w-full max-w-[400px] bg-card border rounded-2xl shadow-2xl p-8 relative z-10 select-none flex flex-col gap-6">
        
        {/* Brand logo */}
        <div className="flex flex-col items-center gap-2 text-center select-none shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5.5 h-5.5 text-white fill-white/10" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground select-none mt-2">
            Recover Password
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs">
            {success 
              ? "We've sent recovery details to your mailbox." 
              : "Enter your email address to receive password reset links."
            }
          </p>
        </div>

        {success ? (
          <div className="flex flex-col gap-4 text-center select-none py-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6 shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Check your inbox for a message from **GrivetyGlobal Accounts**. Click the reset link within 1 hour to securely change your password.
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center gap-2 mt-4 text-sm font-semibold text-primary hover:text-primary-700 transition-colors select-none"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs font-semibold select-none">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase select-none">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors mt-2.5" />
                <input
                  type="email"
                  placeholder="alex@grivetyglobal.app"
                  {...register("email")}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-indigo-500/70 dark:focus:border-indigo-500/50 transition-all text-sm font-medium",
                    errors.email ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-500 font-bold">{errors.email.message}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all duration-300 hover:shadow-premium select-none disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] mt-2 shrink-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Sending...
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>

            <Link 
              to="/login"
              className="inline-flex items-center justify-center gap-2 mt-2 text-xs font-semibold text-primary hover:text-primary-700 transition-colors select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};
