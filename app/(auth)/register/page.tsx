'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/lib/context/FinanceContext';
import { User } from '@/lib/types';
import { TrendingUp, User as UserIcon, Mail, Loader2, ArrowRight, Lock } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useFinance();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!email || !name) { setError('Please fill in all fields'); setIsLoading(false); return; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { setError('Please enter a valid email address'); setIsLoading(false); return; }
      if (name.length < 2) { setError('Name must be at least 2 characters'); setIsLoading(false); return; }
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
      {/* Left panel — form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 order-2 lg:order-1">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base text-gradient">FinSense</span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-fade-up">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Create your account</h2>
            <p className="text-muted-foreground mt-1.5">Free forever · No credit card required</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
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
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-accent to-emerald-600 hover:from-accent/90 hover:to-emerald-600/90 shadow-lg shadow-accent/25 transition-all rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</span>
              ) : (
                <span className="flex items-center gap-2">Get Started Free <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">Sign in →</Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Your data is stored locally on your device only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-950 to-black flex-col justify-between p-12 order-1 lg:order-2">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-teal-300/20 -translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">FinSense</span>
        </div>
        <div className="relative space-y-5">
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Start your financial<br />journey today 🚀
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Join thousands of Filipino students who are taking control of their money with FinSense.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['Track daily expenses', 'Set smart budgets', 'Monitor wallets', 'Get AI advice'].map((item) => (
              <div key={item} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/40 text-xs">© 2025 FinSense · Built for students</p>
      </div>
    </div>
  );
}

