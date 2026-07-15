'use client';

import * as React from 'react';
import { useBetaStore } from '@/stores/beta';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function BetaDashboardPage() {
  const betaAccess = useBetaStore((s) => s.betaAccess);
  const inviteCode = useBetaStore((s) => s.inviteCode);
  const referrals = useBetaStore((s) => s.referrals);
  const waitlistPosition = useBetaStore((s) => s.waitlistPosition);

  const [copied, setCopied] = React.useState(false);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://meridian.app';

  const referralLink = inviteCode
    ? `${baseUrl}/beta?ref=${inviteCode}`
    : null;

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(console.error);
  };

  const handleShareTwitter = () => {
    if (!referralLink) return;
    const text = encodeURIComponent(
      `I just got early access to Meridian! Use my code to skip the waitlist: ${inviteCode}\n\n${referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  // Mock leaderboard for MVP
  const leaderboard = [
    { email: 'alex@example.com', referrals: 12 },
    { email: 'sam@example.com', referrals: 8 },
    { email: 'jordan@example.com', referrals: 5 },
  ];

  return (
    <div className="min-h-screen bg-meridian-ivory">
      <main className="mx-auto max-w-md px-5 pt-8 pb-24 animate-page-in">
        <h1 className="font-serif text-[18px] text-meridian-ink font-light tracking-wide">
          Beta Dashboard
        </h1>

        {!betaAccess && !waitlistPosition && (
          <Card variant="ivory" padding="lg" className="mt-6 text-center">
            <p className="font-sans text-[9pt] text-meridian-dust">
              You don&apos;t have beta access yet.
            </p>
            <div className="mt-4">
              <a href="/beta">
                <Button variant="gold" size="md">
                  Join Waitlist
                </Button>
              </a>
            </div>
          </Card>
        )}

        {waitlistPosition && !betaAccess && (
          <Card variant="ivory" padding="md" className="mt-6 text-center">
            <p className="font-serif text-[14px] text-meridian-ink">
              You&apos;re on the waitlist!
            </p>
            <p className="font-mono text-[32px] text-meridian-gold font-medium mt-2">
              #{waitlistPosition}
            </p>
            <p className="font-sans text-[8pt] text-meridian-dust mt-2">
              We&apos;ll email you when it&apos;s your turn.
            </p>
          </Card>
        )}

        {betaAccess && (
          <>
            {/* Access badge */}
            <div className="mt-6">
              <Badge variant="gold" className="text-[9pt] px-3 py-1">
                ✅ You&apos;re in!
              </Badge>
            </div>

            {/* Invite code display */}
            {inviteCode && (
              <p className="font-mono text-[14px] text-meridian-ink mt-3">
                Your invite code: <span className="text-meridian-gold font-medium">{inviteCode}</span>
              </p>
            )}

            {/* Referral section */}
            <Card variant="ivory" padding="md" className="mt-6">
              <p className="font-sans text-[8px] font-bold tracking-[0.09em] uppercase text-meridian-black">
                Referral Link
              </p>
              {referralLink && (
                <p className="font-mono text-[7pt] text-meridian-dust mt-2 break-all">
                  {referralLink}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>

              <Separator className="my-4" />

              <p className="font-sans text-[8px] font-bold tracking-[0.09em] uppercase text-meridian-black">
                Referrals
              </p>
              <p className="font-mono text-[32px] text-meridian-gold font-medium mt-1">
                {referrals}
              </p>

              {/* Leaderboard */}
              <div className="mt-5">
                <p className="font-sans text-[7px] font-bold tracking-[0.09em] uppercase text-meridian-dust mb-2">
                  Leaderboard (top 3)
                </p>
                <div className="space-y-1.5">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={entry.email}
                      className="flex items-center justify-between"
                    >
                      <span className="font-sans text-[8pt] text-meridian-ink">
                        {i + 1}. {entry.email}
                      </span>
                      <span className="font-mono text-[7pt] text-meridian-gold">
                        {entry.referrals} referrals
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Share buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareTwitter}
              >
                Share on Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
