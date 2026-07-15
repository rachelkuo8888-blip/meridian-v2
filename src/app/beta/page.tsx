'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useBetaStore } from '@/stores/beta';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function BetaPage() {
  const [email, setEmail] = React.useState('');
  const [inviteCodeInput, setInviteCodeInput] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [codeVerifying, setCodeVerifying] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [showInviteInput, setShowInviteInput] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const betaAccess = useBetaStore((s) => s.betaAccess);
  const waitlistPosition = useBetaStore((s) => s.waitlistPosition);
  const requestInvite = useBetaStore((s) => s.requestInvite);
  const verifyCode = useBetaStore((s) => s.verifyCode);

  const handleRequestInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/beta/request-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        requestInvite(email.trim());
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const code = inviteCodeInput.trim().toUpperCase();
    if (!code) {
      setError('Please enter your invite code');
      return;
    }

    if (!/^MER-[A-Z0-9]{4}$/.test(code)) {
      setError('Invalid code format. Expected: MER-XXXX');
      return;
    }

    setCodeVerifying(true);
    try {
      const valid = await verifyCode(code);
      if (valid) {
        setMessage('Welcome to the Meridian Beta!');
      } else {
        setError('Invalid invite code');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setCodeVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-meridian-ivory">
      <main className="mx-auto max-w-md px-5 pt-12 pb-24 animate-page-in">
        {/* Header */}
        <h1 className="font-serif text-[18px] text-center text-meridian-ink font-light tracking-wide">
          Meridian Beta
        </h1>
        <p className="font-serif text-[14px] text-center text-meridian-ink/70 mt-3 leading-relaxed">
          Discover your energy. Know the pattern. Navigate the path.
        </p>

        {/* Already have access? */}
        {betaAccess && (
          <Card variant="elevated" padding="md" className="mt-8 text-center">
            <p className="font-serif text-[16px] text-meridian-black">
              ✅ You already have beta access!
            </p>
            <p className="mt-2 font-sans text-[9pt] text-meridian-dust">
              <a href="/beta/dashboard" className="text-meridian-gold underline">
                Go to Beta Dashboard →
              </a>
            </p>
          </Card>
        )}

        {!betaAccess && waitlistPosition && (
          <Card variant="ivory" padding="md" className="mt-8 text-center">
            <p className="font-serif text-[14px] text-meridian-ink">
              You&apos;re on the waitlist!
            </p>
            <p className="font-mono text-[24px] text-meridian-gold font-medium mt-1">
              #{waitlistPosition}
            </p>
            <p className="font-sans text-[8pt] text-meridian-dust mt-1">
              We&apos;ll email you when it&apos;s your turn.
            </p>
          </Card>
        )}

        {/* Waitlist form (if no beta access and not on waitlist) */}
        {!betaAccess && !waitlistPosition && (
          <>
            <form onSubmit={handleRequestInvite} className="mt-8">
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={cn(
                    'w-full bg-surface border rounded-sm px-4 py-3',
                    'font-sans text-sm text-meridian-ink placeholder:text-meridian-dust',
                    'focus:outline-none focus:ring-2 focus:ring-meridian-gold focus:ring-offset-2',
                    'border-meridian-dust/50',
                  )}
                />
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  fullWidth
                  loading={submitting}
                >
                  Get Early Access
                </Button>
              </div>
            </form>

            {/* Live counter */}
            <p className="font-mono text-[10px] text-center text-meridian-dust mt-4">
              ⏳ 247 people ahead
            </p>
          </>
        )}

        {/* Feature highlights */}
        {!betaAccess && (
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto flex items-center justify-center text-lg">
                ✨
              </div>
              <p className="font-sans text-[8px] font-medium text-meridian-ink mt-1 tracking-wide uppercase">
                Daily Energy
              </p>
              <p className="font-sans text-[8px] text-meridian-dust mt-0.5">
                Know your flow
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto flex items-center justify-center text-lg">
                🔒
              </div>
              <p className="font-sans text-[8px] font-medium text-meridian-ink mt-1 tracking-wide uppercase">
                Private
              </p>
              <p className="font-sans text-[8px] text-meridian-dust mt-0.5">
                Your data stays yours
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto flex items-center justify-center text-lg">
                🚀
              </div>
              <p className="font-sans text-[8px] font-medium text-meridian-ink mt-1 tracking-wide uppercase">
                Free Trial
              </p>
              <p className="font-sans text-[8px] text-meridian-dust mt-0.5">
                No credit card
              </p>
            </div>
          </div>
        )}

        {/* Invite code toggle */}
        {!betaAccess && !waitlistPosition && (
          <div className="mt-10 text-center">
            {!showInviteInput ? (
              <button
                type="button"
                onClick={() => setShowInviteInput(true)}
                className="font-sans text-[9pt] text-meridian-gold underline underline-offset-4 hover:text-meridian-ink transition-colors"
              >
                Have a code? Enter invite code
              </button>
            ) : (
              <form onSubmit={handleVerifyCode} className="mt-2">
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    placeholder="MER-XXXX"
                    className={cn(
                      'w-full bg-surface border rounded-sm px-4 py-3 text-center',
                      'font-mono text-sm text-meridian-ink placeholder:text-meridian-dust',
                      'focus:outline-none focus:ring-2 focus:ring-meridian-gold focus:ring-offset-2',
                      'border-meridian-dust/50',
                    )}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="md"
                    fullWidth
                    loading={codeVerifying}
                  >
                    Verify Code
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteInput(false);
                    setInviteCodeInput('');
                  }}
                  className="font-sans text-[8pt] text-meridian-dust mt-2 hover:text-meridian-ink transition-colors"
                >
                  ← Join waitlist instead
                </button>
              </form>
            )}
          </div>
        )}

        {/* Message / Error */}
        {message && (
          <p className="font-sans text-[9pt] text-center text-emerald-600 mt-4">
            {message}
          </p>
        )}
        {error && (
          <p className="font-sans text-[9pt] text-center text-red-500 mt-4">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
