import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldAlert, 
  Sparkles, 
  User, 
  Zap, 
  Building2, 
  Phone, 
  MapPin, 
  Globe 
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

// Dependent geographical dataset
const locationData: Record<string, Record<string, string[]>> = {
  India: {
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
    "Karnataka": ["Bengaluru", "Mysore", "Hubli", "Mangalore"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini"]
  },
  "United States": {
    "California": ["San Francisco", "Los Angeles", "San Jose", "San Diego"],
    "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
    "Texas": ["Houston", "Austin", "Dallas", "San Antonio"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Leeds"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"]
  },
  "United Arab Emirates": {
    "Dubai": ["Dubai City"],
    "Abu Dhabi": ["Abu Dhabi City"]
  }
};

const countryPhoneCodes = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" }
];

// Form Schema
const registerSchema = zod.object({
  accountType: zod.enum(['individual', 'business']),
  name: zod.string().min(2, { message: "Name must be at least 2 characters" }),
  phoneCode: zod.string().min(1),
  phone: zod.string().min(6, { message: "Phone number must be at least 6 digits" }),
  email: zod.string().email({ message: "Invalid email address format" }),
  password: zod.string().min(6, { message: "Password must be at least 6 characters" }),
  country: zod.string().min(1, { message: "Country is required" }),
  state: zod.string().min(1, { message: "State is required" }),
  city: zod.string().min(1, { message: "City is required" }),
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: 'business',
      phoneCode: '+91',
      country: 'India',
      state: 'West Bengal',
      city: 'Kolkata'
    }
  });

  const accountType = watch("accountType");
  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Dependent dropdown handlers
  useEffect(() => {
    if (selectedCountry && locationData[selectedCountry]) {
      const states = Object.keys(locationData[selectedCountry]);
      const defaultState = states.includes("West Bengal") ? "West Bengal" : states[0];
      setValue("state", defaultState);
    }
  }, [selectedCountry, setValue]);

  useEffect(() => {
    if (selectedCountry && selectedState && locationData[selectedCountry]?.[selectedState]) {
      const cities = locationData[selectedCountry][selectedState];
      const defaultCity = cities.includes("Kolkata") ? "Kolkata" : cities[0];
      setValue("city", defaultCity);
    }
  }, [selectedState, selectedCountry, setValue]);

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Simulate real register and immediately auto-authenticate
      const success = await login(values.email, "admin");
      if (success) {
        alert("Account created successfully! Welcome to your InvoiceIQ workspace.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const countries = Object.keys(locationData);
  const states = selectedCountry ? Object.keys(locationData[selectedCountry] || {}) : [];
  const cities = (selectedCountry && selectedState) ? (locationData[selectedCountry][selectedState] || []) : [];

  return (
    <div className="min-h-screen flex select-none bg-background text-foreground transition-colors duration-300">
      
      {/* 1. LEFT SIDE: Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-12 select-none border-r">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-800/10 via-slate-900/10 to-zinc-950/15 z-0" />
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-primary-600/5 blur-[120px] pointer-events-none" />

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary-500/30 bg-primary-500/5 text-primary-400 text-xs font-semibold select-none">
              <Sparkles className="w-3.5 h-3.5" />
              Professional Invoicing Suite
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Start billing in seconds. Corporate ready.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Activate your workspace and start designing invoices, logging time spent on contracts, and running advanced financial reports.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 select-none">
          <span>© 2026 InvoiceIQ Inc.</span>
        </div>
      </div>

      {/* 2. RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 select-none relative max-h-screen overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-[440px] select-none z-10 flex flex-col gap-5 py-8">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground select-none">
              Create InvoiceIQ Account
            </h2>
            <p className="text-xs text-muted-foreground">
              Sign up today and streamline your invoicing workflows.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-rose-500/5 text-xs text-rose-500 font-semibold flex items-center gap-2 select-none">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Account Type pill Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border select-none">
            <button
              type="button"
              onClick={() => setValue("accountType", "individual")}
              className={cn(
                "py-2 text-xs font-bold rounded-lg transition-all active:scale-[0.98]",
                accountType === 'individual'
                  ? "bg-card text-foreground shadow-premium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setValue("accountType", "business")}
              className={cn(
                "py-2 text-xs font-bold rounded-lg transition-all active:scale-[0.98]",
                accountType === 'business'
                  ? "bg-card text-foreground shadow-premium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Business
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs font-semibold select-none">
            
            {/* Conditional Business Name / Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase select-none">
                {accountType === 'business' ? "Company Name" : "Full Name"}
              </label>
              <div className="relative group">
                {accountType === 'business' ? (
                  <Building2 className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors mt-2.5" />
                ) : (
                  <User className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors mt-2.5" />
                )}
                <input
                  type="text"
                  placeholder={accountType === 'business' ? "Company Name" : "Alex Sterling"}
                  {...register("name")}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary transition-all text-sm font-medium",
                    errors.name ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
              </div>
              {errors.name && <span className="text-[10px] text-rose-500 font-bold">{errors.name.message}</span>}
            </div>

            {/* Custom +91 Phone Input with dropdown selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase select-none">Phone Number</label>
              <div className="flex gap-2 relative group">
                <div className="relative shrink-0 w-24">
                  <Globe className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 mt-2.5" />
                  <select
                    {...register("phoneCode")}
                    className="w-full pl-8 pr-2 py-2 border rounded-lg bg-card/60 outline-none text-xs font-semibold focus:border-primary cursor-pointer appearance-none text-center"
                  >
                    {countryPhoneCodes.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 w-4 h-4 text-slate-400 mt-2.5" />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    {...register("phone")}
                    className={cn(
                      "w-full pl-9 pr-4 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary transition-all text-sm font-medium",
                      errors.phone ? "border-rose-500/70 focus:border-rose-500" : ""
                    )}
                  />
                </div>
              </div>
              {errors.phone && <span className="text-[10px] text-rose-500 font-bold">{errors.phone.message}</span>}
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground font-bold tracking-wide uppercase select-none">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors mt-2.5" />
                <input
                  type="email"
                  placeholder="Email Address"
                  {...register("email")}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary transition-all text-sm font-medium",
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
                <Lock className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors mt-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className={cn(
                    "w-full pl-9 pr-10 py-2 border rounded-lg bg-card/60 outline-none focus:bg-card focus:border-primary transition-all text-sm font-medium",
                    errors.password ? "border-rose-500/70 focus:border-rose-500" : ""
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-foreground shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] text-rose-500 font-bold">{errors.password.message}</span>}
            </div>

            {/* 3-Tier Dependent Geographical Selectors */}
            <div className="grid grid-cols-3 gap-2">
              {/* Country */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">Country</label>
                <div className="relative">
                  <select
                    {...register("country")}
                    className="w-full px-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary"
                  >
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">State</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-2 w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                  <select
                    {...register("state")}
                    className="w-full pl-2 sm:pl-7 pr-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                  >
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-bold tracking-wide uppercase text-[9px]">City</label>
                <div className="relative">
                  <select
                    {...register("city")}
                    className="w-full px-2 py-2 border rounded-lg bg-card outline-none text-xs font-semibold focus:border-primary cursor-pointer"
                  >
                    {cities.map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all duration-300 hover:shadow-premium select-none disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] mt-2 shrink-0 flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Register & Activate Workspace"}
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
