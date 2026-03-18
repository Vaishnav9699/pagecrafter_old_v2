'use client';

import { useEffect, useState } from 'react';

export default function PricingPage() {
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        if (status === 'completed') {
            setStatusMsg('Thanks! Your payment is being confirmed. You will get Pro access shortly.');
        } else if (status === 'cancelled') {
            setStatusMsg('Checkout cancelled. You can try again anytime.');
        }
    }, []);

    const startCheckout = async () => {
        setError(null);
        setCreating(true);
        try {
            const res = await fetch('/api/billing/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || 'Unable to start checkout');
            }
            const { checkout_url } = await res.json();
            if (!checkout_url) throw new Error('No checkout_url from API');
            window.location.href = checkout_url;
        } catch (e: any) {
            setError(e.message || 'Failed to create checkout session');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f1117,#111827)', color: 'white' }}>
            <header style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <strong>PageCrafter</strong>
                    </div>
                    <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</a>
                </div>
            </header>

            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontSize: 36, margin: 0, letterSpacing: -0.5 }}>Choose the plan that fits</h1>
                    <p style={{ color: '#94a3b8', marginTop: 10 }}>Upgrade to Pro to unlock the visual editor and advanced features.</p>
                    {statusMsg && <div style={{ marginTop: 16, background: 'rgba(34,197,94,0.12)', color: '#86efac', border: '1px solid rgba(34,197,94,0.25)', padding: '10px 14px', borderRadius: 10 }}>{statusMsg}</div>}
                    {error && <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.12)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.25)', padding: '10px 14px', borderRadius: 10 }}>{error}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Free */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#cbd5e1' }}>Free</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
                            <div style={{ fontSize: 36, fontWeight: 900 }}>$0</div>
                            <div style={{ color: '#94a3b8' }}>/mo</div>
                        </div>
                        <ul style={{ marginTop: 16, paddingLeft: 18, color: '#94a3b8', lineHeight: 1.8 }}>
                            <li>AI chat page generator</li>
                            <li>Basic components</li>
                            <li>Export generated code</li>
                            <li>Community templates</li>
                        </ul>
                        <button
                            onClick={() => (window.location.href = '/')}
                            style={{
                                marginTop: 18, width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                                background: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: 700
                            }}
                        >
                            Continue Free
                        </button>
                    </div>

                    {/* Pro */}
                    <div style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.25),rgba(129,140,248,0.15))', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 16, padding: 24 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#a5b4fc' }}>Pro</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
                            <div style={{ fontSize: 36, fontWeight: 900 }}>$12</div>
                            <div style={{ color: '#a5b4fc' }}>/mo</div>
                        </div>
                        <ul style={{ marginTop: 16, paddingLeft: 18, color: '#e5e7eb', lineHeight: 1.8 }}>
                            <li>Visual Editor unlocked</li>
                            <li>Advanced blocks and pricing sections</li>
                            <li>Priority renders</li>
                            <li>Early features access</li>
                        </ul>
                        <button
                            onClick={startCheckout}
                            disabled={creating}
                            style={{
                                marginTop: 18, width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none',
                                background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: 'white', cursor: 'pointer', fontWeight: 800,
                                opacity: creating ? 0.7 : 1
                            }}
                        >
                            {creating ? 'Starting Checkout...' : 'Upgrade to Pro'}
                        </button>
                        <div style={{ marginTop: 10, color: '#c7d2fe', fontSize: 12 }}>Secure checkout by Dodo Payments</div>
                    </div>
                </div>
            </main>
        </div>
    );
}