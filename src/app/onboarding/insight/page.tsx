'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text } from '@/components/ui';
import { ElementBarChart } from '@/components/onboarding/element-bar-chart';

const PLACEHOLDER_ELEMENT_DISTRIBUTION = {
  Wood: 15,
  Fire: 25,
  Earth: 10,
  Metal: 35,
  Water: 15,
};

export default function InsightPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
    React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleContinue = () => {
    router.push('/onboarding/preview');
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col bg-meridian-ivory px-6 pt-12 pb-8">
      {/* Top: label */}
      <div className="mx-auto w-full max-w-sm">
        <p className="mb-2 font-sans text-[7pt] uppercase tracking-[0.12em] text-meridian-gold">
          Your Core Pattern
        </p>

        {/* Central: core self identifier */}
        <Heading
          as="h1"
          variant="serif"
          className="mb-1 text-[32px] leading-tight"
        >
          Yin Metal
        </Heading>

        {/* Subtitle */}
        <p className="mb-6 font-serif text-sm italic leading-relaxed text-meridian-dust">
          The Gem Cutter
        </p>

        {/* Body insight text */}
        <Text
          variant="serif"
          size="sm"
          className="mb-8 leading-relaxed text-meridian-ink"
        >
          You process the world through precision. Generic answers frustrate
          you — you&apos;re drawn to what&apos;s specific and correct. This
          has probably created friction with people who move faster than they
          think.
        </Text>

        {/* Element bar chart */}
        <div className="mb-10">
          <p className="mb-4 font-sans text-[7pt] uppercase tracking-[0.12em] text-meridian-dust">
            Elemental Balance
          </p>
          <ElementBarChart distribution={PLACEHOLDER_ELEMENT_DISTRIBUTION} />
        </div>

        {/* CTA button */}
        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="border-meridian-black text-meridian-black hover:bg-meridian-smoke"
          onClick={handleContinue}
        >
          This is oddly accurate → Continue
        </Button>
      </div>
    </div>
  );
}
