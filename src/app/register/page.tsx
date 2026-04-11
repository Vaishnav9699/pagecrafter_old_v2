'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FeatureAnimation from '../components/FeatureAnimation';

export default function RegisterPage() {
    const { signUp, user, loading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        const { error } = await signUp(email, password);

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            setSuccess(true);
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-900/40"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"></div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-[#0a0a0c]">
                <FeatureAnimation />
                <div className="relative z-10 w-full max-w-md text-center animate-fade-in">
                    <div
                        className="rounded-2xl overflow-hidden p-10"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                        }}
                    >
                        {/* Top shimmer */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                            <svg className="h-9 w-9 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                        <p className="text-sm text-gray-500 mb-8">
                            We&apos;ve sent a confirmation link to{' '}
                            <strong className="text-gray-300">{email}</strong>.{' '}
                            Please click the link to activate your account.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block w-full py-3.5 px-4 text-white font-semibold rounded-xl transition-all duration-300"
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
                            }}
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-[#0a0a0c]">
            <FeatureAnimation />

            {/* Ambient glow blobs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-4xl font-black tracking-tight gradient-text mb-1">PageCrafter AI</h1>
                    <p className="text-gray-500 text-sm font-medium tracking-wide">Create your account — it&apos;s free</p>
                </div>

                {/* Glass Card */}
                <div
                    className="relative rounded-2xl overflow-hidden animate-fade-in"
                    style={{
                        animationDelay: '0.1s',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Top shimmer line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                    <div className="p-8 sm:p-10">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-500/8 border border-red-500/20 animate-fade-in">
                                <svg className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-red-400">{error}</span>
                            </div>
                        )}

                        {/* Register Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                    Email Address
                                </label>
                                <div
                                    className="relative rounded-xl transition-all duration-300"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: emailFocused
                                            ? '1px solid rgba(99,102,241,0.7)'
                                            : '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: emailFocused
                                            ? '0 0 0 3px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
                                            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                                    }}
                                >
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none rounded-xl"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                    Password
                                </label>
                                <div
                                    className="relative rounded-xl transition-all duration-300"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: passwordFocused
                                            ? '1px solid rgba(99,102,241,0.7)'
                                            : '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: passwordFocused
                                            ? '0 0 0 3px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
                                            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                                    }}
                                >
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        required
                                        minLength={6}
                                        className="w-full pl-11 pr-12 py-3.5 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none rounded-xl"
                                        placeholder="Min 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-600 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                    Confirm Password
                                </label>
                                <div
                                    className="relative rounded-xl transition-all duration-300"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: confirmFocused
                                            ? '1px solid rgba(99,102,241,0.7)'
                                            : confirmPassword && password && confirmPassword !== password
                                                ? '1px solid rgba(239,68,68,0.5)'
                                                : confirmPassword && password && confirmPassword === password
                                                    ? '1px solid rgba(34,197,94,0.5)'
                                                    : '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: confirmFocused
                                            ? '0 0 0 3px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
                                            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                                    }}
                                >
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onFocus={() => setConfirmFocused(true)}
                                        onBlur={() => setConfirmFocused(false)}
                                        required
                                        minLength={6}
                                        className="w-full pl-11 pr-12 py-3.5 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none rounded-xl"
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-600 hover:text-gray-300 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {/* Password match indicator */}
                                {confirmPassword && password && (
                                    <p className={`text-xs mt-1 transition-all duration-200 ${confirmPassword === password ? 'text-green-400' : 'text-red-400'}`}>
                                        {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className={`transition-all duration-500 overflow-hidden ${email && password && confirmPassword ? 'opacity-100 max-h-20 mt-6 translate-y-0' : 'opacity-0 max-h-0 translate-y-4 pointer-events-none'}`}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-4 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                        boxShadow: '0 8px 32px rgba(79,70,229,0.35), 0 2px 8px rgba(0,0,0,0.3)',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(79,70,229,0.55), 0 2px 8px rgba(0,0,0,0.3)';
                                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(79,70,229,0.35), 0 2px 8px rgba(0,0,0,0.3)';
                                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <p className="text-sm text-gray-600 mb-3">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs text-gray-700 hover:text-gray-400 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to PageCrafter
                    </Link>
                </div>
            </div>
        </div>
    );
}
