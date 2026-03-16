'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/lib/context/FinanceContext';
import { User } from '@/lib/types';
import { TrendingUp, Shield, Sparkles, BarChart3, User as UserIcon, Mail, Loader2, ArrowRight } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!email || !name) { setError('Please fill in all fields'); setIsLoading(false); return; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { setError('Please enter a valid email address'); setIsLoading(false); return; }
      const user: User = { id: `user_${Date.now()}`, email, name, createdAt: new Date() };
      setUser(user);
      router.push('/onboarding');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-950 to-black flex-col justify-between p-12">
        {/* Mesh blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-white/5 -translate-x-1/3 -translate-y-1/3 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-emerald-400/15 translate-x-1/3 translate-y-1/3 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        </div>
        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">FinSense</span>
        </div>
        {/* Headline */}
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
        {/* Footer */}
        <p className="relative text-white/40 text-xs">© 2025 FinSense · Built for students</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base text-gradient">FinSense</span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-fade-up">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan dela Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-muted/40 border-border/60 focus:bg-background"
                />
              </div>
            </div>
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
                  className="pl-10 h-11 bg-muted/40 border-border/60 focus:bg-background"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                <span>⚠</span> {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25 transition-all rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
