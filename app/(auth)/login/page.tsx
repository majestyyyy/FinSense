'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/lib/context/FinanceContext';
import { supabase } from '@/lib/supabase'; // Preferred over dynamic import inside the function
import { 
  TrendingUp, 
  Shield, 
  Sparkles, 
  BarChart3, 
  Mail, 
  Loader2, 
  ArrowRight, 
  Lock 
} from 'lucide-react';

const features = [
  { icon: TrendingUp, label: 'Real-time spending tracker', desc: 'See where every peso goes' },
  { icon: Shield, label: 'Smart budget alerts', desc: 'Stay on track automatically' },
  { icon: Sparkles, label: 'AI financial advisor', desc: 'Personalized money insights' },
  { icon: BarChart3, label: 'Visual analytics', desc: 'Beautiful charts & reports' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useFinance();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Client-side Validation (Run this before setting isLoading to true)
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        setError(authError?.message ?? 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // 3. Update Global Context
      setUser({
        id: data.user.id,
        email: data.user.email ?? '',
        name: data.user.user_metadata?.name ?? 'User',
        createdAt: new Date(data.user.created_at), // Uses the actual account creation timestamp
      });

      // 4. Redirect to Dashboard/Onboarding
      router.push('/onboarding');
      
    } catch (err) {
      console.error('Login Error:', err);
      setError('A connection error occurred. Please check your internet.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-950 to-black flex-col justify-between p-12">
        {/* Decorative Mesh Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-white/5 -translate-x-1/3 -translate-y-1/3 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-emerald-400/15 translate-x-1/3 translate-y-1/3 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        </div>

        {/* Brand Identity */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">FinSense</span>
        </div>

        {/* Marketing/Feature Content */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Take control of<br />your finances 💸
            </h1>
            <p className="mt-3 text-white/70 text-base leading-relaxed">
              The smart way for Filipino students to track, budget, and grow their money.
            </p>
          </div>
          
          <div className="space-y-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                  <p className="text-white/60 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/40 text-xs">© 2026 FinSense · Built for students</p>
      </div>

      {/* Right panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        {/* Mobile Logo Overlay */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-primary">FinSense</span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-semibold">Password</label>
                <Link href="/forgot-password" size="sm" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-muted/40 border-border/60 focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in zoom-in-95 duration-200">
                <span role="img" aria-label="error">⚠️</span> {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-primary hover:opacity-90 shadow-lg shadow-primary/20 transition-all rounded-xl active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Registration Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
