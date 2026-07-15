'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading } from '@/components/ui';
import { ScreenWrapper } from '@/components/onboarding/screen-wrapper';
import { useOnboardingStore } from '@/stores/onboarding';
import { filterCities, type CityData } from '@/components/onboarding/cities-data';
import { cn } from '@/lib/utils';

export default function BirthLocationPage() {
  const router = useRouter();
  const {
    birthLocation,
    setBirthLocation,
    setCoordinates,
    setTimezone,
  } = useOnboardingStore();
  const [query, setQuery] = React.useState(birthLocation ?? '');
  const [results, setResults] = React.useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = React.useState<CityData | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedCity(null);
    setIsOpen(true);
    setResults(filterCities(val));
  };

  const handleSelectCity = (city: CityData) => {
    setSelectedCity(city);
    setQuery(city.label);
    setBirthLocation(city.label);
    setCoordinates(city.longitude, city.latitude);
    setTimezone(city.timezone);
    setResults([]);
    setIsOpen(false);
  };

  const handleGenerate = () => {
    if (query && !selectedCity) {
      // Even if no exact match, save whatever they typed
      setBirthLocation(query);
    }
    router.push('/onboarding/generating');
  };

  const handleFocus = () => {
    if (query && results.length === 0 && !selectedCity) {
      setResults(filterCities(query));
    }
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow click on results
    setTimeout(() => setIsOpen(false), 200);
  };

  if (!mounted) return null;

  const canGenerate = !!query;

  return (
    <ScreenWrapper progressDots={{ total: 3, current: 2 }}>
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-sm">
          {/* Question */}
          <Heading
            as="h1"
            variant="serif"
            className="mb-8 text-center text-2xl leading-snug"
          >
            Where were you born?
          </Heading>

          {/* Search input with autocomplete */}
          <div className="relative mb-8">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search for a city..."
              className="block w-full rounded-sm border border-meridian-dust/50 bg-white px-4 py-3 text-lg text-meridian-black placeholder:text-meridian-dust/50 focus:border-meridian-gold focus:outline-none focus:ring-2 focus:ring-meridian-gold/30"
            />

            {/* Dropdown results */}
            {isOpen && results.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-sm border border-meridian-dust/20 bg-white shadow-sm">
                {results.map((city) => (
                  <button
                    key={`${city.city}-${city.country}`}
                    onClick={() => handleSelectCity(city)}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-meridian-smoke',
                      selectedCity?.label === city.label && 'bg-meridian-gold/10',
                    )}
                  >
                    <span className="font-medium text-meridian-black">
                      {city.city}
                    </span>
                    <span className="ml-1 text-meridian-dust">
                      {city.country}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected city info */}
            {selectedCity && (
              <div className="mt-2 text-xs text-meridian-dust">
                {selectedCity.timezone.replace('_', ' ')} ·{' '}
                {Math.abs(selectedCity.latitude).toFixed(1)}°{' '}
                {selectedCity.latitude >= 0 ? 'N' : 'S'},{' '}
                {Math.abs(selectedCity.longitude).toFixed(1)}°{' '}
                {selectedCity.longitude >= 0 ? 'E' : 'W'}
              </div>
            )}
          </div>

          {/* Generate button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            Generate My Chart
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  );
}
