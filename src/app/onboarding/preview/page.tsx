'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text } from '@/components/ui';
import { cn } from '@/lib/utils';

const CARDS = [
  {
    title: 'Daily Energy Reading',
    description:
      'Every morning, a new reading of your energy — tailored to who you are.',
    placeholder: 'Today Hub',
  },
  {
    title: 'Pattern Recognition',
    description:
      'The more you check in, the more it understands your actual patterns — not generic advice.',
    placeholder: 'Coach Feed',
  },
  {
    title: 'Your Long-Term Story',
    description:
      'In 6 months, look back and see exactly how far you&apos;ve come.',
    placeholder: '180-Day Report',
  },
];

export default function PreviewPage() {
  const router = useRouter();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.clientWidth;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, CARDS.length - 1));
  };

  const handleContinue = () => {
    router.push('/onboarding/trial');
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col bg-meridian-ivory pt-10 pb-8">
      {/* Cards carousel */}
      <div className="flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="flex w-full flex-shrink-0 snap-center flex-col justify-center px-8"
            >
              <div className="mx-auto w-full max-w-sm">
                {/* Screenshot placeholder */}
                <div className="mb-6 flex h-48 items-center justify-center rounded-sm border border-meridian-dust/20 bg-meridian-smoke/50 sm:h-56">
                  <span className="font-mono text-xs text-meridian-dust">
                    {card.placeholder}
                  </span>
                </div>

                {/* Card text */}
                <Heading
                  as="h2"
                  variant="serif"
                  className="mb-3 text-xl leading-snug"
                >
                  {card.title}
                </Heading>
                <Text
                  variant="sans"
                  size="sm"
                  muted
                  className="leading-relaxed"
                >
                  {card.description}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: dots indicator + continue button */}
      <div className="px-6 pt-6">
        <div className="mx-auto mb-6 flex max-w-sm items-center justify-center gap-2">
          {CARDS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-6 bg-meridian-gold'
                  : 'bg-meridian-dust/40',
              )}
            />
          ))}
        </div>

        <div className="mx-auto w-full max-w-sm">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
          >
            {activeIndex < CARDS.length - 1 ? 'Swipe to learn more →' : 'Looks great →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
